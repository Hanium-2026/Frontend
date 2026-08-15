import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';
import TrustChart from './TrustChart';
import IMUTrace from './IMUTrace';
import { STATIONARY_ACC_STD, STATIONARY_GYRO_AVG } from '../ml/gaitPreprocess';
import { SUSPECT_ON, SUSPECT_OFF } from '../ml/useGaitPipeline';

// 시연 모드 — 화면 녹화 전용 진단 패널.
// ⚠️ 사용자(어르신) 화면이 아니다. 그래서 의도적으로:
//   · 노인 친화 타입스케일(T.fs)을 따르지 않고, 전역 글씨 배율(components/Text)도 적용하지 않는다
//     (배율이 커지면 "스크롤 없이 한 화면"이라는 이 화면의 요구사항이 깨진다).
//   · Modal이 아니라 절대배치 오버레이다 — 안드로이드에서 Modal은 별도 윈도우라
//     useSafeAreaInsets가 0을 반환해 하단 내비게이션 바에 버튼이 먹힌다.
//
// 표시 원칙: 큰 숫자 하나 + 짧은 라벨. 읽어도 이해 안 되는 설명 문구는 넣지 않는다
//   (예: "100샘플 × 10특징" 같은 건 말로 설명할 내용이지 화면에 넣을 내용이 아니다).
// 보여주는 것 = ① 어떤 데이터가 들어오는가 ② 지금 무슨 상태인가 ③ 왜 이 점수인가.

// 단계 타일 (센서 / 1차 / 2차). active=false면 회색으로 죽여 "지금 안 도는 단계"를 드러낸다.
function Stage({ no, title, main, sub, active, tone }) {
  return (
    <View style={{
      flex: 1, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 10,
      backgroundColor: active ? T.blueWash : T.line,
      borderWidth: 1, borderColor: active ? T.blueSoft : T.hair,
    }}>
      <Text style={{ fontSize: 11, fontFamily: T.fontBold, color: active ? T.blue : T.muted }}>{no} {title}</Text>
      <Text numberOfLines={1} style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: active ? (tone || T.blue) : T.muted, marginTop: 2 }}>{main}</Text>
      <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: T.fontSemiBold, color: T.muted, marginTop: 1 }}>{sub}</Text>
    </View>
  );
}

// P(이상) 막대 — 이 화면의 핵심. 원값(●)·평활값(▮)·히스테리시스 전환대를 한 줄에 겹쳐 보여준다.
function ProbBar({ pRaw, pSmooth }) {
  const [w, setW] = useState(0);
  const H = 18, PAD = 5;
  const inner = Math.max(0, w - PAD * 2);
  const x = (p) => PAD + Math.min(1, Math.max(0, p)) * inner;
  return (
    <View onLayout={(e) => { const nw = e.nativeEvent.layout.width; if (nw && Math.abs(nw - w) > 1) setW(nw); }}
      style={{ width: '100%', height: H + 10 }}>
      {w > 0 && (
        <Svg width={w} height={H + 10}>
          <Rect x={PAD} y={4} width={inner} height={H} rx={9} fill={T.line}/>
          {/* 히스테리시스 전환대 — 이 구간에서는 직전 라벨을 유지한다 */}
          <Rect x={x(SUSPECT_OFF)} y={4} width={x(SUSPECT_ON) - x(SUSPECT_OFF)} height={H} fill={T.caution} opacity={0.4}/>
          {/* 평활값 — 실제 판정에 쓰이는 값 */}
          {pSmooth != null && <Rect x={x(pSmooth) - 2.5} y={0} width={5} height={H + 8} rx={2.5} fill={T.blue}/>}
          {/* 원값 — 매 윈도우 모델 출력 그대로 */}
          {pRaw != null && <Circle cx={x(pRaw)} cy={4 + H / 2} r={6} fill={pRaw >= 0.5 ? T.danger : T.ok} stroke="#fff" strokeWidth={2}/>}
        </Svg>
      )}
    </View>
  );
}

// 카드 공통 — 시연 모드는 그림자 없이 얇은 테두리로 밀도만 확보한다.
const card = { backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.line };
const fmt = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d));

export default function DemoMonitor({ live, onClose, onFinish }) {
  const insets = useSafeAreaInsets();
  const [chartH, setChartH] = useState(0);
  const {
    mmss, walkWindows, minWindows, result, score, riskLevel, pRaw, pSmooth,
    chartData, avgScore, minScore, trace,
    steps, distanceM, cadenceLive, metrics,
  } = live;

  // 점수·P는 마지막 걷기 값을 유지한다(정지 중 값이 사라지면 녹화 화면이 초기화된 것처럼 보임).
  // "지금 판정 중인지"는 ③ 타일의 점등 여부로 구분된다.
  const state = result?.activityState;
  const walking = state === 'WALKING';
  const stationary = state === 'STATIONARY';
  const suspected = riskLevel === 'SUSPECTED';

  const stage1 = !result ? { main: '대기', sub: '—' }
    : stationary ? { main: '정지', sub: result.activityConfidence != null ? `${Math.round(result.activityConfidence * 100)}%` : '휴리스틱' }
    : { main: result.activityClass === 'walking' ? '걷기' : (result.activityClass || '—'),
        sub: `${Math.round((result.activityConfidence ?? 0) * 100)}% · ${Math.round(result.ms1 ?? 0)}ms` };

  const stage2 = walking
    ? { main: suspected ? '이상' : '정상', sub: `${Math.round(result.ms2 ?? 0)}ms` }
    : { main: '생략', sub: stationary ? '걷지 않음' : '보행 아님' };

  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
      backgroundColor: T.bg,
      paddingTop: insets.top + 6,
      paddingBottom: Math.max(insets.bottom, 12) + 4,   // 안드로이드 내비게이션 바
      paddingHorizontal: 12,
    }}>

      {/* 헤더 — 경과시간 · 걷기 윈도우 수(저신뢰 기준 미만이면 주황) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 32 }}>
        <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: T.ink }}>시연 모드</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.body }}>{mmss}</Text>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: walkWindows < minWindows ? T.caution : T.body }}>
            윈도우 {walkWindows}
          </Text>
          <Pressable onPress={onClose} hitSlop={10} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 9, backgroundColor: T.blueSoft }}>
            <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.blue }}>닫기</Text>
          </Pressable>
        </View>
      </View>

      {/* ① 파이프라인 — 멈추면 ③이 꺼진다. 시연에서 몸으로 조종하는 부분. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Stage no="①" title="센서" main="50Hz" sub="6축" active tone={T.ok}/>
        <Text style={{ fontSize: 15, color: T.muted }}>›</Text>
        <Stage no="②" title="1차 게이트" main={stage1.main} sub={stage1.sub} active={!!result}/>
        <Text style={{ fontSize: 15, color: T.muted }}>›</Text>
        <Stage no="③" title="2차 판정" main={stage2.main} sub={stage2.sub} active={walking} tone={suspected ? T.danger : T.ok}/>
      </View>

      {/* 점수 + 산출식 — 블랙박스가 아니라 명시적 변환임을 보여준다 */}
      <View style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
        <View style={{ alignItems: 'center', minWidth: 60 }}>
          <Text style={{ fontSize: 42, lineHeight: 46, fontFamily: T.fontExtraBold, color: suspected ? T.danger : T.ink, letterSpacing: -1 }}>
            {score != null ? score : '--'}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: T.fontSemiBold, color: T.muted }}>걸음 점수</Text>
        </View>
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontFamily: T.fontBold, color: T.body }}>
          = (1 − {fmt(pSmooth, 3)}) × 100
        </Text>
        <View style={{ paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9, backgroundColor: suspected ? T.dangerSoft : T.okSoft }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontExtraBold, color: suspected ? T.danger : T.ok }}>
            {suspected ? '이상 의심' : '정상'}
          </Text>
        </View>
      </View>

      {/* ★ P(이상) — 원값은 튀어도 평활값이 전환대를 넘어야 라벨이 바뀐다 */}
      <View style={{ ...card, marginTop: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>P(이상)</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.body }}>원 ● {fmt(pRaw, 2)}</Text>
            <Text style={{ fontSize: 15, fontFamily: T.fontExtraBold, color: T.blue }}>평활 ▮ {fmt(pSmooth, 2)}</Text>
          </View>
        </View>
        <ProbBar pRaw={pRaw} pSmooth={pSmooth}/>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.muted }}>0 정상</Text>
          <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: T.caution }}>전환대</Text>
          <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.muted }}>이상 1</Text>
        </View>
      </View>

      {/* 점수 추이 — 남는 세로 공간을 전부 먹어 어떤 기기에서도 한 화면에 들어가게 한다 */}
      <View style={{ ...card, flex: 1, minHeight: 88, marginTop: 8, paddingVertical: 10, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>점수 추이</Text>
          <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted }}>평균 {avgScore ?? '—'} · 최저 {minScore ?? '—'}</Text>
        </View>
        <View style={{ flex: 1, marginTop: 4 }}
          onLayout={(e) => { const h = Math.round(e.nativeEvent.layout.height); if (h && h !== chartH) setChartH(h); }}>
          {chartData.length >= 2 && chartH > 0
            ? <TrustChart data={chartData} avg={avgScore} height={chartH}/>
            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontFamily: T.fontMedium, color: T.muted }}>걷기 시작 시 그래프가 그려집니다</Text>
              </View>}
        </View>
      </View>

      {/* IMU 원신호 + 정지 게이트 실측치 — "왜 정지로 판정했는지"를 숫자로 */}
      <View style={{ ...card, marginTop: 8, paddingVertical: 10, paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>IMU (g)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: (result?.accStd ?? 0) >= STATIONARY_ACC_STD ? T.ok : T.muted }}>
              acc {fmt(result?.accStd, 3)}／{STATIONARY_ACC_STD}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: (result?.gyroAvg ?? 0) >= STATIONARY_GYRO_AVG ? T.ok : T.muted }}>
              gyro {fmt(result?.gyroAvg, 3)}／{STATIONARY_GYRO_AVG}
            </Text>
          </View>
        </View>
        <IMUTrace height={20} color={T.blue} data={trace.x}/>
        <IMUTrace height={20} color="#7B5BD9" data={trace.y}/>
        <IMUTrace height={20} color={T.ok} data={trace.z}/>
      </View>

      {/* 보조 지표 — 점수의 입력이 아니라 '함께 관찰된 보행 특성'이다 */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {[
          ['걸음', String(steps)],
          ['거리', `${distanceM}m`],
          ['리듬', cadenceLive != null ? String(cadenceLive) : '—'],
          ['규칙성', metrics ? `${metrics.variability}%` : '—'],
          ['대칭', metrics ? String(metrics.symmetry) : '—'],
        ].map(([l, v], k) => (
          <View key={k} style={{ ...card, flex: 1, borderRadius: 11, paddingVertical: 7, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontFamily: T.fontSemiBold, color: T.muted }}>{l}</Text>
            <Text numberOfLines={1} style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.5 }}>{v}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={onFinish}
        style={({ pressed }) => ({ height: 50, marginTop: 8, borderRadius: 13, backgroundColor: pressed ? T.blueDark : T.blue, alignItems: 'center', justifyContent: 'center' })}>
        <Text style={{ fontSize: 17, fontFamily: T.fontExtraBold, color: '#fff' }}>측정 완료</Text>
      </Pressable>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text as RNText, Pressable } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';
import TrustChart from './TrustChart';
import { SUSPECT_ON, SUSPECT_OFF } from '../ml/useGaitPipeline';

// OS 글씨 배율 무시(allowFontScaling=false) — 이 화면은 "스크롤 없이 한 화면"이 요구사항이라
// 기기 접근성 글자 크기 설정과 무관하게 고정 크기로 렌더링해야 한다. 아래 Text는 전부 이걸 통한다.
const Text = (props) => <RNText allowFontScaling={false} {...props} />;

// 시연 모드 — 화면 녹화 전용 진단 패널.
// ⚠️ 사용자(어르신) 화면이 아니다. 그래서 의도적으로:
//   · 노인 친화 타입스케일(T.fs)을 따르지 않고, 전역 글씨 배율(components/Text)도 적용하지 않는다
//     (배율이 커지면 "스크롤 없이 한 화면"이라는 이 화면의 요구사항이 깨진다).
//   · Modal이 아니라 절대배치 오버레이다 — 안드로이드에서 Modal은 별도 윈도우라
//     useSafeAreaInsets가 0을 반환해 하단 내비게이션 바에 버튼이 먹힌다.
//
// 표시 원칙: 큰 숫자 하나 + 짧은 라벨. 읽어도 이해 안 되는 설명 문구는 넣지 않는다.
// 청중은 몇 초 훑어보는 심사자다 — "온디바이스 AI가 실시간으로 돈다"는 게 3초 안에 읽혀야 한다.
// (개발자용 세부 진단은 여기서 뺐다: IMU 원신호 파형, 윈도우 카운트, 보조지표(대칭·규칙성) — 추정치라 신뢰도 낮아 제거.)

// 단계 타일 (센서 / 1차 / 2차). active=false면 회색으로 죽여 "지금 안 도는 단계"를 드러낸다.
function Stage({ no, title, main, sub, active, tone }) {
  return (
    <View style={{
      flex: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 8,
      backgroundColor: active ? T.blueWash : T.line,
      borderWidth: 1, borderColor: active ? T.blueSoft : T.hair,
    }}>
      <Text style={{ fontSize: 10, fontFamily: T.fontBold, color: active ? T.blue : T.muted }}>{no} {title}</Text>
      <Text numberOfLines={1} style={{ fontSize: 17, fontFamily: T.fontExtraBold, color: active ? (tone || T.blue) : T.muted, marginTop: 2 }}>{main}</Text>
      <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: T.fontSemiBold, color: T.muted, marginTop: 1 }}>{sub}</Text>
    </View>
  );
}

// P(이상) 막대 — 이 화면의 핵심. 원값(●)·평활값(▮)·히스테리시스 전환대를 한 줄에 겹쳐 보여준다.
function ProbBar({ pRaw, pSmooth }) {
  const [w, setW] = useState(0);
  const H = 16, PAD = 4;
  const inner = Math.max(0, w - PAD * 2);
  const x = (p) => PAD + Math.min(1, Math.max(0, p)) * inner;
  return (
    <View onLayout={(e) => { const nw = e.nativeEvent.layout.width; if (nw && Math.abs(nw - w) > 1) setW(nw); }}
      style={{ width: '100%', height: H + 8 }}>
      {w > 0 && (
        <Svg width={w} height={H + 8}>
          <Rect x={PAD} y={(H + 8 - H) / 2} width={inner} height={H} rx={8} fill={T.line}/>
          {/* 히스테리시스 전환대 — 이 구간에서는 직전 라벨을 유지한다 */}
          <Rect x={x(SUSPECT_OFF)} y={(H + 8 - H) / 2} width={x(SUSPECT_ON) - x(SUSPECT_OFF)} height={H} fill={T.caution} opacity={0.4}/>
          {/* 평활값 — 실제 판정에 쓰이는 값 */}
          {pSmooth != null && <Rect x={x(pSmooth) - 2} y={0} width={4} height={H + 8} rx={2} fill={T.blue}/>}
          {/* 원값 — 매 윈도우 모델 출력 그대로 */}
          {pRaw != null && <Circle cx={x(pRaw)} cy={(H + 8) / 2} r={5} fill={pRaw >= 0.5 ? T.danger : T.ok} stroke="#fff" strokeWidth={2}/>}
        </Svg>
      )}
    </View>
  );
}

// 카드 공통 — 시연 모드는 그림자 없이 얇은 테두리로 밀도만 확보한다.
const card = { backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.line };

export default function DemoMonitor({ live, onClose, onFinish }) {
  const insets = useSafeAreaInsets();
  const [chartH, setChartH] = useState(0);
  const {
    mmss, result, score, riskLevel, pRaw, pSmooth,
    chartData, avgScore, minScore,
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

      {/* 헤더 — 온디바이스 AI라는 핵심을 텍스트로 명시. 개발자용 윈도우 카운트는 뺐다. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: T.ink }}>AI 실시간 분석</Text>
          <Text style={{ fontSize: 11, fontFamily: T.fontMedium, color: T.muted, marginTop: 1 }}>휴대폰 안에서 처리 · 서버 전송 없음</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.body }}>{mmss}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={{ paddingHorizontal: 11, paddingVertical: 5, borderRadius: 9, backgroundColor: T.blueSoft }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.blue }}>닫기</Text>
          </Pressable>
        </View>
      </View>

      {/* 파이프라인 — ①에 GPS를 흡수(따로 카드 만들지 않음, 실제 검증된 로직만 결과 배지로 표시). */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
        <Stage no="①" title="센서" main="50Hz" sub="IMU+GPS" active tone={T.ok}/>
        <Text style={{ fontSize: 13, color: T.muted }}>›</Text>
        <Stage no="②" title="1차" main={stage1.main} sub={stage1.sub} active={!!result}/>
        <Text style={{ fontSize: 13, color: T.muted }}>›</Text>
        <Stage no="③" title="2차" main={stage2.main} sub={stage2.sub} active={walking} tone={suspected ? T.danger : T.ok}/>
      </View>

      {/* 판정 카드 — 점수+배지 / P(이상) 막대(히스테리시스 전환대 포함)를 한 카드에 (별도 카드로 안 쪼갬) */}
      {/* 산출식·원값/평활값 텍스트는 뺐다 — 막대가 같은 정보를 이미 보여준다(Figma verdict-card 확정) */}
      <View style={{ ...card, marginTop: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', minWidth: 55 }}>
            <Text style={{ fontSize: 38, lineHeight: 42, fontFamily: T.fontExtraBold, color: suspected ? T.danger : T.ink, letterSpacing: -1 }}>
              {score != null ? score : '--'}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: T.fontSemiBold, color: T.muted }}>걸음 점수</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: suspected ? T.dangerSoft : T.okSoft }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontExtraBold, color: suspected ? T.danger : T.ok }}>
              {suspected ? '이상 의심' : '정상'}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 8 }}>
          <ProbBar pRaw={pRaw} pSmooth={pSmooth}/>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 10, fontFamily: T.fontSemiBold, color: T.muted }}>0 정상</Text>
          <Text style={{ fontSize: 10, fontFamily: T.fontBold, color: T.caution }}>전환대</Text>
          <Text style={{ fontSize: 10, fontFamily: T.fontSemiBold, color: T.muted }}>이상 1</Text>
        </View>
      </View>

      {/* 점수 추이 — 남는 세로 공간을 전부 먹어 어떤 기기에서도 한 화면에 들어가게 한다 */}
      <View style={{ ...card, flex: 1, minHeight: 88, marginTop: 8, paddingVertical: 10, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>점수 추이</Text>
          <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.muted }}>평균 {avgScore ?? '—'} · 최저 {minScore ?? '—'}</Text>
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

      <Pressable onPress={onFinish}
        style={({ pressed }) => ({ height: 48, marginTop: 8, borderRadius: 13, backgroundColor: pressed ? T.blueDark : T.blue, alignItems: 'center', justifyContent: 'center' })}>
        <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: '#fff' }}>측정 완료</Text>
      </Pressable>
    </View>
  );
}

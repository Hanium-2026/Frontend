import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import IMUTrace from '../../components/IMUTrace';
import SparkLine from '../../components/SparkLine';
import { useGaitPipeline } from '../../ml/useGaitPipeline';
import { sessionStore } from '../../store/sessionStore';
import { tokenStore } from '../../store/tokenStore';
import { ensureSession, uploadData, stopSession, uploadAnalysis, toMinuteAt } from '../../api/session';
import { riskTone } from '../../risk';

const WINDOW = 128;   // 2.56초 @ 50Hz
const STRIDE = 64;    // 1.28초마다 분석
const HZ_MS = 20;     // ~50Hz

// 분 버킷 → 백엔드 MinuteData 형식
const aggregateMinute = (m) => ({
  minuteAt: m.key,
  avgScore: Math.round(m.scores.reduce((x, y) => x + y, 0) / m.scores.length),
  minScore: Math.round(Math.min(...m.scores)),
  maxScore: Math.round(Math.max(...m.scores)),
  dangerCount: m.danger,
});

const ACTIVITY_LABELS = {
  downstairs: '계단 내려감',
  running: '뛰기',
  sitting: '앉음',
  standing: '서 있음',
  upstairs: '계단 오름',
  walking: '걷기',
  stationary: '정지',
};

const formatActivity = (result) => {
  const activity = result?.activityClass;
  if (!activity) return '대기';
  const label = ACTIVITY_LABELS[activity] ?? activity;
  const confidence = typeof result?.activityConfidence === 'number'
    ? ` ${Math.round(result.activityConfidence * 100)}%`
    : '';
  return `${label}${confidence}`;
};

// 파랑 히어로 위에서 잘 보이는 밝은 위험도 톤 (ElderResult와 동일 팔레트)
const TONE_DOT = { ok: '#86E3C1', caution: '#FFB4A2', danger: '#FCA5A5', idle: 'rgba(255,255,255,0.6)' };

const RING = 220;
const R = 96;
const CIRC = 2 * Math.PI * R; // 603.2

export default function ElderMeasure() {
  const router = useRouter();

  const bufRef = useRef([]);          // [[ax,ay,az,gx,gy,gz], ...]
  const gyroRef = useRef([0, 0, 0]);  // 최신 자이로
  const sinceRef = useRef(0);         // 마지막 전송 이후 쌓인 샘플 수
  const accRef = useRef({ scores: [], cadences: [], suspected: 0 });  // 세션 누적(걷기만)

  // on-device 추론 파이프라인(1차 동작분류 → 2차 정상/이상). dev build에서만 모델 로드됨.
  const { ready: modelReady, error: modelError, analyze } = useGaitPipeline();
  const analyzeRef = useRef(null);
  useEffect(() => { analyzeRef.current = analyze; });
  useEffect(() => {
    if (modelError) setStatus('모델 로드 실패 — 개발 빌드 필요');
    else if (modelReady) setStatus('걸으면 측정이 시작돼요');
  }, [modelReady, modelError]);

  // 백엔드 세션 연동(로그인된 WARD만). 점수 계산은 AI 서버, 분당 집계만 백엔드로 업로드.
  const useBackend = tokenStore.isLoggedIn() && tokenStore.getRole() === 'WARD';
  const sessionIdRef = useRef(null);
  const minuteRef = useRef({ key: null, scores: [], danger: 0 });  // 현재 분 버킷

  const [result, setResult] = useState(null);   // {score, riskLevel, error, ratio}
  const [count, setCount] = useState(0);         // 분석한 윈도우 수
  const [status, setStatus] = useState('센서 준비 중...');
  const [trace, setTrace] = useState({ x: null, y: null, z: null });  // 실시간 3축 파형
  const [showSignal, setShowSignal] = useState(false);  // 측정 신호(파형) 펼침 — 기본 숨김
  const [scoreHist, setScoreHist] = useState([]);  // 걷기 점수 이력(라이브 그래프)
  const [elapsed, setElapsed] = useState(0);       // 측정 경과 시간(초)

  // 측정 화면 진입 시 세션 확보(진행 중이면 복원, 없으면 시작). 실패해도 측정은 계속.
  useEffect(() => {
    if (!useBackend) return;
    let alive = true;
    ensureSession()
      .then((s) => { if (alive) sessionIdRef.current = s?.sessionId ?? null; })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(HZ_MS);
    Gyroscope.setUpdateInterval(HZ_MS);

    const gSub = Gyroscope.addListener(({ x, y, z }) => {
      gyroRef.current = [x, y, z];
    });

    const aSub = Accelerometer.addListener(({ x, y, z }) => {
      const [gx, gy, gz] = gyroRef.current;
      const buf = bufRef.current;
      buf.push([x, y, z, gx, gy, gz]);
      if (buf.length > 256) buf.splice(0, buf.length - 256);  // 메모리 캡 (슬라이딩)
      sinceRef.current += 1;

      if (buf.length >= WINDOW && sinceRef.current >= STRIDE) {
        sinceRef.current = 0;
        const win = buf.slice(buf.length - WINDOW);
        const run = analyzeRef.current;
        if (!run) { setStatus('모델 준비 중...'); return; }

        let r;
        try { r = run(win); } catch { setStatus('분석 오류'); return; }
        if (!r) { setStatus('모델 준비 중...'); return; }

        if (r.activityState === 'WALKING' && r.score != null) {
          setResult(r);
          setCount((c) => c + 1);
          setStatus('측정 중');
          const a = accRef.current;
          a.scores.push(r.score);
          a.cadences.push(r.cadence ?? 0);
          if (r.riskLevel === 'SUSPECTED') a.suspected += 1;
          setScoreHist((h) => [...h, Math.round(r.score)]);

          // 분당 집계: 분이 바뀌면 직전 분을 백엔드로 업로드(중복 전송은 서버가 무시)
          if (useBackend) {
            const key = toMinuteAt();
            const m = minuteRef.current;
            if (m.key && m.key !== key && m.scores.length) {
              const sid = sessionIdRef.current;
              if (sid) uploadData(sid, [aggregateMinute(m)]).catch(() => {});
              minuteRef.current = { key, scores: [r.score], danger: r.riskLevel === 'SUSPECTED' ? 1 : 0 };
            } else {
              if (!m.key) m.key = key;
              m.scores.push(r.score);
              if (r.riskLevel === 'SUSPECTED') m.danger += 1;
            }
          }
        } else if (r.activityState === 'STATIONARY') {
          setResult({ activityState: 'STATIONARY' });
          setStatus('정지 · 보행 대기');
        } else {
          // 걷기 아님(뛰기/계단 등) — 동작만 표시, 점수 집계 제외
          setResult(r);
          setStatus(`${ACTIVITY_LABELS[r.activityClass] ?? '동작'} 감지`);
        }
      }
    });

    // 파형은 점수계산과 별개로 ~150ms마다 갱신 (50Hz 리렌더는 과부하)
    const traceTimer = setInterval(() => {
      const buf = bufRef.current;
      if (buf.length < 8) return;
      const seg = buf.slice(Math.max(0, buf.length - 80));
      setTrace({ x: seg.map((s) => s[0]), y: seg.map((s) => s[1]), z: seg.map((s) => s[2]) });
    }, 150);

    return () => { aSub.remove(); gSub.remove(); clearInterval(traceTimer); };
  }, []);

  // 측정 경과 시간 (1초마다 증가)
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  // 라이브 펄스 (측정 중임을 알리는 모던 인디케이터)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const dotScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const dotOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  // 측정 링에서 밖으로 퍼지는 펄스(레이더 핑) — 살아있는 느낌
  const ping = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ping, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const pingScale = ping.interpolate({ inputRange: [0, 1], outputRange: [1, 1.32] });
  const pingOpacity = ping.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.32, 0] });

  const stationary = result?.activityState === 'STATIONARY';
  const activity = result?.activityClass;
  const nonWalkingLocomotion = ['downstairs', 'running', 'upstairs'].includes(activity);
  const score = stationary ? null : result?.score;
  const tone = (stationary || score == null) ? 'idle' : riskTone(score, result?.riskLevel);
  const accent = TONE_DOT[tone];
  const offset = score != null ? CIRC * (1 - score / 100) : CIRC;
  const measuring = !stationary && score != null;

  const centerText = stationary ? '걸으면 측정이 시작돼요'
    : result?.score != null ? (nonWalkingLocomotion ? `${ACTIVITY_LABELS[activity]} 감지` : tone === 'danger' ? '위험 보행 의심' : tone === 'caution' ? '이상 보행 의심' : '정상 보행')
    : '걸음 데이터 수집 중';

  const activityLabel = activity ? (ACTIVITY_LABELS[activity] ?? activity) : '대기';
  const stats = [
    ['지금 동작', activityLabel, ''],
    ['걸음 속도', (!stationary && result?.cadence != null) ? String(result.cadence) : '—', '걸음/분'],
    ['측정 횟수', String(count), '회'],
  ];

  const finish = () => {
    const a = accRef.current;
    const n = a.scores.length;
    const avg = (arr) => Math.round(arr.reduce((x, y) => x + y, 0) / arr.length);
    const summary = n > 0 ? {
      windows: n,
      avgScore: avg(a.scores),
      minScore: Math.round(Math.min(...a.scores)),
      maxScore: Math.round(Math.max(...a.scores)),
      avgCadence: avg(a.cadences),
      suspectedRatio: Math.round((a.suspected / n) * 100),
      riskLevel: (a.suspected / n) > 0.3 ? 'SUSPECTED' : 'NORMAL',
      at: Date.now(),
    } : null;
    sessionStore.set(summary);

    // 백엔드 마무리: 잔여 분 데이터 → 종료 → 분석 결과. 실패해도 결과 화면은 이동.
    const sid = sessionIdRef.current;
    if (useBackend && sid && summary) {
      (async () => {
        const m = minuteRef.current;
        if (m.scores.length) await uploadData(sid, [aggregateMinute(m)]);
        await stopSession(sid);
        await uploadAnalysis(sid, {
          riskLevel: summary.riskLevel,
          avgScore: summary.avgScore,
          minScore: summary.minScore,
          maxScore: summary.maxScore,
          dangerCount: a.suspected,
          reportSummary: null,
        });
      })().catch(() => {});
    }

    router.push('/(elder)/result');
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient
        colors={[T.blue, T.blueDark]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' }}/>
        <View style={{ position: 'absolute', left: -50, bottom: -90, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' }}/>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={20} height={20} color="#fff"/>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8 }}>
              {measuring && (
                <Animated.View style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#86E3C1', transform: [{ scale: dotScale }], opacity: dotOpacity }}/>
              )}
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: measuring ? '#86E3C1' : 'rgba(255,255,255,0.5)' }}/>
            </View>
            <Text style={{ fontSize: 14, color: '#fff', fontFamily: T.fontSemiBold }}>{status}</Text>
          </View>
          <View style={{ width: 44 }}/>
        </View>

        <View style={{ marginTop: 22, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.92)', fontFamily: T.fontSemiBold, fontSize: 16 }}>주머니에 넣고 평소처럼 걸어주세요</Text>

          <View style={{ marginTop: 18, width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View pointerEvents="none" style={{ position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: 6, borderColor: '#fff', transform: [{ scale: pingScale }], opacity: pingOpacity }}/>
            <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} style={{ position: 'absolute' }}>
              <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="rgba(255,255,255,0.18)" strokeWidth="12" fill="none"/>
              <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="#fff" strokeWidth="12" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}/>
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: T.fontSemiBold, letterSpacing: 0.5 }}>보행 점수</Text>
              <Text style={{ fontSize: 68, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -3, lineHeight: 74, marginTop: 2 }}>
                {stationary ? '정지' : score != null ? Math.round(score) : '--'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 100, marginTop: 14 }}>
            <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: accent }}/>
            <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: '#fff', letterSpacing: -0.2 }}>{centerText}</Text>
          </View>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontFamily: T.fontSemiBold, marginTop: 12 }}>
            측정 시간 <Text style={{ fontFamily: T.fontExtraBold, color: '#fff' }}>{mmss}</Text>
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* 점수 쉬운 설명 */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: T.blueWash, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: T.blueSoft }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.spark width={20} height={20} color={T.blue}/>
            </View>
            <Text style={{ flex: 1, fontSize: 14.5, color: T.body, fontFamily: T.fontMedium, lineHeight: 21 }}>
              걸음 점수는 걸음이 얼마나 안정적인지 보여줘요. <Text style={{ fontFamily: T.fontBold, color: T.ink }}>70점이 넘으면 안정적</Text>이에요.
            </Text>
          </View>
        </View>

        {/* 지표 */}
        <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', gap: 10 }}>
          {stats.map(([l, v, sub], k) => (
            <Card key={k} pad={14} style={{ borderRadius: 16, flex: 1 }}>
              <Text style={{ fontSize: 14, color: T.body, fontFamily: T.fontSemiBold }}>{l}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 6 }}>
                <Text style={{ fontSize: String(v).length > 6 ? 16 : 22, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{v}</Text>
                {!!sub && <Text style={{ fontSize: 12, color: T.muted, marginBottom: 3 }}>{sub}</Text>}
              </View>
            </Card>
          ))}
        </View>

        {/* 라이브 점수 그래프 */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: T.ink, fontFamily: T.fontBold }}>점수 변화</Text>
              {scoreHist.length >= 2 && (
                <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>최근 {Math.min(scoreHist.length, 60)}회</Text>
              )}
            </View>
            {scoreHist.length >= 2 ? (
              <SparkLine data={scoreHist.slice(-60)} width={300} height={72} color={T.blue} min={0} max={100}/>
            ) : (
              <View style={{ height: 72, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontMedium }}>걷기를 시작하면 점수 그래프가 그려져요</Text>
              </View>
            )}
          </Card>
        </View>

        {/* 측정 신호 — 기본 숨김, 필요할 때만 펼침 (발표 시연용) */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Pressable onPress={() => setShowSignal((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontSemiBold }}>{showSignal ? '측정 신호 숨기기' : '측정 신호 자세히 보기'}</Text>
            <View style={{ transform: [{ rotate: showSignal ? '270deg' : '90deg' }] }}>
              <Icon.chevron width={16} height={16} color={T.muted}/>
            </View>
          </Pressable>
          {showSignal && (
            <Card pad={16} style={{ borderRadius: 18, marginTop: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, color: T.body, fontFamily: T.fontSemiBold }}>실시간 가속도 (x · y · z)</Text>
                <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>{formatActivity(result)}</Text>
              </View>
              <IMUTrace width={300} height={38} color={T.blue} data={trace.x}/>
              <IMUTrace width={300} height={38} color="#7B5BD9" data={trace.y}/>
              <IMUTrace width={300} height={38} color={T.ok} data={trace.z}/>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* 측정 완료 — 크고 명확한 버튼 */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 34, paddingTop: 10, backgroundColor: T.bg }}>
        <Pressable
          onPress={finish}
          style={({ pressed }) => ({
            height: 62, borderRadius: 18, backgroundColor: pressed ? T.blueDark : T.blue,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: T.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 5,
          })}>
          <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#fff' }}/>
          <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -0.3 }}>측정 완료</Text>
        </Pressable>
      </View>
    </View>
  );
}

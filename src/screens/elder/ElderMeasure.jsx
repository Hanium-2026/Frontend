import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, Animated, Easing, useWindowDimensions, Alert } from 'react-native';
import Text from '../../components/Text';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import IMUTrace from '../../components/IMUTrace';
import SparkLine from '../../components/SparkLine';
import DemoMonitor from '../../components/DemoMonitor';
import { useGaitPipeline } from '../../ml/useGaitPipeline';
import { createStepCounter, createTurnDetector, computeGaitMetrics, recentCadence } from '../../ml/gaitPreprocess';
import { sessionStore } from '../../store/sessionStore';
import { tokenStore } from '../../store/tokenStore';
import { ensureSession, uploadData, stopSession, uploadAnalysis, toMinuteAt } from '../../api/session';
import { getPhysicalInfo } from '../../api/ward';
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

// 상태 라벨: 정지 / 걷기 / 보행 아님(뛰기·계단 등 2차 미적용) / 대기.
const stateLabel = (result) => {
  if (result?.activityState === 'STATIONARY') return '정지';
  if (result?.activityState === 'WALKING') return '걷기';
  if (result?.activityState === 'OTHER') return '보행 아님';
  return '대기';
};

// 파랑 히어로 위에서 잘 보이는 밝은 위험도 톤 (ElderResult와 동일 팔레트)
const TONE_DOT = { ok: '#86E3C1', caution: '#FFB4A2', danger: '#FCA5A5', idle: 'rgba(255,255,255,0.6)' };

export default function ElderMeasure() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 파랑 히어로를 홈 화면과 동일한 비율·사이징 패턴으로 맞춘다.
  // 링을 작게 + 가로 배치(링 왼쪽 / 결과 오른쪽)해 파랑이 화면을 덜 먹게 하고,
  // 홈과 같은 compact 기준을 써서 모든 폰에서 비율이 일정하도록 한다.
  const { height: winH } = useWindowDimensions();
  const compact = winH < 760;
  const RING = compact ? 108 : 128;      // 측정 링 지름 (홈 96/116보다 살짝 크게 = 측정의 초점)
  const R = RING / 2 - 10;               // 반지름(획 두께 10 고려, 홈과 동일)
  const CIRC = 2 * Math.PI * R;
  const scoreFs = compact ? 40 : 48;     // 큰 점수 글자
  const heroGap = compact ? 14 : 18;     // 상단 행 ↔ 메인 행 간격 (홈과 동일)
  const heroPadB = compact ? 18 : 26;    // 히어로 하단 여백 (홈 18/28)

  const bufRef = useRef([]);          // [[ax,ay,az,gx,gy,gz], ...]
  const gyroRef = useRef([0, 0, 0]);  // 최신 자이로
  const sinceRef = useRef(0);         // 마지막 전송 이후 쌓인 샘플 수
  const accRef = useRef({ rawP: [], cadences: [] });  // 세션 누적(걷기만): 원시 P(이상)·케이던스

  // 연속 걸음 검출기(윈도우와 분리) + 회전 검출기 + 키 기반 보폭(m). 보폭 = 0.43 × 키, 없으면 0.70m.
  const stepperRef = useRef(null);
  if (!stepperRef.current) stepperRef.current = createStepCounter();
  const turnRef = useRef(null);
  if (!turnRef.current) turnRef.current = createTurnDetector();
  const stepLenRef = useRef(0.70);

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
  const [steps, setSteps] = useState(0);         // 연속 검출기 누적 걸음 수
  const [shownScore, setShownScore] = useState(null);   // 화면에 유지되는 마지막 점수(정지 중에도 표시)
  const [shownRisk, setShownRisk] = useState('NORMAL');
  const [shownP, setShownP] = useState({ raw: null, smooth: null });  // 마지막 P(이상) — 정지 중엔 값이 비지 않고 멈춘다
  const [status, setStatus] = useState('센서 준비 중...');
  const [trace, setTrace] = useState({ x: null, y: null, z: null });  // 실시간 3축 파형
  const [showSignal, setShowSignal] = useState(false);  // 측정 신호(파형) 펼침 — 기본 숨김
  const [scoreHist, setScoreHist] = useState([]);  // 걷기 평활 점수 이력(라이브 그래프)
  const [rawHist, setRawHist] = useState([]);      // 걷기 원(raw) 점수 이력 — 모니터링 차트의 '흔들린 순간'용
  const [showMonitor, setShowMonitor] = useState(false);  // 시연 모드 오버레이
  const [elapsed, setElapsed] = useState(0);       // 측정 경과 시간(초)
  const [cadenceLive, setCadenceLive] = useState(null);  // 최근 10초 걸음 간격 기반 리듬(spm)
  const [metrics, setMetrics] = useState(null);          // 라이브 {variability, symmetry} (직진 걸음 부족하면 null)

  // 측정 화면 진입 시 세션 확보(진행 중이면 복원, 없으면 시작). 실패해도 측정은 계속.
  useEffect(() => {
    if (!useBackend) return;
    let alive = true;
    ensureSession()
      .then((s) => { if (alive) sessionIdRef.current = s?.sessionId ?? null; })
      .catch(() => {});
    // 키 → 보폭(m). 이동 거리 = 걸음 수 × 보폭. 실패/미등록이면 기본 0.70m 유지.
    getPhysicalInfo()
      .then((info) => { const h = Number(info?.height); if (h > 0) stepLenRef.current = 0.43 * (h / 100); })
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
      // 회전(방향 전환) 감지 → 걸음에 태깅(회전 걸음은 변동성·대칭성에서 제외)
      const turning = turnRef.current.push(x, y, z, gx, gy, gz);
      // 연속 걸음 검출(윈도우 분석과 무관하게 원시 스트림에서 카운트)
      if (stepperRef.current.push(x, y, z, Date.now(), turning)) setSteps(stepperRef.current.count);

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
          setShownScore(r.score);         // 마지막 점수 갱신(정지 전환돼도 이 값이 계속 보임)
          setShownRisk(r.riskLevel);
          setShownP({ raw: r.pRaw, smooth: r.pAbnormal });
          setStatus('측정 중');
          const a = accRef.current;
          a.rawP.push(r.pRaw);              // 판정용 원시 P(이상)
          a.cadences.push(r.cadence ?? 0);
          setScoreHist((h) => [...h, Math.round(r.score)]);
          setRawHist((h) => [...h, Math.round((1 - r.pRaw) * 100)]);  // 평활 전 원점수(흔들린 순간)

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
        } else {
          // 걷기 아님 — 2차 판정 생략. 파이프라인 결과를 그대로 넘겨 시연 모드가 1차 판정을 표시할 수 있게 한다.
          setResult(r);
          setStatus(r.activityState === 'OTHER' ? '보행 아님 · 판정 생략' : '정지 · 보행 대기');
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

  // 측정 경과 시간 + 라이브 보행 지표 (1초마다). 지표는 순수 함수 계산이라 비용 무시 가능.
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      const st = stepperRef.current.steps;
      setCadenceLive(recentCadence(st, Date.now()));
      setMetrics(computeGaitMetrics(st));
    }, 1000);
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

  const stationary = result?.activityState === 'STATIONARY';
  const score = shownScore;   // 마지막 점수 유지 — 정지 중에도 점수는 계속 표시(지금 상태 타일만 정지)
  const tone = score == null ? 'idle' : riskTone(score, shownRisk);
  const accent = TONE_DOT[tone];
  const offset = score != null ? CIRC * (1 - score / 100) : CIRC;
  const measuring = !stationary && result?.score != null;  // 펄스는 실제 걷는 중에만
  const distanceM = Math.round(steps * stepLenRef.current);  // 이동 거리(m, 추정): 걸음 수 × 보폭

  // 모니터링 차트 데이터(평활+원점수 겹쳐 그림) + 라이브 요약
  const chartData = scoreHist.map((sc, i) => ({ smooth: sc, raw: rawHist[i] ?? sc }));
  const avgScoreLive = scoreHist.length ? Math.round(scoreHist.reduce((x, y) => x + y, 0) / scoreHist.length) : null;
  const minScoreLive = scoreHist.length ? Math.min(...scoreHist) : null;

  const centerText = score == null ? '걸으면 측정이 시작돼요'
    : tone === 'danger' ? '위험 보행 의심'
    : tone === 'caution' ? '이상 보행 의심'
    : '정상 보행';

  const stats = [
    ['지금 상태', stateLabel(result), ''],
    ['걸음 수', String(steps), '걸음'],
    ['이동 거리', `약 ${distanceM}`, 'm'],
  ];

  // 세션 판정은 실시간 EWMA 수렴값이 아니라 raw P(이상) '분포'로 낸다(짧게 재도 판단 가능).
  // 보행 개시 전환기(맨 앞 ONSET_DROP 윈도우)는 비정상 스텝이라 제외. median = 노이즈 견고.
  const ONSET_DROP = 2;         // ~2.5초 제외
  const MIN_WALK_WINDOWS = 12;  // 이 미만이면 저신뢰(개시 제외 후 ~10윈도우·~15초)

  const buildSummary = (lowConfidence) => {
    const a = accRef.current;
    const pts = a.rawP.slice(ONSET_DROP);
    if (pts.length === 0) return null;
    const median = (arr) => { const s = [...arr].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    const avg = (arr) => Math.round(arr.reduce((x, y) => x + y, 0) / arr.length);
    const scores = pts.map((p) => (1 - p) * 100);
    const dangerCount = pts.filter((p) => p >= 0.5).length;
    const gm = computeGaitMetrics(stepperRef.current.steps);  // 회전 제외 직진 걸음으로 산출(부족하면 null)
    return {
      windows: a.rawP.length,
      avgScore: Math.round((1 - median(pts)) * 100),
      minScore: Math.round(Math.min(...scores)),
      maxScore: Math.round(Math.max(...scores)),
      avgCadence: a.cadences.length ? avg(a.cadences) : 0,
      suspectedRatio: Math.round((dangerCount / pts.length) * 100),
      riskLevel: (dangerCount / pts.length) > 0.3 ? 'SUSPECTED' : 'NORMAL',
      dangerCount,
      steps,
      distanceM,
      symmetry: gm ? gm.symmetry : null,       // 좌우대칭성(추정, 100=대칭)
      variability: gm ? gm.variability : null,  // 걸음 간격 변동계수 CV(%)
      lowConfidence,
      at: Date.now(),
    };
  };

  const doFinish = (lowConfidence) => {
    setShowMonitor(false);   // 시연 모드에서 완료해도 결과 화면이 모달에 가리지 않게
    const summary = buildSummary(lowConfidence);
    sessionStore.set(summary);

    // 백엔드 마무리: 잔여 분 데이터 → 종료 → 분석 결과. 실패해도 결과 화면은 이동.
    // 저신뢰(짧은 측정)면 dangerCount 0으로 전송 → 보호자 오알림(FCM) 억제.
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
          dangerCount: lowConfidence ? 0 : summary.dangerCount,
          reportSummary: null,
        });
      })().catch(() => {});
    }

    router.push('/(elder)/result');
  };

  // 걷기 윈도우가 너무 적으면(짧은 측정) 저장 전에 확인.
  const finish = () => {
    const walkWindows = accRef.current.rawP.length;
    if (walkWindows > 0 && walkWindows < MIN_WALK_WINDOWS) {
      Alert.alert(
        '측정 시간이 짧아요',
        '걸음이 충분히 측정되지 않아 결과가 정확하지 않을 수 있어요.\n그래도 저장할까요?',
        [
          { text: '더 걸을게요', style: 'cancel' },
          { text: '그냥 저장', onPress: () => doFinish(true) },
        ],
      );
      return;
    }
    doFinish(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient
        colors={[T.blue, T.blueDark]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: heroPadB, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}>
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
          <Pressable
            onPress={() => setShowMonitor(true)}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.chart width={20} height={20} color="#fff"/>
          </Pressable>
        </View>

        <View style={{ marginTop: heroGap, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* 점수 링 — 홈과 동일한 사이징(작게 + 가로 배치) */}
          <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
              <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="rgba(255,255,255,0.22)" strokeWidth="10" fill="none"/>
              <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="#fff" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}/>
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: scoreFs, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -1, lineHeight: scoreFs + 2 }}>
                {score != null ? score : '--'}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: T.font, color: 'rgba(255,255,255,0.75)', marginTop: -2 }}>/ 100점</Text>
            </View>
          </View>

          {/* 결과 · 타이머 · 안내 (오른쪽 세로) */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 100 }}>
              <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: accent }}/>
              <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: '#fff', letterSpacing: -0.2 }}>{centerText}</Text>
            </View>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', fontFamily: T.fontSemiBold, marginTop: 10 }}>
              측정 시간 <Text style={{ fontFamily: T.fontExtraBold, color: '#fff' }}>{mmss}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', fontFamily: T.font, marginTop: 8, lineHeight: 19 }}>
              주머니에 넣고 평소처럼 걸어주세요
            </Text>
          </View>
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
              <SparkLine data={scoreHist.slice(-60)} height={72} color={T.blue} min={0} max={100}/>
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
                <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>{stateLabel(result)}</Text>
              </View>
              <IMUTrace height={38} color={T.blue} data={trace.x}/>
              <IMUTrace height={38} color="#7B5BD9" data={trace.y}/>
              <IMUTrace height={38} color={T.ok} data={trace.z}/>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* 측정 완료 — 크고 명확한 버튼 */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16), paddingTop: 10, backgroundColor: T.bg }}>
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

      {/* 시연 모드 — 화면 녹화용 고밀도 진단 패널(스크롤 없이 한 화면, 측정 완료까지 여기서).
          Modal이 아니라 오버레이다 — 안드로이드 Modal은 별도 윈도우라 safe-area가 0으로 잡혀
          하단 내비게이션 바에 버튼이 먹힌다. */}
      {showMonitor && (
      <DemoMonitor
        onClose={() => setShowMonitor(false)}
        onFinish={finish}
        live={{
          mmss,
          walkWindows: accRef.current.rawP.length,
          minWindows: MIN_WALK_WINDOWS,
          result,
          score,
          riskLevel: shownRisk,
          pRaw: shownP.raw,
          pSmooth: shownP.smooth,
          chartData,
          avgScore: avgScoreLive,
          minScore: minScoreLive,
          trace,
          steps,
          distanceM,
          cadenceLive,
          metrics,
        }}
      />
      )}
    </View>
  );
}

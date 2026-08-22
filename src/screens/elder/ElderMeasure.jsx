import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
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
const STRIDE_SEC = (STRIDE * HZ_MS) / 1000;   // 윈도우 1개 = 1.28초

// 세션 판정은 실시간 EWMA 수렴값이 아니라 raw P(이상) '분포'로 낸다(짧게 재도 판단 가능).
// 보행 개시 전환기(맨 앞 ONSET_DROP 윈도우)는 비정상 스텝이라 제외. median = 노이즈 견고.
const ONSET_DROP = 2;         // ~2.5초 제외
const MIN_WALK_WINDOWS = 12;  // 이 미만이면 기록하지 않는다(개시 제외 후 ~10윈도우·~15초)

// 분 버킷 → 백엔드 MinuteData 형식
const aggregateMinute = (m) => ({
  minuteAt: m.key,
  avgScore: Math.round(m.scores.reduce((x, y) => x + y, 0) / m.scores.length),
  minScore: Math.round(Math.min(...m.scores)),
  maxScore: Math.round(Math.max(...m.scores)),
  dangerCount: m.danger,
});

export default function ElderMeasure() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
  const [shownP, setShownP] = useState({ raw: null, smooth: null });  // 마지막 P(이상) — 시연 모드 진단용
  const [status, setStatus] = useState('센서 준비 중...');
  const [scoreHist, setScoreHist] = useState([]);  // 걷기 평활 점수 이력(라이브 그래프)
  const [rawHist, setRawHist] = useState([]);      // 걷기 원(raw) 점수 이력 — 모니터링 차트의 '흔들린 순간'용
  const [trace, setTrace] = useState({ x: null, y: null, z: null });  // 실시간 3축 파형(시연 모드용)
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

    // 파형은 점수계산과 별개로 ~150ms마다 갱신 (50Hz 리렌더는 과부하) — 시연 모드 전용.
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

  const score = shownScore;   // 마지막 점수 유지 — 정지 중에도 점수는 계속 표시
  const tone = score == null ? 'ok' : riskTone(score, shownRisk);
  const distanceM = Math.round(steps * stepLenRef.current);  // 이동 거리(m, 추정): 걸음 수 × 보폭 — 화면엔 표시하지 않음(추정값)

  // 모니터링 차트 데이터(평활+원점수 겹쳐 그림) + 라이브 요약
  const chartData = scoreHist.map((sc, i) => ({ smooth: sc, raw: rawHist[i] ?? sc }));
  const avgScoreLive = scoreHist.length ? Math.round(scoreHist.reduce((x, y) => x + y, 0) / scoreHist.length) : null;
  const minScoreLive = scoreHist.length ? Math.min(...scoreHist) : null;

  // 기록 조건(MIN_WALK_WINDOWS)까지 얼마나 남았는지 실시간으로 알린다.
  const walkWindows = scoreHist.length;
  const progressRatio = Math.min(1, walkWindows / MIN_WALK_WINDOWS);
  const guideText = walkWindows === 0 ? '주머니에 넣고 평소처럼 걸어주세요'
    : walkWindows < MIN_WALK_WINDOWS
      ? `약 ${Math.ceil((MIN_WALK_WINDOWS - walkWindows) * STRIDE_SEC)}초 더 걸으면 기록돼요`
      : '충분히 걸으셨어요. 완료를 눌러도 돼요';

  const centerText = score == null ? '걸으면 측정이 시작돼요'
    : tone === 'danger' ? '위험 보행 의심'
    : tone === 'caution' ? '이상 보행 의심'
    : '정상 보행';

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
    const sid = sessionIdRef.current;
    if (useBackend && sid && summary) {
      (async () => {
        const m = minuteRef.current;
        if (m.scores.length) await uploadData(sid, [aggregateMinute(m)]);
        await stopSession(sid);
        // 저신뢰(짧은 측정)는 분석을 올리지 않는다. 백엔드는 analysis 요청에서 daily_scores를
        // 만들고 gait_reports도 여기서 생기므로, 올리면 몇 걸음짜리 점수가 하루 평균에 섞이고
        // 기록 목록에도 남는다. 올리지 않으면 양쪽 다 깨끗하고 보호자 FCM도 뜨지 않는다.
        if (summary.lowConfidence) return;
        await uploadAnalysis(sid, {
          riskLevel: summary.riskLevel,
          avgScore: summary.avgScore,
          minScore: summary.minScore,
          maxScore: summary.maxScore,
          dangerCount: summary.dangerCount,
          reportSummary: null,
          variabilityScore: summary.variability,
          // 백엔드는 asymmetryScore(0~1)를 받아 (1-x)*100으로 symmetryScore를 만든다 → symmetry(100=대칭)를 역변환.
          asymmetryScore: summary.symmetry != null ? (100 - summary.symmetry) / 100 : null,
        });
      })().catch(() => {});
    }

    router.push('/(elder)/result');
  };

  // 걷기 구간이 부족하면 기록되지 않는다 — 끝난 뒤가 아니라 여기서 분명히 알린다.
  const finish = () => {
    const done = accRef.current.rawP.length;
    if (done > 0 && done < MIN_WALK_WINDOWS) {
      const left = Math.ceil((MIN_WALK_WINDOWS - done) * STRIDE_SEC);
      Alert.alert(
        '아직 기록되지 않아요',
        `걸음이 부족해서 이번 측정은 기록에 남지 않아요.
약 ${left}초만 더 걸으면 기록할 수 있어요.`,
        [
          { text: '더 걸을게요', style: 'cancel' },
          { text: '기록 없이 종료', onPress: () => doFinish(true) },
        ],
      );
      return;
    }
    doFinish(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.xl, paddingBottom: T.sp.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink }}>측정 중</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
          <Text style={{ fontSize: T.fs.h, color: T.body }}>{mmss}</Text>
          <Pressable onPress={() => setShowMonitor(true)} hitSlop={10}>
            <Icon.chart width={22} height={22} color={T.muted}/>
          </Pressable>
        </View>
      </View>
      {score == null && (
        <Text style={{ paddingHorizontal: T.sp.xl, fontSize: T.fs.caption, color: T.muted, marginTop: -2 }}>{status}</Text>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* 지금 걸음 점수 */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.md }}>
          <Card pad={T.sp.xl} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: T.fs.body, color: T.muted }}>지금 걸음 점수</Text>
            <Text style={{
              fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink,
              lineHeight: T.fs.display * 1.1, marginTop: 2,
            }}>{score ?? '--'}</Text>
            {score != null && (
              <View style={{ marginTop: T.sp.sm }}>
                <Pill tone={tone} size="lg">{centerText}</Pill>
              </View>
            )}

            <View style={{ width: '100%', marginTop: T.sp.xl }}>
              {scoreHist.length >= 2 ? (
                <SparkLine data={scoreHist.slice(-60)} height={72} color={T.body} min={0} max={100} fill={false}/>
              ) : (
                <View style={{ height: 72, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: T.fs.caption, color: T.muted }}>걷기를 시작하면 점수 그래프가 그려져요</Text>
                </View>
              )}
            </View>
            {scoreHist.length >= 2 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: T.sp.xs }}>
                <Text style={{ fontSize: T.fs.caption, color: T.muted }}>최근 {Math.min(scoreHist.length, 60)}회</Text>
                <Text style={{ fontSize: T.fs.caption, color: T.muted }}>70점 기준선</Text>
              </View>
            )}
          </Card>
        </View>

        {/* 기록까지 남은 시간 — 이 화면의 핵심. 저장 시점이 아니라 걷는 동안 미리 알린다. */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
          <Card pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{guideText}</Text>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: T.line, marginTop: T.sp.lg, overflow: 'hidden' }}>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: T.blue, width: `${Math.round(progressRatio * 100)}%` }}/>
            </View>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: T.sp.sm }}>
              걸음이 너무 적으면 하루 평균이 흐려져서 기록에 남지 않아요
            </Text>
          </Card>
        </View>

        {/* 걸음 수 — 「제대로 세고 있다」는 신호. 이동 거리는 추정값이라 표시하지 않는다. */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
          <Card pad={T.sp.lg} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: T.fs.body, color: T.body }}>걸음 수</Text>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{steps}보</Text>
          </Card>
        </View>

        <Text style={{ fontSize: T.fs.body, color: T.muted, textAlign: 'center', paddingHorizontal: T.sp.xl, marginTop: T.sp.lg }}>
          휴대폰을 주머니에 넣고 평소처럼 걸어주세요
        </Text>
      </ScrollView>

      {/* 측정 완료 — 크고 명확한 버튼, 하단 고정 */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: T.sp.lg, paddingTop: T.sp.sm, paddingBottom: Math.max(insets.bottom, T.sp.lg), backgroundColor: T.bg }}>
        <Pressable
          onPress={finish}
          style={({ pressed }) => ({
            height: 60, borderRadius: T.radius.md, backgroundColor: pressed ? T.blueDark : T.blue,
            alignItems: 'center', justifyContent: 'center',
          })}>
          <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>측정 완료</Text>
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

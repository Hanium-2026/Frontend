// on-device 2단계 보행 분석 파이프라인.
//  1차: 동작분류(정완 huga+93, g단위) → "걷는 중"인지 게이트. 비보행(뛰기·계단 등)은 2차 생략.
//  2차: 걷는 중일 때만 정상/이상 보행 판정 → 점수/위험도 산출.
// 정지(sitting/standing)는 방향 무관 휴리스틱 motionLevel이 앞단에서 차단(1차 모델은 정지 필터가 약함).
// 단일 윈도우(83.9% 이진분류)는 노이즈가 커서 P(이상)을 EWMA로 평활 + 히스테리시스로 라벨 안정화.
//  워밍업 숨김은 두지 않는다 — 걷는 즉시 평활 점수를 표시/기록하고, EWMA가 초반부터 부드럽게 수렴한다.
// react-native-fast-tflite 필요(네이티브) → dev build에서만 동작. Expo Go에서는 모델 로드 실패.
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import {
  resampleWindow,
  motionLevel,
  estimateCadence,
  buildStage1Input,
  buildStage2Input,
  softmaxArgmax,
  calibrateProbability,
  median,
  STAGE1_CLASSES,
  STAGE2_WINDOW_SIZE,
} from './gaitPreprocess';

const STATIONARY_CLASSES = new Set(['sitting', 'standing']); // 1차가 이 동작을 확신하면 정지 처리
// 판정 파라미터 — 시연 모드가 화면에 그대로 표시하므로 export(화면 하드코딩 금지).
// ⚠️ ElderMeasure의 STRIDE(분석 간격)를 바꾸면 아래 "윈도우 개수" 기준 상수들의 실제 초 단위 의미도
// 같이 바뀐다 — STRIDE를 절반으로 줄일 때(2026-08-27, 64→32) 시정수·연속횟수를 2배로 맞춰서
// 실제 걸리는 시간(초)은 그대로 유지했다.
export const PRE_FILTER_WINDOW = 3;   // EWMA에 넣기 전 최근 N개 P(이상)의 중앙값을 먼저 취함 — 순간 이상치 제거
export const EWMA_ALPHA = 0.1;        // 평활화 강도(작을수록 안정·느림). 시정수 ~10윈도우(~6.4초)
export const SUSPECT_ON = 0.55;       // 라벨 히스테리시스: 이상으로 전환
export const SUSPECT_OFF = 0.45;      // 정상으로 전환 (사이 구간은 직전 라벨 유지)
export const CALIBRATION_TEMPERATURE = 4;  // 2차 출력 온도 스케일링(gaitPreprocess.calibrateProbability) — 초기 추정치
export const HYSTERESIS_MIN_RUN = 6;       // 라벨 전환에 연속 몇 윈도우가 필요한지(~3.8초) — 순간 튐 방지

// 추론 지연 계측용 시계. 온디바이스 추론임을 시연에서 ms로 보여준다(서버 왕복이면 나올 수 없는 값).
const nowMs = () => (global.performance && global.performance.now ? global.performance.now() : Date.now());

export function useGaitPipeline() {
  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const emaRef = useRef(null);      // P(이상) EWMA
  const riskRef = useRef('NORMAL'); // 히스테리시스 적용된 라벨
  const pendingRef = useRef({ label: null, count: 0 });  // 라벨 전환 대기(연속 윈도우 카운트)
  const rawBufRef = useRef([]);     // 최근 PRE_FILTER_WINDOW개의 온도보정 P(이상) — 중앙값 사전 필터용
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    // 모델을 로컬 파일로 받아 file:// 경로로 로드한다. (dev: metro→캐시 다운로드 / prod: 번들 로컬)
    const loadOne = async (mod) => {
      const asset = Asset.fromModule(mod);
      if (!asset.downloaded) await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      // fast-tflite v3: delegates(필수 인자)에 []를 넘겨 기본 CPU 사용.
      return loadTensorflowModel({ url: uri }, []);
    };
    (async () => {
      try {
        const m1 = await loadOne(require('../../assets/models/gait_stage1_activity.tflite'));
        const m2 = await loadOne(require('../../assets/models/gait_model.tflite'));
        if (!alive) return;
        stage1Ref.current = m1;
        stage2Ref.current = m2;
        setReady(true);
      } catch (e) {
        if (alive) setError(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  // 동기 추론. 반환 형태는 기존 세션 업로드 계약과 동일.
  // {activityState, activityClass, activityConfidence, score, riskLevel, cadence, pAbnormal, pRaw}
  // + 시연 표시용: {accStd, gyroAvg, ms1, ms2} — 정지 게이트 실측치와 단계별 추론 지연(ms).
  // window: 1차용 raw [ax,ay,az,gx,gy,gz] 윈도우. filteredWindow: 2차용 이미 causal 필터링된
  // [asvmFiltered, gsvmFiltered] 윈도우(createGaitFilter로 세션 내내 상태 유지하며 만든 것).
  // turnFraction: 이 윈도우 중 회전 중이었던 샘플 비율(0~1) — 회전 걸음은 모양이 달라 2차 판정을 흐린다.
  function analyze(window, filteredWindow, turnFraction = 0) {
    const m1 = stage1Ref.current;
    const m2 = stage2Ref.current;
    if (!m1 || !m2) return null;

    const samples = resampleWindow(window);

    // 빠른 정지 판정 (모델 호출 생략) — sitting/standing은 여기서 차단.
    const { stationary, accStd, gyroAvg } = motionLevel(samples);
    const gate = { accStd, gyroAvg };
    if (stationary) {
      return { activityState: 'STATIONARY', activityClass: 'stationary', score: null, riskLevel: 'NORMAL', cadence: null, ...gate, ms1: 0, ms2: 0 };
    }

    // 1차: 동작 분류 게이트 (출력 ArrayBuffer → Float32Array 래핑)
    const t1 = nowMs();
    const out1 = new Float32Array(m1.runSync([buildStage1Input(samples).buffer])[0]);
    const ms1 = nowMs() - t1;
    const { idx: i1, confidence: conf1 } = softmaxArgmax(out1);
    const activityClass = STAGE1_CLASSES[i1];

    if (STATIONARY_CLASSES.has(activityClass) && conf1 >= 0.8) {
      return { activityState: 'STATIONARY', activityClass, activityConfidence: conf1, score: null, riskLevel: 'NORMAL', cadence: null, ...gate, ms1, ms2: 0 };
    }
    if (activityClass !== 'walking') {
      // 뛰기/계단 등 — 보행 모델 적용 대상 아님. 동작만 표시, 점수 없음.
      return { activityState: 'OTHER', activityClass, activityConfidence: conf1, score: null, riskLevel: 'NORMAL', cadence: null, ...gate, ms1, ms2: 0 };
    }

    // ⚠️ 회전 구간 판정 보류는 되돌림(2026-08-27) — createTurnDetector 임계값이 실기기 미검증
    // 상태라 정상 걷기의 골반 회전만으로도 turnFraction=1.0이 나와 2차 판정이 전부 막혔음.
    // turnFraction 인자는 남겨두되(호출부 시그니처 유지) 여기서는 쓰지 않는다 — 재도입 시
    // createTurnDetector 임계값(ON/OFF)부터 실기기로 재보정할 것.

    // 2차: 정상/이상 보행 (causal 필터링된 ASVM/GSVM 입력, 출력은 시그모이드 P(이상) 단일값)
    const stage2Samples = resampleWindow(filteredWindow, STAGE2_WINDOW_SIZE, [0, 0]);
    const stage2Input = buildStage2Input(stage2Samples);
    const t2 = nowMs();
    const out2 = new Float32Array(m2.runSync([stage2Input.buffer])[0]);
    const ms2 = nowMs() - t2;
    // 온도 스케일링 — 모델이 극단값(0.0002~0.9998)에 거의 항상 붙어있어 뒤의 EWMA·히스테리시스가
    // 사실상 무력화되던 문제 완화.
    const pRawInstant = calibrateProbability(out2[0] ?? 0, CALIBRATION_TEMPERATURE);

    // 중앙값 사전 필터 — 회전·정지 전환 등 한 윈도우짜리 이상치가 EWMA에 그대로 들어가지 않도록,
    // 최근 PRE_FILTER_WINDOW개 중 중앙값만 취한다(이 값이 pRaw로 EWMA·세션 판정에 쓰인다).
    const rawBuf = rawBufRef.current;
    rawBuf.push(pRawInstant);
    if (rawBuf.length > PRE_FILTER_WINDOW) rawBuf.shift();
    const pRaw = median(rawBuf);

    // [NEVO-DEBUG] 임시 진단 로그 — score=9 등 이상 판정 원인 확인용. 확인 끝나면 이 블록 삭제.
    if (__DEV__) {
      const last = stage2Samples[stage2Samples.length - 1];
      const azArr = [], gzArr = [];
      for (let i = 0; i < stage2Input.length; i += 2) { azArr.push(stage2Input[i]); gzArr.push(stage2Input[i + 1]); }
      const stat = (a) => ({ min: Math.min(...a).toFixed(2), max: Math.max(...a).toFixed(2), mean: (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) });
      console.log('[NEVO-DEBUG]', JSON.stringify({
        asvmFiltered: last[0]?.toFixed(4), gsvmFiltered: last[1]?.toFixed(4),
        asvmZWindow: stat(azArr), gsvmZWindow: stat(gzArr),
        pRawModel: (out2[0] ?? 0).toFixed(4), pRawInstant: pRawInstant.toFixed(4), pRawMedian: pRaw.toFixed(4),
      }));
    }

    // P(이상) 지수이동평균 — 시드=0(=100점)에서 시작해 실제값으로 수렴(초반부터 낮게 시작하지 않게).
    // 세션 판정은 이 수렴값이 아니라 raw 분포로 내므로(pRaw 반환), 시드값은 실시간 표시에만 영향.
    const prev = emaRef.current;
    const seed = prev == null ? 0 : prev;
    const ema = EWMA_ALPHA * pRaw + (1 - EWMA_ALPHA) * seed;
    emaRef.current = ema;

    // 라벨 히스테리시스 — 0.5 경계 자체는 평활화 확률로 잡지만, 그것만으로는 한 윈도우의 튐에도
    // 라벨이 바로 바뀔 수 있어 HYSTERESIS_MIN_RUN번 연속으로 같은 후보가 나와야 실제로 전환한다.
    let risk = riskRef.current;
    const candidate = ema >= SUSPECT_ON ? 'SUSPECTED' : (ema <= SUSPECT_OFF ? 'NORMAL' : null);
    const pending = pendingRef.current;
    if (candidate && candidate !== risk) {
      pendingRef.current = { label: candidate, count: pending.label === candidate ? pending.count + 1 : 1 };
      if (pendingRef.current.count >= HYSTERESIS_MIN_RUN) {
        risk = candidate;
        pendingRef.current = { label: null, count: 0 };
      }
    } else {
      pendingRef.current = { label: null, count: 0 };  // 후보가 없거나 이미 현재 라벨과 같음 — 대기 취소
    }
    riskRef.current = risk;

    return {
      activityState: 'WALKING',
      activityClass: 'walking',
      activityConfidence: conf1,
      score: Math.round((1 - ema) * 100),
      riskLevel: risk,
      cadence: estimateCadence(samples),
      pAbnormal: ema,
      pRaw,                 // 평활 전 원시 P(이상) — 세션 판정(raw 분포)용
      ...gate,
      ms1,
      ms2,
    };
  }

  return { ready, error, analyze };
}

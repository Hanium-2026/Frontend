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
  STAGE1_CLASSES,
  STAGE2_CLASSES,
} from './gaitPreprocess';

const ABNORMAL_IDX = STAGE2_CLASSES.indexOf('abnormal');
const STATIONARY_CLASSES = new Set(['sitting', 'standing']); // 1차가 이 동작을 확신하면 정지 처리
// 판정 파라미터 — 시연 모드가 화면에 그대로 표시하므로 export(화면 하드코딩 금지).
export const EWMA_ALPHA = 0.2;        // 평활화 강도(작을수록 안정·느림). 시정수 ~5윈도우(~6초)
export const SUSPECT_ON = 0.55;       // 라벨 히스테리시스: 이상으로 전환
export const SUSPECT_OFF = 0.45;      // 정상으로 전환 (사이 구간은 직전 라벨 유지)

// 추론 지연 계측용 시계. 온디바이스 추론임을 시연에서 ms로 보여준다(서버 왕복이면 나올 수 없는 값).
const nowMs = () => (global.performance && global.performance.now ? global.performance.now() : Date.now());

export function useGaitPipeline() {
  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const emaRef = useRef(null);      // P(이상) EWMA
  const riskRef = useRef('NORMAL'); // 히스테리시스 적용된 라벨
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
  function analyze(window) {
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

    // 2차: 정상/이상 보행 (원단위 입력)
    const t2 = nowMs();
    const out2 = new Float32Array(m2.runSync([buildStage2Input(samples).buffer])[0]);
    const ms2 = nowMs() - t2;
    const { probs } = softmaxArgmax(out2);
    const pRaw = ABNORMAL_IDX >= 0 ? (probs[ABNORMAL_IDX] ?? 0) : 0;

    // P(이상) 지수이동평균 — 시드=0(=100점)에서 시작해 실제값으로 수렴(초반부터 낮게 시작하지 않게).
    // 세션 판정은 이 수렴값이 아니라 raw 분포로 내므로(pRaw 반환), 시드값은 실시간 표시에만 영향.
    const prev = emaRef.current;
    const seed = prev == null ? 0 : prev;
    const ema = EWMA_ALPHA * pRaw + (1 - EWMA_ALPHA) * seed;
    emaRef.current = ema;

    // 라벨 히스테리시스 — 0.5 경계에서 깜빡이지 않도록 평활화 확률 기준으로만 갱신.
    let risk = riskRef.current;
    if (ema >= SUSPECT_ON) risk = 'SUSPECTED';
    else if (ema <= SUSPECT_OFF) risk = 'NORMAL';
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

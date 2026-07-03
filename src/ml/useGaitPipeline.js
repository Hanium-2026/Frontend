// on-device 보행 분석 파이프라인 (정완이형 normal/abnormal 보행 모델 단일 사용).
//  정지면 추론 생략, 움직이면 모델 추론 → 점수/위험도 산출.
// 단일 윈도우(83.9% 이진분류)는 노이즈가 커서 그대로 쓰면 점수가 출렁임 →
//  P(이상)을 EWMA로 평활화하고, 초기 몇 윈도우는 워밍업으로 숨기고, 라벨은 히스테리시스로 안정화한다.
// react-native-fast-tflite 필요(네이티브) → dev build에서만 동작. Expo Go에서는 모델 로드 실패.
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import {
  resampleWindow,
  isStationary,
  estimateCadence,
  buildInput,
  softmaxArgmax,
  CLASSES,
} from './gaitPreprocess';

const ABNORMAL_IDX = CLASSES.indexOf('abnormal');
const EWMA_ALPHA = 0.2;        // 평활화 강도(작을수록 안정·느림). 시정수 ~5윈도우(~6초)
const WARMUP_WINDOWS = 6;      // 이만큼 걷기 윈도우가 쌓이기 전엔 점수 숨김(~8초)
const SUSPECT_ON = 0.55;       // 라벨 히스테리시스: 이상으로 전환
const SUSPECT_OFF = 0.45;      // 정상으로 전환 (사이 구간은 직전 라벨 유지)

export function useGaitPipeline() {
  const modelRef = useRef(null);
  const emaRef = useRef(null);      // P(이상) EWMA
  const walkCountRef = useRef(0);   // 걷기 윈도우 누적 수
  const riskRef = useRef('NORMAL'); // 히스테리시스 적용된 라벨
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 모델을 로컬 파일로 받아 file:// 경로로 로드한다. (dev: metro→캐시 다운로드 / prod: 번들 로컬)
        const asset = Asset.fromModule(require('../../assets/models/gait_model.tflite'));
        if (!asset.downloaded) await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        // fast-tflite v3: delegates(필수 인자)에 []를 넘겨 기본 CPU 사용.
        const model = await loadTensorflowModel({ url: uri }, []);
        if (!alive) return;
        modelRef.current = model;
        setReady(true);
      } catch (e) {
        if (alive) setError(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  // 동기 추론. 반환 형태는 기존 세션 업로드 계약과 동일.
  // {activityState, score, riskLevel, cadence, pAbnormal, warmingUp}
  function analyze(window) {
    const model = modelRef.current;
    if (!model) return null;

    const samples = resampleWindow(window);

    if (isStationary(samples)) {
      return { activityState: 'STATIONARY', score: null, riskLevel: 'NORMAL', cadence: null, warmingUp: false };
    }

    // fast-tflite는 입력으로 ArrayBuffer를, 출력으로도 ArrayBuffer를 주고받는다(.buffer / Float32Array 래핑 필요).
    const out = new Float32Array(model.runSync([buildInput(samples).buffer])[0]);
    const { probs } = softmaxArgmax(out);
    const pRaw = ABNORMAL_IDX >= 0 ? (probs[ABNORMAL_IDX] ?? 0) : 0;

    // P(이상) 지수이동평균 — 순간값 대신 매끄러운 추세를 점수로 쓴다.
    const prev = emaRef.current;
    const ema = prev == null ? pRaw : EWMA_ALPHA * pRaw + (1 - EWMA_ALPHA) * prev;
    emaRef.current = ema;
    walkCountRef.current += 1;
    const warmingUp = walkCountRef.current < WARMUP_WINDOWS;

    // 라벨 히스테리시스 — 0.5 경계에서 깜빡이지 않도록 평활화 확률 기준으로만 갱신.
    let risk = riskRef.current;
    if (ema >= SUSPECT_ON) risk = 'SUSPECTED';
    else if (ema <= SUSPECT_OFF) risk = 'NORMAL';
    riskRef.current = risk;

    return {
      activityState: 'WALKING',
      score: Math.round((1 - ema) * 100),
      riskLevel: risk,
      cadence: estimateCadence(samples),
      pAbnormal: ema,
      warmingUp,
    };
  }

  return { ready, error, analyze };
}

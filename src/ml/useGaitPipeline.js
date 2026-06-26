// on-device 2단계 보행 분석 파이프라인.
//  1차: HuGaDB 동작분류 → "걷는 중"인지 게이트
//  2차: 걷는 중일 때만 정상/이상 보행 판정 → 점수/위험도 산출
// react-native-fast-tflite 필요(네이티브) → dev build에서만 동작. Expo Go에서는 모델 로드 실패.
import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import {
  resampleTo100,
  isStationary,
  estimateCadence,
  buildStage1Input,
  buildStage2Input,
  softmaxArgmax,
  STAGE1_CLASSES,
  STAGE2_CLASSES,
} from './gaitPreprocess';

const STATIONARY_CLASSES = new Set(['sitting', 'standing']);
const ABNORMAL_THRESHOLD = 0.5; // P(abnormal) 이상이면 이상 보행 의심

export function useGaitPipeline() {
  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const loadOne = async (label, mod) => {
      console.log(`[gait] loading ${label}...`);
      // 모델을 로컬 파일로 받아 file:// 경로로 로드한다. fast-tflite 네이티브는 URL(path).readBytes()로
      // 읽는데, dev에서 metro HTTP 자산 URL은 못 가져와 undefined가 됨. expo-asset이 dev에선 metro에서
      // 캐시로 내려받고(프로덕션은 번들 로컬을 그대로 가리킴) localUri(file://)를 준다.
      const asset = Asset.fromModule(mod);
      if (!asset.downloaded) await asset.downloadAsync();
      const uri = asset.localUri || asset.uri;
      console.log(`[gait] ${label} uri: ${uri}`);
      const m = await loadTensorflowModel({ url: uri });
      console.log(`[gait] loaded ${label} OK`);
      return m;
    };
    (async () => {
      try {
        console.log('[gait] pipeline init');
        const m1 = await loadOne('stage1', require('../../assets/models/gait_stage1_activity.tflite'));
        const m2 = await loadOne('stage2', require('../../assets/models/gait_stage2_gait.tflite'));
        if (!alive) return;
        stage1Ref.current = m1;
        stage2Ref.current = m2;
        setReady(true);
        console.log('[gait] pipeline ready');
      } catch (e) {
        console.log('[gait] LOAD FAILED:', e?.message || String(e));
        if (alive) setError(e?.message || String(e));
      }
    })();
    return () => { alive = false; };
  }, []);

  // 동기 추론. 반환 형태는 기존 AI 서버 응답 계약과 동일.
  // {activityState, activityClass, activityConfidence, score, riskLevel, cadence}
  function analyze(window) {
    const m1 = stage1Ref.current;
    const m2 = stage2Ref.current;
    if (!m1 || !m2) return null;

    const samples = resampleTo100(window);

    // 빠른 정지 판정 (모델 호출 생략)
    if (isStationary(samples)) {
      return { activityState: 'STATIONARY', activityClass: 'stationary', score: null, riskLevel: 'NORMAL', cadence: null };
    }

    // 1차: 동작 분류 게이트
    const out1 = m1.runSync([buildStage1Input(samples)])[0];
    const { idx: i1, confidence: conf1 } = softmaxArgmax(out1);
    const activityClass = STAGE1_CLASSES[i1];

    if (STATIONARY_CLASSES.has(activityClass) && conf1 >= 0.8) {
      return { activityState: 'STATIONARY', activityClass, activityConfidence: conf1, score: null, riskLevel: 'NORMAL', cadence: null };
    }
    if (activityClass !== 'walking') {
      // 뛰기/계단 등 — 보행 모델 적용 대상 아님. 동작만 표시, 점수 없음.
      return { activityState: 'OTHER', activityClass, activityConfidence: conf1, score: null, riskLevel: 'NORMAL', cadence: null };
    }

    // 2차: 정상/이상 보행
    const out2 = m2.runSync([buildStage2Input(samples)])[0];
    const { probs } = softmaxArgmax(out2);
    const abIdx = STAGE2_CLASSES.indexOf('abnormal');
    const pAbnormal = abIdx >= 0 ? (probs[abIdx] ?? 0) : 0;
    const score = Math.round((1 - pAbnormal) * 100);
    const riskLevel = pAbnormal >= ABNORMAL_THRESHOLD ? 'SUSPECTED' : 'NORMAL';

    return {
      activityState: 'WALKING',
      activityClass: 'walking',
      activityConfidence: conf1,
      score,
      riskLevel,
      cadence: estimateCadence(samples),
      pAbnormal,
    };
  }

  return { ready, error, analyze };
}

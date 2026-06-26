// 보행 분석 전처리 (순수 함수 — 네이티브 의존성 없음, 단위 테스트 가능).
// 입력 윈도우: [[ax,ay,az,gx,gy,gz], ...]  (expo-sensors 단위: acc=g, gyro=rad/s)
//
// 모델 입력 형태: (1, 100, 10), 피처 순서:
//   acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, acc_x_dyn, acc_y_dyn, acc_z_dyn, acc_norm
//   - acc_dyn = acc - mean(acc over window) (중력/오프셋 제거한 동적 성분)
//   - acc_norm = ||acc|| (중력 포함 크기)
//
// 1차(HuGaDB 동작분류): HuGaDB는 int16 센서 카운트로 학습됨 → g/rad/s를 int16 스케일로 변환 후 정규화.
// 2차(정상/이상 보행): g/rad/s 원단위로 학습됨(scaler acc_norm 평균≈1.0) → 변환 없이 그대로 정규화.

import stage1Scaler from '../../assets/models/gait_stage1_scaler.json';
import stage2Scaler from '../../assets/models/gait_stage2_scaler.json';

export const WINDOW_SIZE = 100; // 모델이 기대하는 타임스텝
const FEATURES = 10;

// HuGaDB int16 변환 상수 (nevo_score_server.py와 동일)
const ACC_COUNTS_PER_G = 32768 / 2;                       // 16384
const GYRO_COUNTS_PER_RAD = (32768 / 2000) * (180 / Math.PI); // 938.734...
const INT16_MIN = -32768;
const INT16_MAX = 32767;

const clip = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const STAGE1_CLASSES = stage1Scaler.classes;
export const STAGE2_CLASSES = stage2Scaler.classes;

// 윈도우를 정확히 100샘플로 맞춘다. 더 길면 최근 100개, 짧으면 앞을 첫 샘플로 패딩.
export function resampleTo100(window) {
  const n = window.length;
  if (n >= WINDOW_SIZE) return window.slice(n - WINDOW_SIZE);
  const pad = [];
  const first = window[0] || [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < WINDOW_SIZE - n; i++) pad.push(first);
  return pad.concat(window);
}

// 정지 판정 휴리스틱 (raw g/rad/s 기준 — 서버와 동일 임계값).
// 거의 안 움직이면 동작분류 모델을 돌릴 필요 없이 STATIONARY로 단축.
export function isStationary(samples) {
  const n = samples.length;
  if (!n) return true;
  let mean = 0;
  const accMag = new Array(n);
  let gyroSum = 0;
  for (let i = 0; i < n; i++) {
    const [ax, ay, az, gx, gy, gz] = samples[i];
    const am = Math.sqrt(ax * ax + ay * ay + az * az);
    accMag[i] = am;
    mean += am;
    gyroSum += Math.sqrt(gx * gx + gy * gy + gz * gz);
  }
  mean /= n;
  let varSum = 0;
  for (let i = 0; i < n; i++) varSum += (accMag[i] - mean) ** 2;
  const accStd = Math.sqrt(varSum / n);
  const gyroAvg = gyroSum / n;
  return accStd < 0.025 && gyroAvg < 0.04;
}

// 분당 걸음 수(cadence) 추정 — 동적 가속도 크기의 피크를 센다. (정확한 보행수가 아닌 추정치)
export function estimateCadence(samples, sampleRateHz = stage2Scaler.sample_rate_hz || 50) {
  const n = samples.length;
  if (n < 4) return null;
  // 동적 가속도 크기(중력 제거 근사: 평균을 뺀 각 축) → 크기
  let mx = 0, my = 0, mz = 0;
  for (const s of samples) { mx += s[0]; my += s[1]; mz += s[2]; }
  mx /= n; my /= n; mz /= n;
  const mag = new Array(n);
  for (let i = 0; i < n; i++) {
    const dx = samples[i][0] - mx, dy = samples[i][1] - my, dz = samples[i][2] - mz;
    mag[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  // 임계값 = 평균 + 0.5*표준편차 위로 올라가는 상승 교차를 피크로 카운트
  let mean = 0; for (const v of mag) mean += v; mean /= n;
  let varSum = 0; for (const v of mag) varSum += (v - mean) ** 2;
  const std = Math.sqrt(varSum / n);
  const thr = mean + 0.5 * std;
  let peaks = 0;
  for (let i = 1; i < n; i++) {
    if (mag[i - 1] <= thr && mag[i] > thr) peaks++;
  }
  const seconds = n / sampleRateHz;
  if (seconds <= 0) return null;
  const cadence = Math.round((peaks / seconds) * 60);
  return clip(cadence, 0, 220);
}

// 피처 빌드 + 표준화. opts로 단위 변환 여부를 결정한다.
function buildInput(samples, { accScale, gyroScale, clipInt16, mean, scale }) {
  const n = samples.length;
  const accs = new Array(n);
  const gyros = new Array(n);
  let mx = 0, my = 0, mz = 0;
  for (let i = 0; i < n; i++) {
    let ax = samples[i][0] * accScale;
    let ay = samples[i][1] * accScale;
    let az = samples[i][2] * accScale;
    let gx = samples[i][3] * gyroScale;
    let gy = samples[i][4] * gyroScale;
    let gz = samples[i][5] * gyroScale;
    if (clipInt16) {
      ax = clip(ax, INT16_MIN, INT16_MAX); ay = clip(ay, INT16_MIN, INT16_MAX); az = clip(az, INT16_MIN, INT16_MAX);
      gx = clip(gx, INT16_MIN, INT16_MAX); gy = clip(gy, INT16_MIN, INT16_MAX); gz = clip(gz, INT16_MIN, INT16_MAX);
    }
    accs[i] = [ax, ay, az];
    gyros[i] = [gx, gy, gz];
    mx += ax; my += ay; mz += az;
  }
  mx /= n; my /= n; mz /= n;

  const out = new Float32Array(n * FEATURES);
  for (let i = 0; i < n; i++) {
    const [ax, ay, az] = accs[i];
    const [gx, gy, gz] = gyros[i];
    const dx = ax - mx, dy = ay - my, dz = az - mz;
    const norm = Math.sqrt(ax * ax + ay * ay + az * az);
    const f = [ax, ay, az, gx, gy, gz, dx, dy, dz, norm];
    const base = i * FEATURES;
    for (let k = 0; k < FEATURES; k++) out[base + k] = (f[k] - mean[k]) / scale[k];
  }
  return out;
}

// 1차(동작분류): int16 단위로 변환 후 stage1 scaler 정규화.
export function buildStage1Input(samples100) {
  return buildInput(samples100, {
    accScale: ACC_COUNTS_PER_G,
    gyroScale: GYRO_COUNTS_PER_RAD,
    clipInt16: true,
    mean: stage1Scaler.mean,
    scale: stage1Scaler.scale,
  });
}

// 2차(정상/이상): g·rad/s 원단위 그대로, stage2 scaler 정규화.
export function buildStage2Input(samples100) {
  return buildInput(samples100, {
    accScale: 1,
    gyroScale: 1,
    clipInt16: false,
    mean: stage2Scaler.mean,
    scale: stage2Scaler.scale,
  });
}

// 모델 출력(logits 또는 확률)을 확률로 정규화 + argmax.
export function softmaxArgmax(raw) {
  const arr = Array.from(raw, Number);
  let sum = arr.reduce((a, b) => a + b, 0);
  const looksLikeProb = arr.every((v) => v >= 0) && Math.abs(sum - 1) < 0.02;
  let probs;
  if (looksLikeProb) {
    probs = arr;
  } else {
    const max = Math.max(...arr);
    const exps = arr.map((v) => Math.exp(v - max));
    const esum = exps.reduce((a, b) => a + b, 0);
    probs = exps.map((v) => v / esum);
  }
  let idx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[idx]) idx = i;
  return { probs, idx, confidence: probs[idx] };
}

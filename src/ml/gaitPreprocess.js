// 보행 분석 전처리 (순수 함수 — 네이티브 의존성 없음, 단위 테스트 가능).
// 입력 윈도우: [[ax,ay,az,gx,gy,gz], ...]  (expo-sensors 단위: acc=g, gyro=rad/s)
//
// 정완이형 모델(normal/abnormal 보행 분류) 입력 형태: (1, 100, 10), 피처 순서:
//   acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, acc_x_dyn, acc_y_dyn, acc_z_dyn, acc_norm
//   - acc_dyn = acc - mean(acc over window) (중력/오프셋 제거한 동적 성분)
//   - acc_norm = ||acc|| (중력 포함 크기)
// 학습 단위가 g·rad/s 원단위(scaler acc_norm 평균≈1.0)라 expo-sensors 값을 변환 없이 그대로 쓴다.

import gaitScaler from '../../assets/models/gait_scaler.json';

export const WINDOW_SIZE = gaitScaler.window_size;        // 100
export const SAMPLE_RATE_HZ = gaitScaler.sample_rate_hz;  // 50
export const CLASSES = gaitScaler.classes;                // ['normal','abnormal']
const FEATURES = gaitScaler.feature_names.length;         // 10
const MEAN = gaitScaler.mean;
const SCALE = gaitScaler.scale;

const clip = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// 윈도우를 정확히 WINDOW_SIZE 샘플로 맞춘다. 더 길면 최근 N개, 짧으면 앞을 첫 샘플로 패딩.
export function resampleWindow(window) {
  const n = window.length;
  if (n >= WINDOW_SIZE) return window.slice(n - WINDOW_SIZE);
  const pad = [];
  const first = window[0] || [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < WINDOW_SIZE - n; i++) pad.push(first);
  return pad.concat(window);
}

// 정지 판정 휴리스틱 (raw g/rad/s 기준). 거의 안 움직이면 보행 모델을 돌리지 않고 STATIONARY로 단축.
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
export function estimateCadence(samples, sampleRateHz = SAMPLE_RATE_HZ) {
  const n = samples.length;
  if (n < 4) return null;
  let mx = 0, my = 0, mz = 0;
  for (const s of samples) { mx += s[0]; my += s[1]; mz += s[2]; }
  mx /= n; my /= n; mz /= n;
  const mag = new Array(n);
  for (let i = 0; i < n; i++) {
    const dx = samples[i][0] - mx, dy = samples[i][1] - my, dz = samples[i][2] - mz;
    mag[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
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

// 모델 입력 빌드: 피처 10개 계산 후 scaler(mean/scale)로 표준화 → Float32Array (WINDOW_SIZE*FEATURES).
export function buildInput(samples) {
  const n = samples.length;
  let mx = 0, my = 0, mz = 0;
  for (let i = 0; i < n; i++) { mx += samples[i][0]; my += samples[i][1]; mz += samples[i][2]; }
  mx /= n; my /= n; mz /= n;

  const out = new Float32Array(n * FEATURES);
  for (let i = 0; i < n; i++) {
    const [ax, ay, az, gx, gy, gz] = samples[i];
    const dx = ax - mx, dy = ay - my, dz = az - mz;
    const norm = Math.sqrt(ax * ax + ay * ay + az * az);
    const f = [ax, ay, az, gx, gy, gz, dx, dy, dz, norm];
    const base = i * FEATURES;
    for (let k = 0; k < FEATURES; k++) out[base + k] = (f[k] - MEAN[k]) / SCALE[k];
  }
  return out;
}

// 모델 출력(logits 또는 확률)을 확률로 정규화 + argmax.
export function softmaxArgmax(raw) {
  const arr = Array.from(raw, Number);
  const sum = arr.reduce((a, b) => a + b, 0);
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

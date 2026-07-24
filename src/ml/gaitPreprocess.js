// 보행 분석 전처리 (순수 함수 — 네이티브 의존성 없음, 단위 테스트 가능).
// 입력 윈도우: [[ax,ay,az,gx,gy,gz], ...]  (expo-sensors 단위: acc=g, gyro=rad/s)
//
// 2단계 on-device 파이프라인 (두 모델 모두 입력 (1,100,10), g·rad/s 원단위):
//   피처 순서: acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, acc_x_dyn, acc_y_dyn, acc_z_dyn, acc_norm
//     - acc_dyn = acc - mean(acc over window) (중력/오프셋 제거한 동적 성분)
//     - acc_norm = ||acc|| (중력 포함 크기)
//   1차(동작분류, 정완 huga+93 재학습본)·2차(정상/이상) 모두 g·rad/s 원단위(scaler acc_norm 평균≈1.0~1.2)
//   → 변환 없이 스케일러(mean/scale)만 다르게 정규화한다.

import stage1Scaler from '../../assets/models/gait_stage1_scaler.json';
import stage2Scaler from '../../assets/models/gait_scaler.json';

export const WINDOW_SIZE = stage2Scaler.window_size;        // 100
export const SAMPLE_RATE_HZ = stage2Scaler.sample_rate_hz;  // 50
export const STAGE1_CLASSES = stage1Scaler.classes;         // ['downstairs','running','sitting','standing','upstairs','walking']
export const STAGE2_CLASSES = stage2Scaler.classes;         // ['normal','abnormal']
const FEATURES = stage2Scaler.feature_names.length;         // 10

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

// 정지 판정 휴리스틱 (raw g/rad/s 기준, 방향 무관). 거의 안 움직이면 모델 추론 없이 STATIONARY로 단축.
// 1차 모델이 정지 자세를 잘 못 거르므로(주머니 도메인), 이 게이트가 sitting/standing 필터를 담당한다.
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

// 연속(스트리밍) 걸음 검출기 — 윈도우 분석과 분리해 원시 가속도 스트림에서 걸음을 실시간 카운트.
// (분석 윈도우는 50% 겹쳐서 윈도우별 피크를 더하면 이중 카운트됨 → 스트림에서 직접 센다.)
// 핵심: 걷기는 '리듬이 지속'된다. 임계를 넘는 피크라도 규칙적 간격으로 MIN_RUN개 이상 연속돼야
//   걸음으로 인정 → 일어서기·손 흔들기 같은 고립 동작은 걸러진다(리듬 게이팅).
//   적응 임계(최근 동적신호 크기) + 히스테리시스 + 불응기로 피크 검출, 그 위에 리듬 확인.
// ⚠️ 임계 상수는 주머니 보행 기준 초기값 — 실기기로 튜닝 필요.
export function createStepCounter() {
  const GRAV_ALPHA = 0.02;   // 중력 baseline 저역통과(느림)
  const DYN_ALPHA = 0.4;     // 동적 성분 평활(약함)
  const LEVEL_ALPHA = 0.03;  // 걸음 강도 baseline(적응 임계용)
  const K_HI = 1.2;          // 상단 임계 배수(= K_HI × level 넘으면 피크 후보)
  const K_LO = 0.5;          // 하단 임계 배수(히스테리시스: 이 아래로 내려가야 다음 피크 준비)
  const MIN_STEP_MS = 280;   // 불응기 = 최소 걸음 간격(~214 spm 상한)
  const MAX_STEP_MS = 1000;  // 최대 걸음 간격 — 넘으면 리듬 끊김(고립 동작)
  const MIN_LEVEL = 0.06;    // 이 미만 동적신호면 정지로 보고 무시(g)
  const MIN_RUN = 3;         // 규칙 리듬이 이만큼 연속돼야 걸음 인정(고립 동작 배제)

  let grav = null, dyn = 0, level = MIN_LEVEL, armed = true;
  let lastPeakT = -Infinity; // 마지막 피크(후보) 시각
  let run = 0;               // 연속 리듬 피크 수
  const buf = [];            // 리듬 확정 전 대기 걸음 후보 {t, turning}
  const steps = [];          // 확정된 걸음 {t, turning} — 변동성·대칭성 산출용

  return {
    // 샘플 1개 투입(turning=현재 회전 중 여부) → 걸음 수가 증가하면 true.
    push(ax, ay, az, tMs, turning) {
      const mag = Math.sqrt(ax * ax + ay * ay + az * az);
      grav = grav == null ? mag : grav + GRAV_ALPHA * (mag - grav);
      dyn += DYN_ALPHA * ((mag - grav) - dyn);
      level += LEVEL_ALPHA * (Math.abs(dyn) - level);
      const eff = Math.max(level, MIN_LEVEL);

      let counted = false;
      if (armed && dyn > K_HI * eff && tMs - lastPeakT >= MIN_STEP_MS) {
        const interval = tMs - lastPeakT;
        lastPeakT = tMs;
        armed = false;
        const rec = { t: tMs, turning: !!turning };
        if (interval <= MAX_STEP_MS) {
          run++;
          if (run < MIN_RUN) buf.push(rec);                                 // 리듬 확인 전 — 버퍼링
          else if (run === MIN_RUN) { buf.push(rec); steps.push(...buf); buf.length = 0; counted = true; }  // 확정 → 소급
          else { steps.push(rec); counted = true; }                         // 이미 확정, 즉시
        } else {
          run = 1; buf.length = 0; buf.push(rec);                           // 간격 과대 → 고립 피크, 새 런
        }
      } else if (!armed && dyn < K_LO * eff) {
        armed = true;
      }
      return counted;
    },
    get count() { return steps.length; },
    get steps() { return steps; },
  };
}

// 회전(방향 전환) 검출기 — 수직축(중력 방향) 기준 yaw 각속도로 판정. 주머니라 폰 방향을 모르므로
// 중력축을 가속도 저역통과로 추정하고, 자이로를 그 축에 투영해 heading(yaw) 각속도를 얻는다.
// 회전 구간의 걸음은 실제로 비대칭이라(안/바깥 다리) 대칭성·변동성 산출에서 제외해야 한다.
export function createTurnDetector() {
  const GRAV_ALPHA = 0.02;  // 중력축 추정 저역통과
  const YAW_ALPHA = 0.25;   // yaw 각속도 평활
  const ON = 0.6;           // 회전 진입 임계(rad/s ≈ 34°/s)
  const OFF = 0.35;         // 회전 해제 임계(히스테리시스)

  let gx = 0, gy = 0, gz = 1;  // 중력 단위벡터(초기 대략 z축)
  let yaw = 0, turning = false;

  return {
    // acc(g)로 중력축 갱신 + gyro(rad/s)를 중력축에 투영 → yaw rate. 회전 중이면 true.
    push(ax, ay, az, wx, wy, wz) {
      gx += GRAV_ALPHA * (ax - gx); gy += GRAV_ALPHA * (ay - gy); gz += GRAV_ALPHA * (az - gz);
      const gn = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
      const yawRate = Math.abs((wx * gx + wy * gy + wz * gz) / gn);  // 자이로의 중력축 성분
      yaw += YAW_ALPHA * (yawRate - yaw);
      if (!turning && yaw > ON) turning = true;
      else if (turning && yaw < OFF) turning = false;
      return turning;
    },
    get turning() { return turning; },
  };
}

// 걸음 지표(변동성·좌우대칭성) — 회전 걸음은 제외하고 직진 '연속 구간(bout)'별로 산출.
//  변동성 = 걸음 간격 변동계수 CV(%) (낮을수록 규칙적).
//  좌우대칭성 = 구간 내 홀/짝 간격(좌우 교대 근사) 차이 → 100=완전 대칭(단일 센서 '추정치').
// steps: [{t, turning}]. 표본(직진 간격) 부족하면 null.
export function computeGaitMetrics(steps, minSteps = 8) {
  const bouts = [];
  let cur = [];
  for (const s of steps) {
    if (s.turning) { if (cur.length) { bouts.push(cur); cur = []; } continue; }  // 회전 → 구간 끊김
    cur.push(s.t);
  }
  if (cur.length) bouts.push(cur);

  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const all = [];
  let asymSum = 0, asymW = 0;
  for (const b of bouts) {
    const iv = [];
    for (let i = 1; i < b.length; i++) { const d = b[i] - b[i - 1]; if (d > 0 && d <= 2000) iv.push(d); }
    if (iv.length < 2) continue;
    for (const d of iv) all.push(d);
    const odd = [], even = [];
    iv.forEach((d, i) => (i % 2 ? even : odd).push(d));  // 좌우 교대 근사
    if (odd.length && even.length) {
      const a = mean(odd), c = mean(even);
      asymSum += (Math.abs(a - c) / ((a + c) / 2) * 100) * iv.length;
      asymW += iv.length;
    }
  }
  if (all.length < minSteps) return null;
  const m = mean(all);
  const sd = Math.sqrt(mean(all.map((d) => (d - m) ** 2)));
  return {
    variability: Math.round((sd / m) * 100),
    symmetry: asymW ? Math.max(0, Math.round(100 - asymSum / asymW)) : 100,
    straightSteps: all.length + 1,
  };
}

// 피처 10개 계산 후 scaler(mean/scale)로 표준화 → Float32Array (WINDOW_SIZE*FEATURES).
// 1차·2차 모두 g·rad/s 원단위 입력, 스케일러(mean/scale)만 다르다.
function buildInput(samples, mean, scale) {
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
    for (let k = 0; k < FEATURES; k++) out[base + k] = (f[k] - mean[k]) / scale[k];
  }
  return out;
}

// 1차(동작분류) — 정완 huga+93 재학습본(g단위). stage1 scaler로 정규화.
export function buildStage1Input(samples) {
  return buildInput(samples, stage1Scaler.mean, stage1Scaler.scale);
}

// 2차(정상/이상) — g·rad/s 원단위. stage2 scaler로 정규화.
export function buildStage2Input(samples) {
  return buildInput(samples, stage2Scaler.mean, stage2Scaler.scale);
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

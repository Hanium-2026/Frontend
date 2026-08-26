// 백그라운드 상시 측정 — 타당성 검증 프로브.
//
// 확인하려는 것은 하나다: 앱이 백그라운드로 간 뒤에도
// react-native-fast-tflite의 runSync가 계속 도는가?
// expo-location v54 문서는 JS 런타임이 살아 있는지를 명시하지 않는다 → 실측이 필요하다.
// 여기서 막히면 «센서를 서비스로 옮긴다»는 계획 자체를 다시 짜야 하므로 가장 먼저 확인한다.
//
// 방법
//   ① expo-location의 Android foreground service로 프로세스를 살려 둔다(지속 알림).
//      위치값 자체는 쓰지 않는다 — 프로세스를 붙잡아 두는 것이 목적이다.
//   ② 같은 JS 런타임에서 TICK_MS마다 2차 모델 추론을 돌려 카운터를 남긴다.
//   ③ 홈 버튼으로 백그라운드 전환 → 몇 분 뒤 복귀 → 카운터가 늘어 있으면 성공.
//      멈춰 있으면 JS가 정지한 것이고, 기록이 통째로 없으면 프로세스가 죽은 것이다.
//
// ⚠️ 검증용이다. 통과하면 이 구조 위에 실제 센서·파이프라인을 얹고, 이 파일은 지운다.
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { buildStage2Input, STAGE2_WINDOW_SIZE } from './gaitPreprocess';
import { setItem, getItem, removeItem } from '../store/storage';

const TASK = 'nevo-bg-probe';
const KEY = 'bgProbeLog';
const TICK_MS = 2000;

// 태스크는 top-level scope에 정의해야 한다(expo-task-manager 요구사항).
// 위치 이벤트로 하는 일은 없다 — foreground service를 띄우는 것이 유일한 목적이다.
TaskManager.defineTask(TASK, ({ error }) => {
  if (error) console.log('[bgProbe] location task error:', error.message);
});

let _model = null;
let _timer = null;
let _state = null;

const persist = (s) => {
  _state = s;
  setItem(KEY, JSON.stringify(s)).catch(() => {});
};

// 추론 입력은 고정 합성 파형이다 — 점수가 아니라 «runSync가 도는가»만 보므로 값은 상관없다.
const SYNTH = Array.from({ length: STAGE2_WINDOW_SIZE }, (_, i) => [
  1 + Math.sin(i / 8) * 0.3, 1.5 + Math.cos(i / 11) * 0.2,
]);

export async function readProbe() {
  if (_state) return _state;
  try {
    const raw = await getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isProbeRunning() {
  return _timer != null;
}

export async function startProbe() {
  if (_timer) return { ok: true, note: '이미 실행 중' };

  // 1) 권한 — foreground service는 위치 권한 위에서 동작한다.
  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') status = (await Location.requestForegroundPermissionsAsync()).status;
  if (status !== 'granted') return { ok: false, note: '위치 권한이 거부됐어요' };

  // 2) 모델 — useGaitPipeline과 같은 방식(에셋을 로컬 파일로 받아 file:// 로드).
  if (!_model) {
    try {
      const asset = Asset.fromModule(require('../../assets/models/gait_model.tflite'));
      if (!asset.downloaded) await asset.downloadAsync();
      _model = await loadTensorflowModel({ url: asset.localUri || asset.uri }, []);
    } catch (e) {
      return { ok: false, note: `모델 로드 실패: ${e?.message || e}` };
    }
  }

  // 3) foreground service 기동
  try {
    await Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60_000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: 'NEVO 걸음 측정 중',
        notificationBody: '걸음을 자동으로 확인하고 있어요.',
        notificationColor: '#1B4F9C',
      },
    });
  } catch (e) {
    return { ok: false, note: `foreground service 실패: ${e?.message || e}` };
  }

  persist({ startedAt: Date.now(), ticks: 0, lastTickAt: null, lastMs: null, lastError: null });

  // 4) 주기 추론 — 이 타이머가 백그라운드에서도 계속 도는지가 검증의 핵심이다.
  _timer = setInterval(() => {
    const s = _state;
    if (!s) return;
    const t0 = Date.now();
    try {
      const out = _model.runSync([buildStage2Input(SYNTH).buffer]);
      const p = new Float32Array(out[0]);
      persist({
        ...s,
        ticks: s.ticks + 1,
        lastTickAt: Date.now(),
        lastMs: Date.now() - t0,
        lastP: Math.round((p[0] ?? 0) * 1000) / 1000,
        lastError: null,
      });
    } catch (e) {
      persist({ ...s, ticks: s.ticks + 1, lastTickAt: Date.now(), lastError: e?.message || String(e) });
    }
  }, TICK_MS);

  return { ok: true, note: '검증 시작 — 홈 버튼으로 나갔다가 2분 뒤 돌아오세요' };
}

export async function stopProbe() {
  if (_timer) { clearInterval(_timer); _timer = null; }
  try {
    if (await TaskManager.isTaskRegisteredAsync(TASK)) await Location.stopLocationUpdatesAsync(TASK);
  } catch { /* 이미 내려갔으면 무시 */ }
}

export async function clearProbe() {
  await stopProbe();
  _state = null;
  await removeItem(KEY).catch(() => {});
}

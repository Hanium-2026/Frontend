// 백그라운드 상시 측정 — 타당성 검증 프로브 (v2).
//
// v1 결과(2026-09-02, 실기기 Galaxy S21): 메인 JS 컨텍스트의 setInterval은 foreground
// service 알림이 떠 있어도 앱이 백그라운드로 가는 순간 완전히 멈춘다(재개도 안 됨).
// React Native는 보통 화면(Activity)에 묶인 JS 컨텍스트 하나만 돌리므로, 화면이
// 백그라운드로 가면 그 컨텍스트의 타이머도 함께 멈추는 게 원인 — 애초에 틀린 경로였다.
//
// v2가 검증하는 다른 경로: expo-task-manager가 위치 이벤트마다 부르는
// TaskManager.defineTask 콜백은 OS가 별도로 깨워서 실행한다(백그라운드 위치 추적이
// 원래 이렇게 동작한다). 이 콜백 안에서 실제 추론(runSync)을 돌려도 살아있는지가
// 이번 검증의 핵심이다.
//
// 두 경로를 동시에 돌려 한 화면에서 바로 비교한다:
//   fgTicks — 메인 컨텍스트 setInterval(2초마다) — 백그라운드에서 멈출 것으로 이미 확인됨
//   bgTicks — TaskManager 콜백(위치 업데이트마다, ~timeInterval 간격) — 여기가 살아있어야 진짜 해법
//
// ⚠️ 검증용이다. bgTicks가 백그라운드에서도 늘어나면 이 구조 위에 실제 센서·파이프라인을
// 얹고, 이 파일은 지운다. 그래도 멈추면 「센서를 서비스로 옮긴다」는 계획 자체를 다시 짜야 한다.
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Asset } from 'expo-asset';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { buildStage2Input, STAGE2_WINDOW_SIZE } from './gaitPreprocess';
import { setItem, getItem, removeItem } from '../store/storage';

const TASK = 'nevo-bg-probe';
const KEY = 'bgProbeLog';
export const FG_TICK_MS = 2000;
export const BG_TIME_INTERVAL_MS = 15_000;   // 위치 업데이트 요청 간격 — 실제 배터리 사용은 이 값이 아니라 OS가 결정

// 상태바에 점수를 보이게 하는 알림 — expo-location의 foregroundService 알림과는 별개다.
// ⚠️ expo-location 쪽 알림(notificationTitle/Body)은 네이티브 소스로 확인한 결과
// AppForegroundedSingleton.isForegrounded가 true일 때만 갱신된다(LocationTaskConsumer.kt
// maybeStartForegroundService) — 즉 앱이 백그라운드인 동안은 절대 못 바꾼다. 그래서 점수는
// expo-notifications의 별도 알림(같은 identifier로 갱신, 포그라운드 여부 무관)으로 띄운다.
// 기존 위치 알림은 LOW 채널이라 "기타 알림"에 접혀 들어간다 — 이 채널은 DEFAULT로 만들어
// 접히지 않고 바로 보이게 한다(소리는 안 남).
const SCORE_CHANNEL_ID = 'nevo-score';
const SCORE_NOTIF_ID = 'nevo-score-live';

let _channelReady = false;
async function ensureScoreChannel() {
  if (_channelReady) return;
  await Notifications.setNotificationChannelAsync(SCORE_CHANNEL_ID, {
    name: '걸음 점수',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  });
  _channelReady = true;
}

async function updateScoreNotification(score) {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: SCORE_NOTIF_ID,   // 같은 id로 다시 보내면 새 알림이 아니라 기존 걸 갱신한다
      content: {
        title: 'NEVO 걸음 측정',
        body: `오늘 점수 ${score}점`,
        sticky: true,       // 스와이프로 안 지워짐(측정 중임을 계속 보여줌)
        autoDismiss: false,
      },
      trigger: { channelId: SCORE_CHANNEL_ID },   // 즉시 발송
    });
  } catch (e) {
    console.log('[bgProbe] score notification failed:', e?.message || e);
  }
}

// 추론 입력은 고정 합성 파형이다 — 점수가 아니라 «runSync가 도는가»만 보므로 값은 상관없다.
const SYNTH = Array.from({ length: STAGE2_WINDOW_SIZE }, (_, i) => [
  1 + Math.sin(i / 8) * 0.3, 1.5 + Math.cos(i / 11) * 0.2,
]);

let _model = null;
let _timer = null;
let _state = null;

const persist = (s) => {
  _state = s;
  setItem(KEY, JSON.stringify(s)).catch(() => {});
};

// startProbe()가 이미 로드해뒀으면 그대로 쓰고, 콜백이 먼저(프로세스 콜드 스타트로) 불려도
// 여기서 자체적으로 로드한다 — 헤드리스 태스크는 앱이 완전히 종료된 뒤에도 호출될 수 있다.
async function ensureModel() {
  if (_model) return _model;
  const asset = Asset.fromModule(require('../../assets/models/gait_model.tflite'));
  if (!asset.downloaded) await asset.downloadAsync();
  _model = await loadTensorflowModel({ url: asset.localUri || asset.uri }, []);
  return _model;
}

function runInferenceTick(kind) {
  const s = _state || { startedAt: Date.now(), fgTicks: 0, bgTicks: 0 };
  const t0 = Date.now();
  try {
    const out = _model.runSync([buildStage2Input(SYNTH).buffer]);
    const p = new Float32Array(out[0]);
    persist({
      ...s,
      fgTicks: s.fgTicks + (kind === 'fg' ? 1 : 0),
      bgTicks: s.bgTicks + (kind === 'bg' ? 1 : 0),
      lastKind: kind,
      lastTickAt: Date.now(),
      lastMs: Date.now() - t0,
      lastP: Math.round((p[0] ?? 0) * 1000) / 1000,
      lastError: null,
    });
    // bg 틱마다 상태바 점수 갱신 — 백그라운드에서도 실제로 도는지 알림으로 바로 확인 가능.
    // (앱 화면 점수 공식과 동일: score=(1-P이상)×100)
    if (kind === 'bg') updateScoreNotification(Math.round((1 - (p[0] ?? 0)) * 100));
  } catch (e) {
    persist({
      ...s,
      fgTicks: s.fgTicks + (kind === 'fg' ? 1 : 0),
      bgTicks: s.bgTicks + (kind === 'bg' ? 1 : 0),
      lastKind: kind,
      lastTickAt: Date.now(),
      lastError: e?.message || String(e),
    });
  }
}

// 태스크는 top-level scope에 정의해야 한다(expo-task-manager 요구사항).
// OS가 위치 이벤트마다(백그라운드에서도) 이 콜백을 직접 깨워서 부른다 — bgTicks의 출처.
TaskManager.defineTask(TASK, async ({ error }) => {
  if (error) { console.log('[bgProbe] task error:', error.message); return; }
  try {
    await ensureModel();
    runInferenceTick('bg');
  } catch (e) {
    console.log('[bgProbe] bg tick failed:', e?.message || e);
  }
});

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

  // ⚠️ 안드로이드는 백그라운드 위치를 별도 단계로 요청해야 한다(포그라운드와 한 번에 안 됨).
  // 이게 없으면 foreground service가 떠 있어도 TaskManager 콜백이 백그라운드에서 안 온다
  // (2026-09-02 실기기로 확인 — bgTicks가 계속 0, ACCESS_BACKGROUND_LOCATION 매니페스트 누락이 원인).
  let bgStatus = (await Location.getBackgroundPermissionsAsync()).status;
  if (bgStatus !== 'granted') bgStatus = (await Location.requestBackgroundPermissionsAsync()).status;
  if (bgStatus !== 'granted') return { ok: false, note: '백그라운드 위치 권한이 거부됐어요(설정에서 "항상 허용" 필요)' };

  // 2) 모델 — useGaitPipeline과 같은 방식(에셋을 로컬 파일로 받아 file:// 로드).
  try {
    await ensureModel();
  } catch (e) {
    return { ok: false, note: `모델 로드 실패: ${e?.message || e}` };
  }

  await ensureScoreChannel().catch(() => {});

  // 3) foreground service 기동 — 위치값 자체는 안 쓴다. bgTicks의 실제 동력은 TaskManager 콜백.
  try {
    await Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: BG_TIME_INTERVAL_MS,
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

  persist({ startedAt: Date.now(), fgTicks: 0, bgTicks: 0, lastTickAt: null, lastMs: null, lastError: null });

  // 4) 메인 컨텍스트 타이머 — v1에서 백그라운드 시 멈추는 것으로 이미 확인됨.
  // bgTicks와 나란히 남겨 이번 테스트에서도 "포그라운드 동안만 fgTicks가 늘고,
  // 백그라운드에서도 bgTicks만 계속 느는지"를 한 화면에서 바로 비교하기 위해 유지한다.
  _timer = setInterval(() => runInferenceTick('fg'), FG_TICK_MS);

  return { ok: true, note: '검증 시작 — 홈 버튼으로 나갔다가 몇 분 뒤 돌아오세요' };
}

export async function stopProbe() {
  if (_timer) { clearInterval(_timer); _timer = null; }
  try {
    if (await TaskManager.isTaskRegisteredAsync(TASK)) await Location.stopLocationUpdatesAsync(TASK);
  } catch { /* 이미 내려갔으면 무시 */ }
  await Notifications.dismissNotificationAsync(SCORE_NOTIF_ID).catch(() => {});
}

export async function clearProbe() {
  await stopProbe();
  _state = null;
  await removeItem(KEY).catch(() => {});
}

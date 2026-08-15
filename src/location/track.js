// WARD 자동 위치 전송 — 앱이 켜져있는(포그라운드) 동안 주기적으로 백엔드에 업로드.
// 백그라운드로 가면 멈추고, 다시 포그라운드로 오면 재개. 실패해도 앱 흐름은 막지 않는다.
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { uploadLocation } from '../api/location';

const INTERVAL_MS = 30_000;

let _timer = null;
let _appStateSub = null;

async function sendOnce() {
  try {
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    await uploadLocation(current.coords.latitude, current.coords.longitude);
  } catch (e) {
    console.log('[location] auto upload skipped:', e?.message || String(e));
  }
}

// 로그인 성공 후 / 앱 시작 시(WARD 로그인 상태) 호출.
export async function startLocationTracking() {
  if (_timer) return; // 이미 실행 중

  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') status = (await Location.requestForegroundPermissionsAsync()).status;
  if (status !== 'granted') return;

  sendOnce();
  _timer = setInterval(sendOnce, INTERVAL_MS);

  _appStateSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      if (!_timer) {
        sendOnce();
        _timer = setInterval(sendOnce, INTERVAL_MS);
      }
    } else if (_timer) {
      clearInterval(_timer);
      _timer = null;
    }
  });
}

// 로그아웃 시 호출.
export function stopLocationTracking() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
  _appStateSub?.remove();
  _appStateSub = null;
}

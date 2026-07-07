// FCM 푸시 등록/해제.
// 백엔드(FcmService)가 네이티브 FCM 토큰으로 "직접" 발송하므로, Expo 푸시 토큰이 아니라
// getDevicePushTokenAsync()의 네이티브 FCM 등록 토큰을 백엔드 device-token에 등록한다.
// ⚠️ google-services.json + app.json의 android.googleServicesFile 이 있어야 토큰 획득 가능 —
//    없으면 getDevicePushTokenAsync가 throw → 조용히 스킵(앱은 계속 동작). dev build에서만 유효.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { updateDeviceToken, deleteDeviceToken } from '../api/user';

// 포그라운드에서도 배너/소리로 알림 표시. (필드는 구/신 버전 모두 대응)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let _registered = false;

// 로그인 성공 후 / 앱 시작 시(로그인 상태) 호출. 권한 요청 → 네이티브 FCM 토큰 → 백엔드 등록.
// 실패해도(권한 거부·google-services 미설정 등) 앱 흐름은 막지 않는다. (fire-and-forget)
export async function registerPushToken() {
  if (Platform.OS === 'web') return;
  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;

    const { data: token } = await Notifications.getDevicePushTokenAsync(); // Android: 네이티브 FCM 토큰
    if (token) {
      await updateDeviceToken(token);
      _registered = true;
    }
  } catch (e) {
    console.log('[push] register skipped:', e?.message || String(e));
  }
}

// 로그아웃 시 호출. 토큰이 아직 유효할 때 서버에서 제거.
export async function unregisterPushToken() {
  if (!_registered) return;
  try { await deleteDeviceToken(); } catch {}
  _registered = false;
}

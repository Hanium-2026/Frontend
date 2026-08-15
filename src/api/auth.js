// 인증 API — 백엔드 /api/auth 컨트롤러 계약 그대로.
import { api } from './client';
import { tokenStore } from '../store/tokenStore';
import { getItem, setItem } from '../store/storage';
import { registerPushToken, unregisterPushToken } from '../notifications/push';
import { startLocationTracking, stopLocationTracking } from '../location/track';

// 디바이스 식별자: 로그인/회원가입에 필수. 최초 1회 생성 후 영속.
const DEVICE_KEY = 'nevo.deviceId';
let _deviceId = null;
export async function getDeviceId() {
  if (_deviceId) return _deviceId;
  let id = await getItem(DEVICE_KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    await setItem(DEVICE_KEY, id);
  }
  _deviceId = id;
  return id;
}

// SMS OTP 발송. purpose: 'SIGNUP' | 'PASSWORD_RESET'
export const sendSms = (phone, purpose = 'SIGNUP') =>
  api.post('/api/auth/sms/send', { phone, purpose });

// SMS OTP 검증. 성공 시 10분간 인증 상태 유지(서버 Redis).
export const verifySms = (phone, code, purpose = 'SIGNUP') =>
  api.post('/api/auth/sms/verify', { phone, code, purpose });

// 회원가입. SMS 인증 완료 후 호출. 성공 시 토큰 저장.
// payload: { phone, password, name, role, consents, [height, weight, birthDate, gender] }
export async function signUp(payload) {
  const deviceId = await getDeviceId();
  const data = await api.post('/api/auth/sign-up', { ...payload, deviceId });
  await tokenStore.save({ accessToken: data.accessToken, refreshToken: data.refreshToken, role: data.role });
  registerPushToken(); // FCM 토큰 등록(비동기, 실패해도 흐름 유지)
  if (data.role === 'WARD') startLocationTracking(); // 자동 위치 전송 시작(비동기, 실패해도 흐름 유지)
  return data; // { accessToken, refreshToken, role }
}

// 로그인. 성공 시 토큰 저장.
export async function login(phone, password) {
  const deviceId = await getDeviceId();
  const data = await api.post('/api/auth/login', { phone, password, deviceId });
  await tokenStore.save({ accessToken: data.accessToken, refreshToken: data.refreshToken, role: data.role });
  registerPushToken(); // FCM 토큰 등록(비동기, 실패해도 흐름 유지)
  if (data.role === 'WARD') startLocationTracking(); // 자동 위치 전송 시작(비동기, 실패해도 흐름 유지)
  return data; // { accessToken, refreshToken, role }
}

// 로그아웃. 서버에서 refreshToken 무효화 후 로컬 토큰 제거.
export async function logout() {
  const refreshToken = tokenStore.getRefresh();
  try {
    stopLocationTracking(); // 자동 위치 전송 중지
    await unregisterPushToken(); // 토큰이 아직 유효할 때 서버에서 FCM 토큰 제거
    if (refreshToken) await api.post('/api/auth/logout', { refreshToken });
  } finally {
    await tokenStore.clear();
  }
}

export const requestPasswordReset = (phone) =>
  api.post('/api/auth/password-reset/request', { phone });

export const confirmPasswordReset = (phone, newPassword) =>
  api.post('/api/auth/password-reset/confirm', { phone, newPassword });

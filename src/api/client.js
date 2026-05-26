// NEVO 백엔드(Spring) API 클라이언트.
// AI 추론 서버(src/api.js, :8000)와는 별개. 이쪽은 세션/인증/리포트 등 비즈니스 API.
import { tokenStore } from '../store/tokenStore';

// 폰(Expo Go)에서 접속하려면 노트북 LAN IP. 같은 WiFi 필수. IP 바뀌면 여기 수정.
// (웹/에뮬레이터만 테스트할 땐 http://localhost:8080 으로 바꿔도 됨)
export const BACKEND_BASE = 'http://172.20.10.4:8080';

// 인증 없이 호출하는 경로 (Authorization 헤더 미부착 + 401 갱신 시도 안 함).
const PUBLIC_PATHS = [
  '/api/auth/sms/send',
  '/api/auth/sms/verify',
  '/api/auth/sign-up',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/auth/password-reset/request',
  '/api/auth/password-reset/confirm',
];

const isPublic = (path) => PUBLIC_PATHS.some((p) => path.startsWith(p));

// 백엔드 ErrorResponse({code, message, timestamp})를 담는 에러.
export class ApiError extends Error {
  constructor({ status, code, message }) {
    super(message || code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 동시 401 발생 시 refresh가 한 번만 돌도록 단일 실행 보장.
let _refreshing = null;

async function refreshTokens() {
  if (_refreshing) return _refreshing;
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError({ status: 401, code: 'NO_REFRESH_TOKEN' });

  _refreshing = (async () => {
    const res = await fetch(`${BACKEND_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      await tokenStore.clear();
      throw new ApiError({ status: res.status, code: json?.code, message: json?.message });
    }
    await tokenStore.save({
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    });
    return json.data.accessToken;
  })();

  try {
    return await _refreshing;
  } finally {
    _refreshing = null;
  }
}

// 핵심 요청 함수. 성공 시 응답 래퍼의 data만 반환, 실패 시 ApiError throw.
async function request(method, path, body, { _retried = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const useAuth = !isPublic(path);
  if (useAuth) {
    const access = tokenStore.getAccess();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${BACKEND_BASE}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });

  // 401 → 토큰 갱신 후 1회 재시도 (인증 경로/이미 재시도한 경우 제외).
  if (res.status === 401 && useAuth && !_retried) {
    await refreshTokens();
    return request(method, path, body, { _retried: true });
  }

  // 204 또는 빈 바디 대응.
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError({ status: res.status, code: json?.code, message: json?.message });
  }
  return json?.data ?? null;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};

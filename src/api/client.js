// NEVO backend (Spring) API client.
// Separate from the AI score server in src/api.js (:8000).
import { tokenStore } from '../store/tokenStore';
import { serverConfig } from '../store/serverConfig';

// 백엔드 주소는 런타임 설정(serverConfig)에서 가져온다. 기본값/오버라이드 모두 거기서 관리.
const backendBase = () => serverConfig.getBackendBase();

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

export class ApiError extends Error {
  constructor({ status, code, message }) {
    super(message || code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let _refreshing = null;

async function refreshTokens() {
  if (_refreshing) return _refreshing;
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError({ status: 401, code: 'NO_REFRESH_TOKEN' });

  _refreshing = (async () => {
    const res = await fetch(`${backendBase()}/api/auth/refresh`, {
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

async function request(method, path, body, { _retried = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const useAuth = !isPublic(path);
  if (useAuth) {
    const access = tokenStore.getAccess();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${backendBase()}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && useAuth && !_retried) {
    await refreshTokens();
    return request(method, path, body, { _retried: true });
  }

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

// 토큰 저장소. 디스크 영속은 storage.js(secure-store/웹 폴백)에 위임하고, 여기선 메모리 캐시 관리.
import { getItem, setItem, removeItem } from './storage';

const ACCESS = 'nevo.accessToken';
const REFRESH = 'nevo.refreshToken';
const ROLE = 'nevo.role';   // 'WARD' | 'GUARDIAN' — 앱 시작 시 네트워크 없이 라우팅용

let _access = null;
let _refresh = null;
let _role = null;

export const tokenStore = {
  // 앱 시작 시 1회 호출해 디스크 → 메모리 로드.
  async load() {
    _access = await getItem(ACCESS);
    _refresh = await getItem(REFRESH);
    _role = await getItem(ROLE);
    return { accessToken: _access, refreshToken: _refresh, role: _role };
  },

  getAccess: () => _access,
  getRefresh: () => _refresh,
  getRole: () => _role,
  isLoggedIn: () => _access != null,

  async save({ accessToken, refreshToken, role }) {
    _access = accessToken;
    _refresh = refreshToken;
    if (role !== undefined) _role = role;
    await Promise.all([
      setItem(ACCESS, accessToken),
      setItem(REFRESH, refreshToken),
      role !== undefined ? setItem(ROLE, role) : Promise.resolve(),
    ]);
  },

  async clear() {
    _access = null;
    _refresh = null;
    _role = null;
    await Promise.all([removeItem(ACCESS), removeItem(REFRESH), removeItem(ROLE)]);
  },
};

// 백엔드 서버 주소 런타임 설정. 기본값은 코드에, 사용자 오버라이드는 storage(secure-store/웹)에 둔다.
// 로컬 테스트 시 노트북 LAN IP로 바꾸는 등 APK 재빌드 없이 앱 설정 화면에서 주소를 바꿔 쓰기 위한 용도.
// (AI 추론은 on-device로 전환되어 별도 AI 서버 주소 설정은 제거됨)
import { getItem, setItem, removeItem } from './storage';

const BACKEND_KEY = 'nevo.serverConfig.backend';

// 백엔드(Spring) — 현재 로컬 PC LAN IP(추후 배포 주소로 교체 예정).
export const DEFAULT_BACKEND_BASE = 'http://192.168.219.103:8080';

let _backend = DEFAULT_BACKEND_BASE;

// 끝의 슬래시 제거 — 호출부가 `${base}/path` 형태라 base는 슬래시 없이 보관.
const normalize = (url) => (url || '').trim().replace(/\/+$/, '');

export const serverConfig = {
  // 앱 시작 시 1회 호출해 디스크 → 메모리 로드. 저장값 없으면 기본값 유지.
  async load() {
    const b = await getItem(BACKEND_KEY);
    if (b) _backend = b;
    return { backendBase: _backend };
  },

  getBackendBase: () => _backend,
  isBackendDefault: () => _backend === DEFAULT_BACKEND_BASE,

  // 빈 문자열이 들어오면 기본값으로 되돌린다.
  async save({ backendBase }) {
    if (backendBase !== undefined) {
      _backend = normalize(backendBase) || DEFAULT_BACKEND_BASE;
      await setItem(BACKEND_KEY, _backend);
    }
    return { backendBase: _backend };
  },

  async reset() {
    _backend = DEFAULT_BACKEND_BASE;
    await removeItem(BACKEND_KEY);
  },
};

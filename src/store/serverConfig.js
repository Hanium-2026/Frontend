// 서버 주소 런타임 설정. 기본값은 코드에, 사용자 오버라이드는 storage(secure-store/웹)에 둔다.
// AI 추론 서버 주소가 자주 바뀌므로(LAN IP 변동·ngrok 터널 재시작 등) APK 재빌드 없이
// 앱 설정 화면에서 주소를 바꿔 쓰기 위한 용도.
import { getItem, setItem, removeItem } from './storage';

const BACKEND_KEY = 'nevo.serverConfig.backend';
const AI_KEY = 'nevo.serverConfig.ai';

// 백엔드(Spring) — 현재 로컬 PC LAN IP(추후 배포 주소로 교체 예정). AI 추론 서버도 동일 LAN.
export const DEFAULT_BACKEND_BASE = 'http://172.30.1.47:8080';
export const DEFAULT_AI_BASE = 'http://172.30.1.47:8000';

let _backend = DEFAULT_BACKEND_BASE;
let _ai = DEFAULT_AI_BASE;

// 끝의 슬래시 제거 — 호출부가 `${base}/path` 형태라 base는 슬래시 없이 보관.
const normalize = (url) => (url || '').trim().replace(/\/+$/, '');

export const serverConfig = {
  // 앱 시작 시 1회 호출해 디스크 → 메모리 로드. 저장값 없으면 기본값 유지.
  async load() {
    const b = await getItem(BACKEND_KEY);
    const a = await getItem(AI_KEY);
    if (b) _backend = b;
    if (a) _ai = a;
    return { backendBase: _backend, aiBase: _ai };
  },

  getBackendBase: () => _backend,
  getAiBase: () => _ai,
  isBackendDefault: () => _backend === DEFAULT_BACKEND_BASE,
  isAiDefault: () => _ai === DEFAULT_AI_BASE,

  // 빈 문자열이 들어오면 해당 항목을 기본값으로 되돌린다.
  async save({ backendBase, aiBase }) {
    if (backendBase !== undefined) {
      _backend = normalize(backendBase) || DEFAULT_BACKEND_BASE;
      await setItem(BACKEND_KEY, _backend);
    }
    if (aiBase !== undefined) {
      _ai = normalize(aiBase) || DEFAULT_AI_BASE;
      await setItem(AI_KEY, _ai);
    }
    return { backendBase: _backend, aiBase: _ai };
  },

  async reset() {
    _backend = DEFAULT_BACKEND_BASE;
    _ai = DEFAULT_AI_BASE;
    await Promise.all([removeItem(BACKEND_KEY), removeItem(AI_KEY)]);
  },
};

// 위치 API — 백엔드 /api/locations 컨트롤러 계약 그대로.
import { api } from './client';
import { serverConfig } from '../store/serverConfig';

// WARD: 현재 위치 업로드.
export const uploadLocation = (latitude, longitude) =>
  api.post('/api/locations', { latitude, longitude });

// GUARDIAN: 실시간 위치 SSE 스트림 URL.
// ⚠️ 이 엔드포인트는 JWT 인증 필요. 표준 EventSource는 Authorization 헤더를 못 보내므로
//    웹에선 그대로 못 붙고, 네이티브는 헤더 지원 SSE 클라이언트(react-native-sse 등)가 필요.
export const locationStreamUrl = (wardId) => `${serverConfig.getBackendBase()}/api/locations/stream/${wardId}`;

// GUARDIAN: 하루 동선(위치 이력) 조회. date 생략 시 백엔드가 오늘(KST)로 처리.
export const getLocationHistory = (wardId, date) =>
  api.get(`/api/locations/${wardId}/history${date ? `?date=${date}` : ''}`);

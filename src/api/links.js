// 가족(보호자-노약자) 연동 API — 백엔드 /api/ward-link 컨트롤러 계약 그대로.
// 모델: WARD가 보호자 전화번호로 코드 생성 → GUARDIAN이 그 코드로 연결.
import { api } from './client';

// WARD: 보호자에게 줄 연동 코드 생성. → { code, expiresAt }
export const generateLinkCode = (guardianPhone) => api.post('/api/ward-link/code', { guardianPhone });

// GUARDIAN: 코드로 노약자와 연결.
export const connectWard = (code) => api.post('/api/ward-link', { code });

// GUARDIAN: 연동된 노약자 목록. → [{ wardId, name, linkedAt }]
export const getMyWards = () => api.get('/api/ward-link/wards');

// WARD: 연동된 보호자 목록. → [{ guardianUserId, name, linkedAt }]
export const getMyGuardians = () => api.get('/api/ward-link/guardians');

// GUARDIAN: 연동 해제.
export const disconnectWard = (wardId) => api.del(`/api/ward-link/${wardId}`);

// GUARDIAN: 특정 노약자 알림 목록. → [{ alertId, type, sessionId, message, createdAt }]
export const getWardAlerts = (wardId) => api.get(`/api/ward-link/${wardId}/alerts`);

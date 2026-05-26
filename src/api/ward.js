// 노약자 신체정보 API — 백엔드 /api/wards 컨트롤러 계약 그대로. WARD 전용.
import { api } from './client';

export const getPhysicalInfo = () => api.get('/api/wards/me/physical-info'); // → { id, height, weight, birthDate, gender }

// payload: { height, weight, birthDate(YYYY-MM-DD), gender('MALE'|'FEMALE') }
export const updatePhysicalInfo = (payload) => api.put('/api/wards/me/physical-info', payload);

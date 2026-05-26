// 사용자 API — 백엔드 /api/users 컨트롤러 계약 그대로.
import { api } from './client';

export const getMe = () => api.get('/api/users/me');            // → { id, phone, name, role }
export const updateMe = (name) => api.put('/api/users/me', { name });
export const updateDeviceToken = (fcmToken) => api.post('/api/users/device-token', { fcmToken });
export const deleteDeviceToken = () => api.del('/api/users/device-token');
export const deleteAccount = () => api.del('/api/users/me');

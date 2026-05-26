// 보행 리포트 API — 백엔드 /api/gait/reports 컨트롤러 계약 그대로.
import { api } from './client';

// WARD 전용: 최근 7일 일별 통계 + 세션 목록. → { dailyScores[], sessions[] }
export const getDailyReport = () => api.get('/api/gait/reports/daily');

// GUARDIAN 전용: 연동 노약자 기간별 통계(days=7/30/90) + 오늘 지표. → { dailyScores[], todayMetrics }
export const getGuardianDailyReport = (wardId, days = 30) =>
  api.get(`/api/gait/reports/ward/${wardId}/daily?days=${days}`);

// GUARDIAN 전용: 연동된 모든 노약자 최신 상태 요약. → { wards: [WardSummary] }
export const getDashboard = () => api.get('/api/gait/reports/dashboard');

// 세션 단건 상세 (WARD 본인 / GUARDIAN 연동 노약자).
export const getSessionReport = (sessionId) => api.get(`/api/gait/reports/${sessionId}`);

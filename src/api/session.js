// 보행 세션 API — 백엔드 /api/gait/sessions 컨트롤러 계약 그대로. WARD 전용.
// 점수는 앱(AI 추론 서버)이 계산해 분당 집계로 업로드한다.
import { api, ApiError } from './client';

export const startSession = () =>
  api.post('/api/gait/sessions/start'); // → { sessionId, startedAt }

// 진행 중 세션이 없으면 백엔드가 404(SESSION404) → null 반환.
export async function getActiveSession() {
  try {
    return await api.get('/api/gait/sessions/active'); // { sessionId, startedAt }
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

// 진행 중 세션을 가져오고 없으면 새로 시작. → { sessionId, startedAt }
export async function ensureSession() {
  const active = await getActiveSession();
  if (active) return active;
  return startSession();
}

// 분당 집계 배치 업로드. data: [{ minuteAt, avgScore, minScore, maxScore, dangerCount }]
export const uploadData = (sessionId, data) =>
  api.post(`/api/gait/sessions/${sessionId}/data`, { data }); // → { saved, skipped }

export const stopSession = (sessionId) =>
  api.post(`/api/gait/sessions/${sessionId}/stop`);

// 세션 종합 분석. payload: { riskLevel, avgScore, minScore, maxScore, dangerCount, reportSummary?, variabilityScore?, asymmetryScore? }
export const uploadAnalysis = (sessionId, payload) =>
  api.post(`/api/gait/sessions/${sessionId}/analysis`, payload);

// 백엔드 LocalDateTime(yyyy-MM-ddTHH:mm:ss) 분 단위 키. 로컬 시각 기준(타임존/Z 없음).
const pad = (n) => String(n).padStart(2, '0');
export function toMinuteAt(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

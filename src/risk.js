// 위험도 색(톤) 단일 기준. 모든 화면이 이 함수를 통해 같은 색을 쓴다.
//   점수 < 50             → danger  (위험 · 빨강)
//   SUSPECTED 또는 50~69  → caution (주의 · 노랑)
//   그 외                 → ok      (안정 · 초록)
// 점수가 없으면(측정 전) ok로 본다. riskLevel은 백엔드 NORMAL/SUSPECTED.
export function riskTone(score, riskLevel) {
  if (score != null && score < 50) return 'danger';
  if (riskLevel === 'SUSPECTED' || (score != null && score < 70)) return 'caution';
  return 'ok';
}

export const RISK_LABEL = { ok: '안정', caution: '주의', danger: '위험' };

// 백엔드 dailyScores는 기록이 있는 날만 준다(빈 날을 채워주지 않는다).
// 그래서 배열 마지막을 «오늘»로 보면 며칠 전 점수가 오늘로 표시되고,
// 그대로 차트에 넣으면 월·수·금이 연속 3일처럼 그려진다.
// 최근 n일을 날짜로 채워 기록 없는 날을 빈 칸(row=null)으로 남긴다.
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function fillDays(rows, n = 7) {
  const byDate = new Map((rows ?? []).map((d) => [String(d.date).slice(0, 10), d]));
  const base = new Date();
  return Array.from({ length: n }, (_, i) => {
    const dt = new Date(base);
    dt.setDate(base.getDate() - (n - 1 - i));
    return { label: WEEKDAY[dt.getDay()], row: byDate.get(ymd(dt)) ?? null };
  });
}

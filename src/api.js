// 노트북 추론 서버 주소 (폰과 같은 WiFi). 노트북 IP가 바뀌면 여기만 수정.
export const API_BASE = 'http://172.30.1.24:8000';

// 가속도+자이로 윈도우를 보내 보행 이상 점수를 받는다.
// samples: [[ax,ay,az, gx,gy,gz], ...]  (acc=G단위, gyro=rad/s)
export async function scoreWindow(samples) {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples }),
  });
  return res.json();
}

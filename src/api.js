// AI 추론 서버 호출. 주소는 런타임 설정(serverConfig)에서 가져온다 — IP/터널 주소가 자주 바뀌므로.
import { serverConfig } from './store/serverConfig';

// Sends one IMU window and receives activity classification plus gait score.
// samples: [[ax, ay, az, gx, gy, gz], ...]  (acc=g, gyro=rad/s)
export async function scoreWindow(samples) {
  const res = await fetch(`${serverConfig.getAiBase()}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples }),
  });
  return res.json();
}

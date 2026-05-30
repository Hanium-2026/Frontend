// AI score server address. Use the laptop Wi-Fi IP when testing on a phone.
export const API_BASE = 'http://172.30.1.21:8000';

// Sends one IMU window and receives activity classification plus gait score.
// samples: [[ax, ay, az, gx, gy, gz], ...]  (acc=g, gyro=rad/s)
export async function scoreWindow(samples) {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples }),
  });
  return res.json();
}

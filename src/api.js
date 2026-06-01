// AI score server address. Set EXPO_PUBLIC_AI_BASE in .env.local for phone tests.
export const API_BASE = process.env.EXPO_PUBLIC_AI_BASE || 'http://localhost:8000';

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

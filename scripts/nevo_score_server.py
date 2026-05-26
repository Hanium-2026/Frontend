from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import math
import statistics


def clamp(value, low, high):
    return max(low, min(high, value))


def score_samples(samples):
    if not samples:
        return {"activityState": "WAITING", "score": None, "riskLevel": "NORMAL", "cadence": None}

    acc_mag = []
    gyro_mag = []
    for row in samples:
        vals = list(row) + [0, 0, 0, 0, 0, 0]
        ax, ay, az, gx, gy, gz = vals[:6]
        acc_mag.append(math.sqrt(ax * ax + ay * ay + az * az))
        gyro_mag.append(math.sqrt(gx * gx + gy * gy + gz * gz))

    acc_std = statistics.pstdev(acc_mag) if len(acc_mag) > 1 else 0
    gyro_avg = sum(gyro_mag) / len(gyro_mag)

    if acc_std < 0.025 and gyro_avg < 0.04:
        return {"activityState": "STATIONARY", "score": None, "riskLevel": "NORMAL", "cadence": None}

    # Lightweight dev heuristic: regular walking motion scores higher, large jitter scores lower.
    rhythm = clamp((acc_std - 0.03) / 0.18, 0, 1)
    instability = clamp((acc_std - 0.22) / 0.28, 0, 1)
    rotation_penalty = clamp((gyro_avg - 1.2) / 2.0, 0, 1)
    score = round(clamp(72 + rhythm * 22 - instability * 32 - rotation_penalty * 16, 25, 98))
    risk = "SUSPECTED" if score < 60 else "NORMAL"
    cadence = round(clamp(82 + rhythm * 36 - instability * 18, 55, 125))
    return {"activityState": "WALKING", "score": score, "riskLevel": risk, "cadence": cadence}


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self._send(200, {"ok": True})

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"ok": True})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/score":
            self._send(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            self._send(200, score_samples(payload.get("samples") or []))
        except Exception as exc:
            self._send(400, {"error": str(exc)})

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)
    print("NEVO dev score server listening on http://0.0.0.0:8000", flush=True)
    server.serve_forever()

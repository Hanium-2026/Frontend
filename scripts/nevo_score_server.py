from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import math
import statistics
import threading

try:
    import numpy as np
except Exception as exc:  # pragma: no cover - runtime diagnostic path
    np = None
    NUMPY_ERROR = exc
else:
    NUMPY_ERROR = None


ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "models" / "hugadb"
MODEL_PATH = MODEL_DIR / "best_model.tflite"
SCALER_PATH = MODEL_DIR / "scaler_params.json"
WINDOW_SIZE = 100
INPUT_FEATURES = 10
DEFAULT_CLASSES = ["downstairs", "running", "sitting", "standing", "upstairs", "walking"]
LOCOMOTION_CLASSES = {"downstairs", "running", "upstairs", "walking"}
STATIONARY_CLASSES = {"sitting", "standing"}
HUGADB_ACC_COUNTS_PER_G = 32768.0 / 2.0
HUGADB_GYRO_COUNTS_PER_RAD = (32768.0 / 2000.0) * (180.0 / math.pi)
HUGADB_INT16_MIN = -32768.0
HUGADB_INT16_MAX = 32767.0


def clamp(value, low, high):
    return max(low, min(high, value))


def as_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_samples(samples):
    rows = []
    for row in samples or []:
        if not isinstance(row, (list, tuple)):
            continue
        vals = list(row) + [0, 0, 0, 0, 0, 0]
        rows.append([as_float(v) for v in vals[:6]])
    return rows


def heuristic_score(samples):
    rows = normalize_samples(samples)
    if not rows:
        return {
            "activityState": "WAITING",
            "score": None,
            "riskLevel": "NORMAL",
            "cadence": None,
            "activityClass": None,
            "activityConfidence": None,
            "activityProbabilities": None,
        }

    acc_mag = []
    gyro_mag = []
    for ax, ay, az, gx, gy, gz in rows:
        acc_mag.append(math.sqrt(ax * ax + ay * ay + az * az))
        gyro_mag.append(math.sqrt(gx * gx + gy * gy + gz * gz))

    acc_std = statistics.pstdev(acc_mag) if len(acc_mag) > 1 else 0
    gyro_avg = sum(gyro_mag) / len(gyro_mag)

    if acc_std < 0.025 and gyro_avg < 0.04:
        return {
            "activityState": "STATIONARY",
            "score": None,
            "riskLevel": "NORMAL",
            "cadence": None,
            "activityClass": "stationary",
            "activityConfidence": None,
            "activityProbabilities": None,
            "accStd": acc_std,
            "gyroAvg": gyro_avg,
        }

    # Temporary stage-2 placeholder: HuGaDB only classifies activity. Until the
    # normal/abnormal gait model is ready, keep the previous live score heuristic.
    rhythm = clamp((acc_std - 0.03) / 0.18, 0, 1)
    instability = clamp((acc_std - 0.22) / 0.28, 0, 1)
    rotation_penalty = clamp((gyro_avg - 1.2) / 2.0, 0, 1)
    score = round(clamp(72 + rhythm * 22 - instability * 32 - rotation_penalty * 16, 25, 98))
    risk = "SUSPECTED" if score < 60 else "NORMAL"
    cadence = round(clamp(82 + rhythm * 36 - instability * 18, 55, 125))
    return {
        "activityState": "WALKING",
        "score": score,
        "riskLevel": risk,
        "cadence": cadence,
        "activityClass": "walking",
        "activityConfidence": None,
        "activityProbabilities": None,
        "accStd": acc_std,
        "gyroAvg": gyro_avg,
    }


def load_interpreter_class():
    attempts = [
        ("ai-edge-litert", "ai_edge_litert.interpreter"),
        ("tflite-runtime", "tflite_runtime.interpreter"),
        ("tensorflow", "tensorflow.lite.python.interpreter"),
    ]
    errors = []
    for runtime_name, module_name in attempts:
        try:
            module = __import__(module_name, fromlist=["Interpreter"])
            return runtime_name, module.Interpreter, None
        except Exception as exc:
            errors.append(f"{runtime_name}: {type(exc).__name__}: {exc}")
    return None, None, "; ".join(errors)


class HugadbClassifier:
    def __init__(self):
        self.lock = threading.Lock()
        self.loaded = False
        self.runtime = None
        self.error = None
        self.classes = DEFAULT_CLASSES
        self.mean = None
        self.scale = None
        self.interpreter = None
        self.input_index = None
        self.output_index = None
        self.input_dtype = None
        self._load()

    def _load(self):
        if np is None:
            self.error = f"numpy unavailable: {type(NUMPY_ERROR).__name__}: {NUMPY_ERROR}"
            return
        if not MODEL_PATH.exists():
            self.error = f"model file not found: {MODEL_PATH}"
            return
        if not SCALER_PATH.exists():
            self.error = f"scaler file not found: {SCALER_PATH}"
            return

        try:
            scaler = json.loads(SCALER_PATH.read_text(encoding="utf-8"))
            self.mean = np.asarray(scaler["mean"], dtype=np.float32).reshape(1, INPUT_FEATURES)
            self.scale = np.asarray(scaler["scale"], dtype=np.float32).reshape(1, INPUT_FEATURES)
            self.classes = scaler.get("classes") or DEFAULT_CLASSES
        except Exception as exc:
            self.error = f"failed to load scaler: {type(exc).__name__}: {exc}"
            return

        runtime, Interpreter, import_error = load_interpreter_class()
        if Interpreter is None:
            self.error = f"TFLite runtime unavailable: {import_error}"
            return

        try:
            # LiteRT on Windows can fail to open paths containing non-ASCII
            # characters. Passing model bytes avoids that path encoding issue.
            interpreter = Interpreter(model_content=MODEL_PATH.read_bytes())
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()[0]
            output_details = interpreter.get_output_details()[0]
            self.runtime = runtime
            self.interpreter = interpreter
            self.input_index = input_details["index"]
            self.output_index = output_details["index"]
            self.input_dtype = input_details.get("dtype", np.float32)
            self.loaded = True
        except Exception as exc:
            self.error = f"failed to load model: {type(exc).__name__}: {exc}"

    def preprocess(self, samples):
        rows = normalize_samples(samples)
        if not rows:
            return None

        arr = np.asarray(rows, dtype=np.float32)
        if arr.shape[0] >= WINDOW_SIZE:
            arr = arr[-WINDOW_SIZE:]
        else:
            pad = np.repeat(arr[[0]], WINDOW_SIZE - arr.shape[0], axis=0)
            arr = np.vstack([pad, arr])

        # Expo sends acceleration in g and gyroscope in rad/s. HuGaDB stores
        # int16 sensor counts: accel range +/-2g, gyro range +/-2000 deg/s.
        acc = np.clip(arr[:, 0:3] * HUGADB_ACC_COUNTS_PER_G, HUGADB_INT16_MIN, HUGADB_INT16_MAX)
        gyro = np.clip(arr[:, 3:6] * HUGADB_GYRO_COUNTS_PER_RAD, HUGADB_INT16_MIN, HUGADB_INT16_MAX)
        acc_dyn = acc - np.mean(acc, axis=0, keepdims=True)
        acc_norm = np.linalg.norm(acc, axis=1, keepdims=True)
        features = np.concatenate([acc, gyro, acc_dyn, acc_norm], axis=1)
        scaled = (features - self.mean) / self.scale
        return scaled.reshape(1, WINDOW_SIZE, INPUT_FEATURES).astype(self.input_dtype)

    def predict(self, samples):
        if not self.loaded:
            return None
        model_input = self.preprocess(samples)
        if model_input is None:
            return None

        with self.lock:
            self.interpreter.set_tensor(self.input_index, model_input)
            self.interpreter.invoke()
            raw = self.interpreter.get_tensor(self.output_index)[0]

        probs = np.asarray(raw, dtype=np.float64).reshape(-1)
        if probs.size != len(self.classes):
            raise ValueError(f"unexpected output shape: {raw.shape}")
        if np.any(probs < 0) or abs(float(np.sum(probs)) - 1.0) > 0.02:
            probs = np.exp(probs - np.max(probs))
            probs = probs / np.sum(probs)
        probs = np.clip(probs, 0.0, 1.0)
        total = float(np.sum(probs))
        if total > 0:
            probs = probs / total

        idx = int(np.argmax(probs))
        activity_class = self.classes[idx]
        confidence = float(probs[idx])
        return {
            "activityClass": activity_class,
            "activityConfidence": round(confidence, 4),
            "activityProbabilities": {
                cls: round(float(prob), 4)
                for cls, prob in zip(self.classes, probs)
            },
        }

    def health(self):
        return {
            "loaded": self.loaded,
            "runtime": self.runtime,
            "modelPath": str(MODEL_PATH),
            "scalerPath": str(SCALER_PATH),
            "inputUnitMode": "expo-g-radps-to-hugadb-int16-counts",
            "accCountsPerG": HUGADB_ACC_COUNTS_PER_G,
            "gyroCountsPerRad": HUGADB_GYRO_COUNTS_PER_RAD,
            "error": self.error,
        }


CLASSIFIER = HugadbClassifier()


def score_samples(samples):
    heuristic = heuristic_score(samples)
    response = {
        **heuristic,
        "modelLoaded": CLASSIFIER.loaded,
        "modelRuntime": CLASSIFIER.runtime,
        "modelStage": "activity-classification-v1",
        "modelInputUnitMode": "expo-g-radps-to-hugadb-int16-counts",
        "scoreSource": "heuristic-until-gait-stage2",
        "abnormalType": None,
    }

    if not normalize_samples(samples):
        return response

    if not CLASSIFIER.loaded:
        response["modelError"] = CLASSIFIER.error
        return response

    try:
        model_result = CLASSIFIER.predict(samples)
    except Exception as exc:
        response["modelError"] = f"{type(exc).__name__}: {exc}"
        return response

    if not model_result:
        return response

    activity_class = model_result["activityClass"]
    confidence = model_result["activityConfidence"]
    response.update({
        **model_result,
        "modelActivityClass": activity_class,
        "modelActivityConfidence": confidence,
        "modelReliable": True,
    })

    # The app currently treats activityState=WALKING as "collect this gait score".
    # HuGaDB locomotion labels are exposed separately via activityClass.
    if heuristic["activityState"] == "STATIONARY":
        response.update({
            "activityState": "STATIONARY",
            "score": None,
            "riskLevel": "NORMAL",
            "cadence": None,
        })
    elif activity_class in STATIONARY_CLASSES and confidence >= 0.8:
        response.update({
            "activityState": "STATIONARY",
            "score": None,
            "riskLevel": "NORMAL",
            "cadence": None,
        })
    else:
        response["activityState"] = "WALKING"

    return response


class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
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
            self._send(200, {"ok": True, "model": CLASSIFIER.health()})
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
    print("NEVO score server listening on http://0.0.0.0:8000", flush=True)
    print("HuGaDB model:", json.dumps(CLASSIFIER.health(), ensure_ascii=False), flush=True)
    server.serve_forever()

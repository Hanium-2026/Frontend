# IMU 기반 보행 동작 분류 AI 모델

스마트폰 내장 IMU 센서(가속도계 + 자이로스코프)로 6가지 보행 동작을 실시간 분류하는 온디바이스 AI 모델.

---

## 1. 모델 개요

| 항목 | 내용 |
|------|------|
| 모델 종류 | TCN (Temporal Convolutional Network) |
| 모델 파일 형식 | `.h5` (Keras), `.tflite` (앱 탑재용) |
| 파라미터 수 | 110,150개 (약 0.11M) |
| 프레임워크 | TensorFlow 2.20 / Keras |
| 학습 환경 | Google Colab (T4 GPU) |

---

## 2. 분류 클래스 (6개)

| 클래스 | 설명 |
|--------|------|
| `walking` | 걷기 |
| `running` | 달리기 |
| `sitting` | 앉기 |
| `standing` | 서있기 |
| `upstairs` | 계단 올라가기 |
| `downstairs` | 계단 내려가기 |

---

## 3. 데이터셋

| 항목 | 내용 |
|------|------|
| 데이터셋 이름 | **HuGaDB** (Human Gait Database) |
| 파일명 | `HuGaDB_processed_50hz.csv` |
| 총 데이터 수 | 783,957 rows |
| 샘플링 주파수 | 50 Hz |
| 클래스 구성 | 6개 전부 포함 |

### 클래스별 데이터 수

| 클래스 | 행 수 |
|--------|-------|
| walking | 262,508 |
| standing | 185,280 |
| upstairs | 112,577 |
| downstairs | 99,846 |
| sitting | 68,813 |
| running | 54,933 |

### 데이터 분리

| 분할 | 비율 | 윈도우 수 |
|------|------|-----------|
| Train | 70% | 8,211 |
| Validation | 15% | 1,759 |
| Test | 15% | 1,760 |

---

## 4. 입력 형태

| 항목 | 내용 |
|------|------|
| 입력 shape | `(1, 100, 10)` — batch × timesteps × features |
| 윈도우 크기 | 100 steps = **2초** @ 50Hz |
| 슬라이딩 스트라이드 | 50 steps (50% 오버랩) |
| 센서 | 가속도계 3축 + 자이로스코프 3축 |
| 피처 수 | **10개** |

### 10개 입력 피처 구성

| 피처 | 설명 |
|------|------|
| `acc_x`, `acc_y`, `acc_z` | 원본 가속도 (중력 포함, 단위: g) |
| `gyro_x`, `gyro_y`, `gyro_z` | 자이로스코프 (단위: rad/s) |
| `acc_x_dyn`, `acc_y_dyn`, `acc_z_dyn` | 동적 가속도 = acc - window_mean(acc) |
| `acc_norm` | 가속도 크기 = √(acc_x² + acc_y² + acc_z²) |

> `acc_dyn`: 윈도우 평균을 빼서 중력 성분을 제거한 값. 폰 거치 방향에 무관한 동작 패턴을 추출.
> `acc_norm`: 방향과 완전히 독립적인 가속도 크기.

---

## 5. 모델 구조

```
입력: (batch, 100, 10)

Input Projection — Conv1D(64, 1×1)
    ↓
Residual Block 1 — Dilated Conv1D (dilation=1)
    ↓
Residual Block 2 — Dilated Conv1D (dilation=2)
    ↓
Residual Block 3 — Dilated Conv1D (dilation=4)
    ↓
Residual Block 4 — Dilated Conv1D (dilation=8)
    ↓
GlobalAveragePooling1D
    ↓
Dense(128, ReLU) + Dropout(0.3)
    ↓
Dense(6, Softmax)

출력: (batch, 6)  ← 6개 클래스 확률
```

### Residual Block 내부

```
입력
├── Dilated Causal Conv1D → BN → ReLU → Dropout
│   Dilated Causal Conv1D → BN → Dropout
└── Skip Connection (1×1 Conv 채널 맞춤)
Add → ReLU
```

---

## 6. 성능 지표

### 전체 요약

| 지표 | 값 |
|------|----|
| **Test Accuracy** | **99.43%** |
| Test Loss | 0.0317 |
| Macro F1-score | 0.9942 |
| Weighted F1-score | 0.9943 |
| 학습 에폭 | 17 (Early Stopping, best: epoch 9) |

### 클래스별 상세 성능

| 클래스 | Precision | Recall | F1-score | Support |
|--------|-----------|--------|----------|---------|
| downstairs | 0.9948 | 0.9746 | 0.9846 | 197 |
| running | 1.0000 | 1.0000 | 1.0000 | 149 |
| sitting | 1.0000 | 1.0000 | 1.0000 | 142 |
| standing | 1.0000 | 0.9978 | 0.9989 | 449 |
| upstairs | 0.9795 | 0.9958 | 0.9876 | 240 |
| walking | 0.9932 | 0.9949 | 0.9940 | 583 |
| **macro avg** | **0.9946** | **0.9938** | **0.9942** | 1,760 |

---

## 7. 저장 파일

```
hugadb_output/
├── best_model.h5                  (1,448 KB) — Keras 전체 모델
├── best_model.tflite              (443 KB)   — 앱 탑재용 (float32)
├── best_model_quantized.tflite    (139 KB)   — 경량화 버전 (3.2× 압축)
├── scaler_params.json             (1 KB)     — 정규화 파라미터 (필수)
├── confusion_matrix.png                      — 혼동 행렬
├── training_curves.png                       — 학습 곡선
└── test_report.txt                           — 테스트 결과 텍스트
```

### 앱 연동 시 필요한 파일

| 파일 | 용도 |
|------|------|
| `best_model.tflite` | TFLite 추론 모델 |
| `scaler_params.json` | 입력 정규화 (반드시 동일하게 적용) |

---

## 8. Android 연동 가이드

### 입력 준비 순서

```
1. IMU 센서에서 100샘플 수집 (2초 @ 50Hz)
2. 10개 피처 계산:
   - acc_dyn = acc - mean(acc in window)
   - acc_norm = sqrt(acc_x² + acc_y² + acc_z²)
3. scaler_params.json의 mean/scale로 StandardScaler 적용:
   - input_normalized = (input - mean) / scale
4. TFLite 모델 추론:
   - 입력 shape: float[1][100][10]
5. 출력: 6개 클래스 확률 → argmax로 동작 분류
```

### 피처 순서 (반드시 준수)

```
index 0~2  : acc_x, acc_y, acc_z
index 3~5  : gyro_x, gyro_y, gyro_z
index 6~8  : acc_x_dyn, acc_y_dyn, acc_z_dyn
index 9    : acc_norm
```

### 클래스 인덱스

```
0: downstairs
1: running
2: sitting
3: standing
4: upstairs
5: walking
```

---

## 9. 학습 하이퍼파라미터

| 파라미터 | 값 |
|----------|----|
| Optimizer | Adam |
| Learning Rate | 0.001 (ReduceLROnPlateau 적용) |
| Batch Size | 64 |
| Max Epochs | 50 |
| Early Stopping patience | 8 |
| Dropout | 0.3 |
| TCN Filters | 64 |
| TCN Kernel Size | 3 |
| TCN Blocks | 4 |
| 정규화 | StandardScaler (Train 기준 fit) |
| 클래스 불균형 처리 | compute_class_weight('balanced') + walking 다운샘플링 |

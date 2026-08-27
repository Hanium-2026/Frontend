# NEVO Frontend — AGENTS.md

> 에이전트(Claude/Codex)가 읽고 작업하는 단일 기준 문서. 매 세션 컨텍스트에 자동 로드된다.
> 최종 업데이트: 2026-08-27
>
> 📌 **넣을 것 / 넣지 말 것**: 이 문서는 **다음 작업의 판단을 바꾸는 것만** 담는다(규칙·계약·열린 작업).
>    "언제 무엇을 했다"는 경위는 git 히스토리가 정확하므로 여기 쓰지 않는다. 틀린 줄은 없는 줄보다 나쁘다.
>
> 📌 **기준 = 개발보고서**: 이 문서의 "목표" 항목은 한이음 개발보고서를 따른다. "현재 구현"과 갭이 있으면
>    보고서 쪽이 목표이고 코드를 거기에 맞춰 간다(문서를 코드 현실로 후퇴시키지 말 것).

## 핵심 방향 (2026-06)
- **앱**: NEVO — 스마트폰 IMU 기반 보행 분석으로 퇴행성 뇌질환(파킨슨·뇌졸중) 초기 보행 변화를 일상에서 조기 탐지
- **플랫폼**: **Android 전용** (iOS / 웹 / Vercel 폐기)
- **AI 추론**: **on-device 2단계 TFLite** — 1차 동작분류(walk/not-walk) → 2차 정상/이상(TCN). 추론은 기기에서 수행하고, 서버는 **저장·리포트·FCM 알림만** 담당(별도 AI 추론 서버 없음). (예정) 3차 이상유형
- ★ **측정 방식 = 백그라운드 상시 측정** (목표). 사용자가 버튼을 눌러 30초 재는 앱이 **아니다.**
  앱이 켜져 있지 않아도 하루 종일 IMU를 돌려 일상 보행을 모으는 것이 목적이고,
  **1차 게이트가 존재하는 이유가 바로 이것**이다 — 깨어 있는 시간의 대부분은 비보행 구간이라,
  게이트 없이 2차 TCN을 상시 돌리면 배터리가 남지 않는다. 게이트는 최적화가 아니라 아키텍처의 전제다.
  ⚠️ **현재 구현은 포그라운드 세션 방식**(`ElderMeasure` 화면을 벗어나면 센서 구독 해제)이다.
  화면·정보구조는 **상시 측정 전제로 설계**한다(문서를 코드 현실로 후퇴시키지 말 것).
- **역할**: WARD(노인) / GUARDIAN(보호자) — 백엔드 JWT 역할과 1:1
- **배포**: Google Play (dev build로 개발/테스트 중)

⚠️ Expo 코드 작성 전 정확한 버전 문서 확인: https://docs.expo.dev/versions/v54.0.0/ (추측 금지)

## 기술 스택
| 항목 | 내용 |
|------|------|
| 프레임워크 | Expo SDK 54 (RN 0.81.5, React 19.1.0, newArch on) |
| 언어 | JavaScript (JSX) — **TypeScript 아님** |
| 라우팅 | Expo Router (파일 기반) |
| 센서/추론 | expo-sensors, react-native-fast-tflite (dev build 필요) |
| 차트·그라디언트·폰트 | react-native-svg, expo-linear-gradient, Pretendard(expo-font) |
| 위치/실시간 | expo-location, react-native-sse, @mj-studio/react-native-naver-map |

## 프로젝트 구조
```
app/                  # Expo Router 라우트 ((auth)/(elder)/(caregiver))
assets/models/        # on-device TFLite 모델 + scaler
src/
  api/                # 백엔드 API 클라이언트 (client.js + 도메인별 모듈)
  ml/                 # on-device 보행 분석 (gaitPreprocess.js, useGaitPipeline.js)
  store/              # tokenStore, serverConfig, sessionStore, storage, fontScale
  location/track.js   # WARD 포그라운드 자동 위치 전송(30초, AppState 기반)
  notifications/push.js  # FCM 토큰 등록/해제 + 알림 탭 네비게이션
  screens/            # auth | elder | caregiver + 역할 공용(ServerConfig, SessionDetail)
  components/ tokens.js icons.jsx risk.js
docs/                 # SCREENS.md(화면 명세·디자인 브리프) · REDESIGN.md(재설계 판단 근거)
                      # LOCAL_TESTING.md, DEV_BUILD.md
scripts/nevo-dev.ps1  # 로컬 백엔드(Docker+Spring) 기동
```

**탭 구성** — WARD: 홈·기록·보호자·내정보(4탭) / GUARDIAN: 대시보드·알림·위치·내정보.
WARD의 「걷기」 탭은 없앴다 — 상시 측정이 목표라 측정 화면은 어쩌다 가는 곳이고, 홈 카드로만 진입한다.
`TabBar`는 `router.push`라 탭 대상 화면도 `AppHeader onBack`을 함께 쓴다. 탭 항목을 바꾸면 **각 화면의 `CARE_TABS`/`ELDER_TABS` 사본과 `active` 인덱스를 모두** 맞출 것(화면마다 복사돼 있음).
`TabBar`는 확정 디자인 이후 아이콘 없이 글자만 쓴다(`{ label, path }`) — 탭 배열에 `icon` 필드를 넣어도 무시된다.
역할 공용 화면(`SessionDetail`)은 `src/screens/` 최상위에 두고 라우트만 역할별로 둔다.
⚠️ `SessionDetail`은 **측정 직후(로컬 `sessionStore`)와 기록 열람(서버 리포트)을 겸한다** — `sessionId` 유무로 갈린다.
WARD `result`·`session-detail`, GUARDIAN `session-detail` 세 라우트가 모두 이 화면을 가리키므로,
**어르신 전용 요소(탭바 등)를 무조건 렌더하지 말 것**(보호자에게도 보인다).

## 디자인 시스템 (`src/tokens.js`)
- 폰트: `T.font / fontMedium / fontSemiBold / fontBold / fontExtraBold`. **`fontWeight` 금지 → 반드시 `fontFamily`**
- 타입스케일 `T.fs`(노인 친화: 본문 17px+, 캡션 14px+, **9~13px 본문 금지**), 터치 `T.tap`(56). 신규 화면은 인라인 숫자 대신 이걸 사용
- 색상: `T.blue/blueDark/blueSoft/blueWash`, `T.ok/caution/danger(+Soft)`, `T.ink/body/muted/line/bg`
- 위험도 색 기준은 **`src/risk.js`의 `riskTone(score, riskLevel)`로 일원화** (점수<50=danger, SUSPECTED 또는 50~69=caution, 그 외 ok). 화면별 하드코딩 금지
- 공통 컴포넌트: Card · Pill · Avatar · TabBar · AppHeader · SectionLabel · SparkLine · DailyTrend · TrustChart · IMUTrace · RangeBar
- 일별 점수 추세는 **`DailyTrend`(선)** 를 쓴다. 막대(`BarChart`)는 제거됨 — 점수는 합산되는 양이 아니라 0~100 척도 위의 위치이고,
  막대는 기록 없는 날과 0점을 구분하지 못한다. 근거는 [docs/REDESIGN.md](docs/REDESIGN.md) 「차트」 절
- 오늘/이번 측정 점수가 0~100 척도 어디쯤인지는 **`RangeBar`**(범위 띠+마커)로 보여준다(WARD 홈·측정결과)
- ⚠️ `Text`/`TextInput`은 **`src/components/` 래퍼로만** import(전역 글씨 배율 적용). react-native에서 직접 가져오지 말 것 — 예외는 `DemoMonitor`(아래 참고)
- CSS→RN: 그라디언트=expo-linear-gradient, 2열 그리드=`flexDirection:'row'`+`flex:1`(width% 금지), SVG=react-native-svg

## 커밋 컨벤션 (영문 커밋 금지)
`이모지 타입: 내용` — ✨Feat 🐛Fix 🎨Design ♻️Refactor 🔧Settings 📝Docs 🚀Deploy
예: `✨ Feat: 로그인 API 연동`

## on-device 보행 분석 (★ 핵심)
진입점: `ElderMeasure` → `src/ml/useGaitPipeline.js`(추론 훅) → `gaitPreprocess.js`(순수 전처리). 추론은 기기에서 수행, 서버는 결과 저장·리포트·FCM만 담당.

⚠️ **센서 실제 수신 속도 — Android 12+(API 31+) 필수 권한.** `expo-sensors`(`SensorSubscription.kt`)는 JS의 `setUpdateInterval()`을 네이티브 센서 등록 속도에 안 씀 — 그건 이벤트 도착 후 소프트웨어 다운샘플링에만 쓰이고, **네이티브 등록 자체는 `HIGH_SAMPLING_RATE_SENSORS` 권한이 없으면 무조건 `SENSOR_DELAY_NORMAL`(~5Hz)로 떨어진다**(API 31 미만은 항상 FASTEST라 문제없음). 실기기(갤럭시 S21, Android 12+)에서 자이로 5.6Hz·가속도 16.7Hz(다른 시스템 프로세스가 이미 더 빠르게 쓰고 있어서 묻어간 값)로 실측됨 — 요청 간격을 바꿔도 무관하게 고정. 50Hz 전제로 설계된 causal Butterworth 필터·윈도우 길이가 전부 어긋나서 2차 모델이 실기기에서 오판정(정상 보행을 이상으로)하는 원인이었음. **`app.json`의 `android.permissions`에 `HIGH_SAMPLING_RATE_SENSORS` 추가함**(2026-08-27) — 네이티브 권한이라 **새 EAS dev build 필요**(Metro reload로는 반영 안 됨), 빌드 후 실기기 재검증 필수.

**현재 구현 확정(2026-07-07, 실제 세션 번들 실측 기반):**
- **1차 = `isStationary` 휴리스틱 + huga+93 활동분류 모델(6-class, g단위, `gait_stage1_activity.tflite`).** 정지(sitting/standing)는 방향 무관 휴리스틱이 앞단에서 차단, 움직이면 huga+93가 walking 여부 판정 → walking일 때만 2차. 실측 세션 게이팅 14/14(walking 12/12). ⚠️ 초기 재학습본(raw int16 스케일러)은 폰에서 2/14로 실패 → g단위 huga+93로 교체(변환층 없이 원단위). running·계단 구분 능력은 pocket 데이터 없어 **미검증**.
- **2차 = 정완 TCN v2(`gait_model.tflite`+`gait_scaler.json`, ASVM/GSVM 2피처, LOSO 83.75%, 피험자별 언더샘플링).** 입력 (1,128,2), 출력은 시그모이드 P(이상) 단일값(softmax 아님). P(이상) EWMA 평활 + 워밍업 + 히스테리시스로 판정. abnormal 집단 구성은 이전 버전과 동일 계열(파킨슨/뇌졸중 계열 시뮬레이션 보행) 계승.
- **전처리 = 1차는 g·rad/s 원단위 10피처(원본 그대로), 2차는 ASVM/GSVM 2피처를 causal 4차 3Hz Butterworth로 거른 값 — 스케일러·윈도우 크기 모두 서로 다름.** 아래 '재학습 계약'대로 causal(단방향)만 허용 — filtfilt를 프론트에 "덧붙이면" 학습 분포와 어긋나 정확도 하락.

**정완 재학습 전처리 계약(프론트 실시간 미러링 가능 조건):**
- 필터는 **인과(causal) IIR Butterworth 3Hz 저역통과**만. `filtfilt`(양방향·미래샘플) 금지 — 실시간 스트림에선 재현 불가, train/inference 불일치로 정확도 붕괴. **학습도 동일한 인과 필터**로.
- 차수(order)·cutoff(3Hz)·fs(50Hz)를 scaler 옆에 명시 → 프론트가 같은 계수로 IIR 구현.
- GSVM=√(gx²+gy²+gz²) 등 피처 추가 시 `feature_names`/`mean`/`scale` 순서 그대로 전달(프론트는 feature_names 순서대로 빌드).
- 단위 g·rad/s 원단위 유지(expo-sensors 일치), 윈도우 100/50Hz 유지.

### 보고서 목표 아키텍처 (2단계 on-device, 50Hz)
- **1차 동작분류(TP1)**: walk / not-walk 판별(Activity Gating). 비보행 구간은 2차 추론 생략.
- **2차 보행 분류(TP2)**: **TCN(Temporal Convolutional Network)** 기반 정상 / 질환 의심(이상) 이진 분류. UCI HAR·Daphnet FoG 사전학습 → 자체 수집 데이터 파인튜닝.
- **전처리**: 주머니 속 방향 불일치(축 고정 문제)를 **ASVM=√(ax²+ay²+az²) · GSVM=√(gx²+gy²+gz²)** 방향 독립 특징으로 보완 + **Butterworth 3Hz 저역통과 필터**로 주머니 마찰·기기 잡음 제거.
- **특징 추출**: Peak Detection으로 발 착지·보행 주기 검출 → 이동거리·step interval·cadence·보행 가변성(variability)·**좌우 대칭성(symmetry)**.
- **출력**: 정상/이상, score, riskLevel(NORMAL/SUSPECTED), 좌우 비대칭→`symmetryScore` 변환, cadence/변동성. `dangerCount>0` → 보호자 FCM.

### 현재 구현 (코드 현실 — 위 목표와의 갭, 코드 작업 시 우선 확인)
- **1차**: `motionLevel`(acc std<0.025g, gyro avg<0.04rad/s → `{stationary, accStd, gyroAvg}`) 휴리스틱 게이트 → 움직이면 **huga+93 활동분류**(`gait_stage1_activity.tflite`, 6-class, g단위)로 walking 판정. `useGaitPipeline`: 정지→STATIONARY, 1차가 walking→2차 실행, sitting/standing(conf≥0.8)→STATIONARY, 그 외(running·계단)→OTHER(점수 없음). `analyze(window, filteredWindow)`는 시연 표시용으로 `{accStd, gyroAvg, ms1, ms2}`(게이트 실측치·단계별 추론 지연)도 함께 반환한다.
- **2차**: `gait_model.tflite` = 정완 TCN v2(ASVM/GSVM, LOSO 83.75%). 출력이 시그모이드 단일값이라 `softmaxArgmax` 대신 `out2[0]`을 그대로 P(이상)으로 읽는다. 판정 순서는 **온도 스케일링 → 중앙값 사전 필터 → EWMA → 히스테리시스**(모두 `useGaitPipeline.js`):
  - `calibrateProbability`(0.5 이하는 그대로, 초과만 T=4로 완화) — 모델이 "이상" 쪽 극단값(0.999)에 쉽게 붙어버리는 과확신 완화. **0.5 이하까지 같이 누그러뜨리면 정상 걸음 점수가 70점대로 깎임**(실기기로 확인, 2026-08-27) — 반드시 비대칭으로.
  - `PRE_FILTER_WINDOW`(=3) 최근 P(이상)의 중앙값 — 회전·정지 전환 등 한 윈도우짜리 이상치가 EWMA에 그대로 안 들어가게.
  - `EWMA_ALPHA`(=0.1)·`HYSTERESIS_MIN_RUN`(=6) — `ElderMeasure`의 `STRIDE`(분석 간격, 현재 32=0.64초)에 실제 초 단위 의미가 묶여있다. **STRIDE를 바꾸면 이 상수들도 비례해서 다시 스케일링할 것**(안 그러면 체감 반응속도가 의도치 않게 빨라짐/느려짐).
  - ⚠️ **회전 구간 판정 보류는 시도했다가 되돌림**(2026-08-27) — `createTurnDetector`(원래 대칭성 계산용, "실기기 미검증" 경고가 이미 있었음) 임계값을 그대로 2차 게이팅에 재사용했더니 정상 걷기의 골반 회전만으로 `turnFraction=1.0`이 나와 판정이 전부 막힘. **재도입하려면 먼저 그 임계값(ON=0.6/OFF=0.35 rad/s)부터 실기기로 재보정할 것.**
- **전처리**: 1차 피처는 `acc_x,y,z, gyro_x,y,z, acc_x_dyn,y_dyn,z_dyn, acc_norm`(불변). 2차는 `ASVM=√(ax²+ay²+az²)`·`GSVM=√(gx²+gy²+gz²)`를 **causal 4차 3Hz Butterworth**(`gaitPreprocess.js`의 `createGaitFilter`, biquad cascade — NEVO-DataCollector `svm-filter.js`와 동일 스펙이지만 filtfilt 대신 forward 1회)로 거른 값. ⚠️ 이 필터는 **세션당 하나만 만들어 매 샘플(50Hz)마다 push**해야 한다 — 윈도우마다 새로 만들면 워밍업 트랜지언트가 반복돼 학습 분포와 어긋난다. `ElderMeasure.jsx`의 `gaitFilterRef`+`stage2BufRef`가 raw 버퍼(`bufRef`)와 같은 박자로 필터링된 값을 쌓고 `analyze(win, win2)`로 함께 넘긴다. 윈도우 크기도 1차(`WINDOW_SIZE`=100)·2차(`STAGE2_WINDOW_SIZE`=128)가 다르다. scaler는 각각 `gait_stage1_scaler.json`/`gait_scaler.json`.
- **특징**: 윈도우 cadence(`estimateCadence`, 세션 평균용) + 스트리밍 걸음 기반 `recentCadence`(최근 10초 간격 → 화면 표시용, 안 튐) + `computeGaitMetrics`(회전 제외 직진 걸음의 변동성 CV·좌우대칭성) + 이동거리(걸음×보폭). 세션 종료 시 백엔드로 업로드되어 리포트·보호자 화면에 반영된다(아래 세션 분석 계약 참고).
- **지표 표기 통일**: 좌우 대칭·변동성은 앱 전체에서 라벨 `좌우 대칭`/`변동성`, 단위 `%`. `computeGaitMetrics`는 8보(직진) 미만이면 `null`을 반환하므로 짧은 측정은 `--`로 표시된다.

### 시연 모드 (`src/components/DemoMonitor.jsx`)
측정 화면 우상단 차트 버튼 → 화면 녹화 전용 고밀도 진단 패널. **어르신 화면이 아니므로 의도적으로 T.fs 타입스케일과 전역 글씨 배율을 따르지 않는다**(react-native `Text` 직접 사용). 스크롤 없이 한 화면 고정 — 점수 추이 카드가 `flex:1`로 남는 높이를 흡수한다.
- ⚠️ **`Modal` 쓰지 말 것 — 절대배치 오버레이다.** 안드로이드에서 `Modal`은 별도 윈도우라 `useSafeAreaInsets()`가 `bottom: 0`을 반환해 하단 내비게이션 바가 버튼을 덮는다(실기기 확인).
- 표시 원칙: **큰 숫자 하나 + 짧은 라벨.** 읽어도 이해 안 되는 설명 문구(예: "100샘플 × 10특징")는 말로 설명할 내용이지 화면에 넣지 않는다. 회색 마이크로 텍스트 금지 — 잘리거나 안 읽힌다.
- 구성: ①센서 ②1차 게이트 ③2차 판정 파이프라인 스트립(비활성 단계는 회색) · 점수+산출식 `(1−P)×100` · **P(이상) 막대(원값 ● / 평활 ▮ / 히스테리시스 전환대)** · 점수 추이(TrustChart) · 측정 완료
  - ⚠️ **보조 지표(대칭·규칙성)는 제거함** — 좌우대칭·변동성은 단일 센서로 뽑은 추정치라 시연 화면(심사자 대상)에서 근거처럼 보일 수 있는 숫자를 안 보여주는 쪽으로 결정. `computeGaitMetrics` 자체와 세션 업로드(`symmetry`/`variability` → 백엔드)는 그대로 유지 — 결과 화면(SessionDetail 등)의 "함께 관찰된 보행 특성" 표기는 영향 없음.
- 표시 상수는 `gaitPreprocess`(`STATIONARY_ACC_STD/GYRO_AVG`)·`useGaitPipeline`(`EWMA_ALPHA`, `SUSPECT_ON/OFF`)에서 import — 화면 하드코딩 금지
- ⚠️ **보조 지표(리듬·CV·대칭)는 점수의 입력이 아니다.** 점수는 2차 모델이 파형에서 직접 판정한 P(이상)에서 나온다. 화면 문구도 "함께 관찰된 보행 특성"으로 고정 — 근거처럼 표현하지 말 것.
- 시연 타이밍 제약: EWMA 시드가 0(=100점)이라 **걷기 시작 직후는 항상 80~90점대**, SUSPECTED 전환에 이상 보행 **~3.8초(`HYSTERESIS_MIN_RUN`=6윈도우) 이상** 필요. 저신뢰 경고를 피하려면 걷기 **~15초 이상**(`MIN_WALK_WINDOWS`=24, `STRIDE`=32 기준). `ElderMeasure`의 `ONSET_DROP`/`OFFSET_DROP`(각 4윈도우·~2.5초)은 세션 최종 집계에서 시작·정지 전환 구간을 빼는 것이라 **실시간 화면 숫자에는 적용 안 됨**(멈추는 순간 잠깐 떨어지는 건 정상).
- **모델 입력**: 1차 `(1,100,10)`, 2차 `(1,128,2)`=[ASVM,GSVM]. **fast-tflite v3**: `loadTensorflowModel(src, [])` — delegates(빈 배열=CPU) **필수 인자**. `runSync` 입출력은 ArrayBuffer → 입력 `.buffer`, 출력 `new Float32Array(out[0])`.
- **출력 매핑**: `score=(1-P이상)×100`, `riskLevel=P이상≥0.5?SUSPECTED:NORMAL`. 반환 형태는 세션 업로드 계약과 동일.
- **파일**: 1차 `gait_stage1_activity.tflite`+`gait_stage1_scaler.json`, 2차 `gait_model.tflite`+`gait_scaler.json` (`.tflite`는 `metro.config.js`에서 assetExts 등록). 모델 교체 시 `assets/models/` 파일만 교체, 전처리/단위가 바뀌면 `gaitPreprocess.js`(`buildStage1Input`/`buildStage2Input`) 수정.

## 백엔드 연동
- 코드 위치: 상위 폴더 `Backend` (Spring Boot, **develop 브랜치**). **🚫 Backend 절대 수정 금지** — 읽기/계약 확인용
- **Base URL**: `src/store/serverConfig.js`의 `DEFAULT_BACKEND_BASE`(기본값) 또는 앱 내 서버설정 화면. 코드에 하드코딩 금지, 소비처는 `serverConfig.getBackendBase()` 사용
- **인증**: `Authorization: Bearer {accessToken}` (`/api/auth/*` 8종만 토큰 불필요). `client.js`가 자동 주입 + 401→refresh 1회 재시도
- **응답 래퍼**: 모든 응답이 `{code,message,timestamp,data}` — `client.js`가 `data`만 언랩해 반환
- **역할 제한**: 토큰 WARD/GUARDIAN 위반 시 403
- **enum**: Role=WARD|GUARDIAN, Gender=MALE|FEMALE, riskLevel=NORMAL|SUSPECTED, ConsentType=TERMS|PRIVACY|SMS|MEDICAL, SmsVerificationPurpose=SIGNUP|PASSWORD_RESET
- 전화 `^01[016789]\d{7,8}$` / 비번 8자+ 영문+숫자+특수
- ⚠️ **WARD 가입**: height·weight·birthDate·gender **모두 필수**(AuthService 검증), 약관 TERMS·PRIVACY agreed 필수. 가입 실패 시 OTP 소비됨→재발급 필요.
- OTP는 실제 SMS 안 감 → 백엔드 콘솔 로그 `[SMS][DEV ONLY] ... code=NNNNNN`

### API 맵 (컨트롤러 기준)
- **인증 `/api/auth`**(토큰X): sms/send·sms/verify `{phone,(code,)purpose}` · sign-up · login · logout · refresh · password-reset/request·confirm. sign-up/login/refresh → `{accessToken,refreshToken,role}`
- **사용자 `/api/users`**: GET/PUT /me · POST/DELETE /device-token `{fcmToken}` · DELETE /me(탈퇴)
- **신체정보 `/api/wards`**(WARD): GET·PUT /me/physical-info `{height,weight,birthDate,gender}`
- **가족연결 `/api/ward-link`**: POST /code(WARD `{guardianPhone}`→코드) · POST /(GUARDIAN `{code}`) · DELETE /{wardId}(GUARDIAN) · GET /wards(GUARDIAN) · GET /guardians(WARD) · GET /{wardId}/alerts(GUARDIAN)
- **세션 `/api/gait/sessions`**(WARD): POST /start · GET /active(없으면 404) · POST /{id}/data `{data:[{minuteAt,avgScore,minScore,maxScore,dangerCount}]}` · POST /{id}/stop · POST /{id}/analysis `{riskLevel,avg/min/maxScore,dangerCount,reportSummary,variabilityScore,asymmetryScore}`(dangerCount>0→보호자 FCM)
  - ⚠️ **`asymmetryScore`는 0~1 원값**이고 백엔드가 `(1-x)*100`으로 `symmetryScore`(0~100)를 만든다. 프론트 `symmetry`(100=대칭)를 보낼 땐 `(100-symmetry)/100`으로 역변환할 것. `variabilityScore`는 CV(%) 무변환 통과. 둘 다 nullable
- **리포트 `/api/gait/reports`**: GET /{sessionId} · GET /daily(WARD,7일) · GET /ward/{wardId}/daily?days=7|30|90(GUARDIAN) · GET /dashboard(GUARDIAN)
- **위치 `/api/locations`**: POST /(WARD `{latitude,longitude}`) · GET /stream/{wardId}(GUARDIAN, SSE)
- 톤 매핑: 백엔드 riskLevel은 2단계(NORMAL/SUSPECTED) → UI 3단계는 `risk.js`에서 산출
- ⚠️ **백엔드에 없는 기능은 화면에도 두지 않는다**: 알림 설정·공유 설정·낙상 감지·지오펜스·PDF 리포트·119 연동은 API가 없다. 동작하지 않는 토글·버튼·수치를 "있는 것처럼" 그리지 말 것(과거에 이런 더미 화면들이 있었고 전부 제거함)

## 로컬 개발 / 빌드
- 백엔드 기동 + 실기기 테스트: [docs/LOCAL_TESTING.md](docs/LOCAL_TESTING.md)
- dev build(EAS 클라우드, on-device 측정 필수): [docs/DEV_BUILD.md](docs/DEV_BUILD.md)

## 열린 작업
완료 내역은 git 히스토리에 있다. 여기엔 **아직 안 된 것 + 그것이 코드 판단에 주는 제약**만 적는다.

- ★ **`CareLocation` 오늘 동선** — 프론트는 `getLocationHistory` + `NaverMapPathOverlay`까지 붙어 있고 **백엔드 대기 중**. `locations`가 `ward_id` 유니크 upsert라 이력이 없어 현재는 빈 동선. 필요 스펙: ① insert-only 이력 테이블(기존 upsert 테이블은 SSE용 유지) ② `GET /api/locations/{wardId}/history?date=YYYY-MM-DD`(GUARDIAN). **엔드포인트 생기면 즉시 동작하므로 프론트 코드를 지우지 말 것**
- ★ **네이티브 모듈 추가 후 EAS dev build 필요** — 네이버 지도·FCM은 기존 빌드로 동작 안 함
- ★ **실기기 이상 보행 연출 탐색** — 절뚝/종종걸음/무릎 고정 중 `pRaw`를 0.5 위로 올리는 것 확정
- ★ **running·계단 pocket 데이터로 1차 활동분류 실익 검증** — 전용 UI는 만들지 않음(시연 모드에 클래스명만)
- FCM **실발송**은 백엔드가 `nevo-a5a79` service account 키를 `FcmConfig`에 넣어야 동작(프론트 연동은 완료)
- ★ **백그라운드 상시 측정** — 위 '측정 방식' 참고. 현재 인프라가 전무하다(`expo-task-manager`·foreground service 없음, 센서 구독이 `ElderMeasure` 화면 생명주기에 묶여 있음). 필요: Android foreground service(지속 알림 필수) · 배터리 최적화 예외 요청 · 백그라운드에서 `react-native-fast-tflite` 추론 가능 여부 검증 · 배터리 소모 측정
- ★ **오프라인 큐 (SQLite 누적 → 복구 시 동기화)** — **백엔드는 이미 준비됨**: `POST /{id}/data`가 `ON CONFLICT (session_id, minute_at) DO NOTHING`으로 **중복 전송을 자동 무시**하고 `{saved, skipped}`를 돌려준다. 즉 **같은 데이터를 몇 번 보내도 안전**하므로 프론트는 성공 확인 없이 재전송해도 된다. 폰이 꺼져도 `GET /active`로 진행 중 세션을 이어받을 수 있다. ⚠️ **프론트는 큐가 전혀 없고 업로드 실패를 `.catch(() => {})`로 조용히 버린다**(`ElderMeasure` 4곳) — 지하철에서 측정하면 데이터가 영구 소실되는데 사용자는 저장된 줄 안다. 상시 측정이 붙으면 손실 규모가 커진다
- 3차 이상유형 분류 모델 · Google Play 출시

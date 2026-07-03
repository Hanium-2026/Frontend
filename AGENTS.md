# NEVO Frontend — AGENTS.md

> 에이전트(Claude/Codex)가 읽고 작업하는 단일 기준 문서. 작업하며 계속 갱신할 것.
> 최종 업데이트: 2026-06-29
>
> 📌 **기준 = 개발보고서**: 이 문서의 "목표" 항목은 한이음 개발보고서를 따른다. "현재 구현"과 갭이 있으면
>    보고서 쪽이 목표이고 코드를 거기에 맞춰 간다(문서를 코드 현실로 후퇴시키지 말 것).

## 핵심 방향 (2026-06)
- **앱**: NEVO — 스마트폰 IMU 기반 보행 분석으로 퇴행성 뇌질환(파킨슨·뇌졸중) 초기 보행 변화를 일상에서 조기 탐지
- **플랫폼**: **Android 전용** (iOS / 웹 / Vercel 폐기)
- **AI 추론**: **on-device 2단계 TFLite** — 1차 동작분류(walk/not-walk) → 2차 정상/이상(TCN). 추론은 기기에서 수행하고, 서버는 **저장·리포트·FCM 알림만** 담당(별도 AI 추론 서버 없음). (예정) 3차 이상유형
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
| 위치/실시간 | expo-location, react-native-sse |

## 프로젝트 구조
```
app/                  # Expo Router 라우트 ((auth)/(elder)/(caregiver))
assets/models/        # on-device TFLite 모델 + scaler
src/
  api/                # 백엔드 API 클라이언트 (client.js + 도메인별 모듈)
  ml/                 # on-device 보행 분석 (gaitPreprocess.js, useGaitPipeline.js)
  store/              # tokenStore, serverConfig, sessionStore, storage
  screens/            # auth | elder | caregiver
  components/ tokens.js icons.jsx risk.js
docs/                 # LOCAL_TESTING.md, DEV_BUILD.md
scripts/nevo-dev.ps1  # 로컬 백엔드(Docker+Spring) 기동
```

## 디자인 시스템 (`src/tokens.js`)
- 폰트: `T.font / fontMedium / fontSemiBold / fontBold / fontExtraBold`. **`fontWeight` 금지 → 반드시 `fontFamily`**
- 타입스케일 `T.fs`(노인 친화: 본문 17px+, 캡션 14px+, **9~13px 본문 금지**), 터치 `T.tap`(56). 신규 화면은 인라인 숫자 대신 이걸 사용
- 색상: `T.blue/blueDark/blueSoft/blueWash`, `T.ok/caution/danger(+Soft)`, `T.ink/body/muted/line/bg`
- 위험도 색 기준은 **`src/risk.js`의 `riskTone(score, riskLevel)`로 일원화** (점수<50=danger, SUSPECTED 또는 50~69=caution, 그 외 ok). 화면별 하드코딩 금지
- 공통 컴포넌트: Card · Pill · Avatar · TabBar · AppHeader · SectionLabel · SparkLine · BarChart · IMUTrace
- CSS→RN: 그라디언트=expo-linear-gradient, 2열 그리드=`flexDirection:'row'`+`flex:1`(width% 금지), SVG=react-native-svg

## 커밋 컨벤션 (영문 커밋 금지)
`이모지 타입: 내용` — ✨Feat 🐛Fix 🎨Design ♻️Refactor 🔧Settings 📝Docs 🚀Deploy
예: `✨ Feat: 로그인 API 연동`

## on-device 보행 분석 (★ 핵심)
진입점: `ElderMeasure` → `src/ml/useGaitPipeline.js`(추론 훅) → `gaitPreprocess.js`(순수 전처리). 추론은 기기에서 수행, 서버는 결과 저장·리포트·FCM만 담당.

**확정 결정(2026-06-29, 정완 폴더 모델 실측 후):**
- **1차 = 휴리스틱 게이트로 확정** — 별도 walk/not-walk 모델은 학습 안 함. `isStationary`로 정지/보행만 게이팅.
- **2차 v1 = base float `best_model-2.tflite`(83.91%) 그대로 출시** — 현재 배포본(`gait_model.tflite`+`gait_scaler.json`)과 동일. abnormal 집단 = 파킨슨(`PD_*`)+뇌졸중(`CVA_*`)이라 보고서 "퇴행성 뇌질환 탐지" 목표와 직결. (정완 폴더의 aug/finetune 양자화 변형은 gyro 분산↑로 주머니 회전에 더 강건할 수 있으나 정확도 미검증 → 보류)
- **전처리 = 정완 재학습 트랙(v2).** v1은 현재 raw 10피처(모델과 일치) 유지. 정완이 ASVM/GSVM+Butterworth로 2차를 재학습해 주면 프론트가 그 전처리를 그대로 미러링해 스왑. ⚠️ 프론트에 필터를 "덧붙이면" 학습 분포와 어긋나 정확도 하락 — 반드시 모델과 동일 전처리.

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
- **1차**: 휴리스틱 `isStationary`(acc std<0.025g, gyro avg<0.04rad/s) 게이트 = **확정된 1차**(walk/not-walk 모델 학습 안 함). 정지/보행만 게이팅 — 뛰기·계단 등 비보행은 미구분.
- **2차**: `gait_model.tflite` = base float `best_model-2.tflite`(normal/abnormal **83.91% = v1 출시 확정**). 단일 윈도우 신뢰 말고 세션 단위 집계 + P(이상) EWMA 평활 + 히스테리시스로 판정. (v2 = 정완 재학습본으로 스왑)
- **전처리**: 피처 `acc_x,y,z, gyro_x,y,z, acc_x_dyn,y_dyn,z_dyn, acc_norm` (`acc_dyn`=윈도우 평균 제거, `acc_norm`=중력 포함 크기 ≈ ASVM 부분 충족). ⚠️ **GSVM·Butterworth 필터 없음**(v1은 모델과 일치하므로 의도된 상태). 단위 g·rad/s 원단위 그대로. scaler는 `gait_scaler.json`. v2에서 위 '재학습 계약'대로 GSVM·필터 추가.
- **특징**: cadence만 가속도 피크로 추정. ⚠️ **이동거리·step interval·변동성·좌우 대칭성 산출 없음** (`CarePatientDetail`의 symmetry/variability는 백엔드 todayMetrics 값, `CareAnalysis` 레이더/히트맵은 **더미 데이터**).
- **모델 입력**: `(1,100,10)`. **fast-tflite v3**: `loadTensorflowModel(src, [])` — delegates(빈 배열=CPU) **필수 인자**. `runSync` 입출력은 ArrayBuffer → 입력 `.buffer`, 출력 `new Float32Array(out[0])`.
- **출력 매핑**: `score=(1-P이상)×100`, `riskLevel=P이상≥0.5?SUSPECTED:NORMAL`. 반환 형태는 세션 업로드 계약과 동일.
- **파일**: `assets/models/gait_model.tflite`+`gait_scaler.json`(`.tflite`는 `metro.config.js`에서 assetExts 등록). 모델 교체 시 `assets/models/` 파일만 교체, 전처리/단위가 바뀌면 `gaitPreprocess.js` 수정.

## 백엔드 연동
- 코드 위치: 상위 폴더 `Backend` (Spring Boot, **develop 브랜치**). **🚫 Backend 절대 수정 금지** — 읽기/계약 확인용
- **Base URL**: `src/store/serverConfig.js`의 `DEFAULT_BACKEND_BASE`(기본값) 또는 앱 내 서버설정 화면. 코드에 하드코딩 금지, 소비처는 `serverConfig.getBackendBase()` 사용
- **인증**: `Authorization: Bearer {accessToken}` (`/api/auth/*` 8종만 토큰 불필요). `client.js`가 자동 주입 + 401→refresh 1회 재시도
- **응답 래퍼**: 모든 응답이 `{code,message,timestamp,data}` — `client.js`가 `data`만 언랩해 반환
- **역할 제한**: 토큰 WARD/GUARDIAN 위반 시 403
- **enum**: Role=WARD|GUARDIAN, Gender=MALE|FEMALE, riskLevel=NORMAL|SUSPECTED, ConsentType=TERMS|PRIVACY|SMS|MEDICAL, SmsVerificationPurpose=SIGNUP|PASSWORD_RESET
- 전화 `^01[016789]\d{7,8}$` / 비번 8자+ 영문+숫자+특수
- ⚠️ **WARD 가입**: height·weight·birthDate·gender **모두 필수**(AuthService 검증), 약관 TERMS·PRIVACY agreed 필수. 가입 실패 시 OTP 소비됨→재발급 필요. (AuthProfile은 birthYear만 받아 `YYYY-01-01`로 전송 — 미해결)
- OTP는 실제 SMS 안 감 → 백엔드 콘솔 로그 `[SMS][DEV ONLY] ... code=NNNNNN`

### API 맵 (컨트롤러 기준)
- **인증 `/api/auth`**(토큰X): sms/send·sms/verify `{phone,(code,)purpose}` · sign-up · login · logout · refresh · password-reset/request·confirm. sign-up/login/refresh → `{accessToken,refreshToken,role}`
- **사용자 `/api/users`**: GET/PUT /me · POST/DELETE /device-token `{fcmToken}` · DELETE /me(탈퇴)
- **신체정보 `/api/wards`**(WARD): GET·PUT /me/physical-info `{height,weight,birthDate,gender}`
- **가족연결 `/api/ward-link`**: POST /code(WARD `{guardianPhone}`→코드) · POST /(GUARDIAN `{code}`) · DELETE /{wardId}(GUARDIAN) · GET /wards(GUARDIAN) · GET /guardians(WARD) · GET /{wardId}/alerts(GUARDIAN)
- **세션 `/api/gait/sessions`**(WARD): POST /start · GET /active(없으면 404) · POST /{id}/data `{data:[{minuteAt,avgScore,minScore,maxScore,dangerCount}]}` · POST /{id}/stop · POST /{id}/analysis `{riskLevel,avg/min/maxScore,dangerCount,...}`(dangerCount>0→보호자 FCM)
- **리포트 `/api/gait/reports`**: GET /{sessionId} · GET /daily(WARD,7일) · GET /ward/{wardId}/daily?days=7|30|90(GUARDIAN) · GET /dashboard(GUARDIAN)
- **위치 `/api/locations`**: POST /(WARD `{latitude,longitude}`) · GET /stream/{wardId}(GUARDIAN, SSE)
- 톤 매핑: 백엔드 riskLevel은 2단계(NORMAL/SUSPECTED) → UI 3단계는 `risk.js`에서 산출. CareAnalysis/CareReport/ElderSOS는 전용 API 없음(리포트 재가공)

## 로컬 개발 / 빌드
- 백엔드 기동 + 실기기 테스트: [docs/LOCAL_TESTING.md](docs/LOCAL_TESTING.md)
- dev build(EAS 클라우드, on-device 측정 필수): [docs/DEV_BUILD.md](docs/DEV_BUILD.md)

## 현재 상태 / 남은 일
완료된 토대 위에서 **보고서 목표와의 갭(★)을 메우는 게 다음 코드 작업**이다.

- [x] 인증·세션·리포트·가족연동·프로필·위치 백엔드 연동 (라이브 검증)
- [x] on-device 추론 파이프라인 골격 (휴리스틱 게이트 + base float normal/abnormal 모델, JS 번들 검증)
- [x] 1차 = **휴리스틱 게이트로 확정**(2026-06-29, walk/not-walk 모델 보류)
- [x] 2차 v1 = **base float 83.91% 출시 확정**(현재 배포본 그대로)
- [ ] ★ **(정완) 2차 ASVM/GSVM+Butterworth 재학습** → 도착 시 프론트 전처리 미러링+스왑(v2). 재학습 계약은 on-device 섹션 참고
- [ ] ★ **Peak Detection 보행 지표 산출**(이동거리·step interval·변동성·좌우 대칭성) — 더미/백엔드 의존 화면 실데이터화 (프론트 단독 진행 가능, 모델과 무관)
- [ ] **EAS dev build → 실기기 on-device 측정 검증**
- [ ] 3차 이상유형 분류 모델
- [ ] FCM 푸시 (dev build + google-services.json 필요. `updateDeviceToken()`은 준비됨)
- [ ] SQLite 오프라인 저장 → 동기화
- [ ] Google Play 출시

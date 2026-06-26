# NEVO Frontend — AGENTS.md

> 에이전트(Claude/Codex)가 읽고 작업하는 단일 기준 문서. 작업하며 계속 갱신할 것.
> 최종 업데이트: 2026-06-26

## 핵심 방향 (2026-06)
- **앱**: NEVO — IMU 기반 보행 분석 (노인 보행 패턴 → 뇌 건강·낙상 위험 모니터링)
- **플랫폼**: **Android 전용** (iOS / 웹 / Vercel 폐기)
- **AI 추론**: **on-device TFLite** (별도 AI 서버 폐기). 1차 동작분류 → 2차 정상/이상 → (예정) 3차 이상유형
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
2단계 파이프라인. 진입점: `ElderMeasure` → `src/ml/useGaitPipeline.js`(추론 훅) → `gaitPreprocess.js`(순수 전처리).
- **1차 (동작분류, 게이트)**: HuGaDB 모델. 6클래스(downstairs/running/sitting/standing/upstairs/walking). `walking`일 때만 2차 실행. 정지/비보행은 점수 없음
- **2차 (정상/이상 보행)**: `normal`/`abnormal` 이진. 정확도 83.9% → 단일 윈도우 신뢰 말고 **세션 단위 집계**로 판정
- **모델 입력**: `(1,100,10)`, 50Hz·2초. 피처 순서 `acc_x,y,z, gyro_x,y,z, acc_x_dyn,y_dyn,z_dyn, acc_norm` (`acc_dyn`=윈도우 평균 제거, `acc_norm`=중력 포함 크기)
- ⚠️ **단위 차이 (중요)**: 1차는 HuGaDB int16 스케일(`acc×16384`, `gyro×938.734`, int16 clip) / 2차는 **g·rad/s 원단위 그대로**(변환 없음, expo-sensors와 일치). scaler는 각 모델별
- **파일**: `assets/models/gait_stage1_activity.tflite`+`gait_stage1_scaler.json`, `gait_stage2_gait.tflite`+`gait_stage2_scaler.json`. `.tflite`는 `metro.config.js`에서 assetExts 등록
- **출력 매핑**: `score=(1-P이상)×100`, `riskLevel=P이상≥0.5?SUSPECTED:NORMAL`. cadence는 가속도 피크로 추정. 반환 형태는 기존 세션 업로드 계약과 동일
- 모델 교체 시 `assets/models/` 파일만 바꾸면 됨(전처리/단위가 바뀌면 `gaitPreprocess.js` 수정)

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
- [x] 인증·세션·리포트·가족연동·프로필·위치 백엔드 연동 (라이브 검증)
- [x] on-device 2단계 추론 파이프라인 (JS 번들 검증 완료, 실기기 추론은 dev build 후 확인)
- [ ] **EAS dev build → 실기기 on-device 측정 검증**
- [ ] 3차 이상유형 분류 모델
- [ ] FCM 푸시 (dev build + google-services.json 필요. `updateDeviceToken()`은 준비됨)
- [ ] SQLite 오프라인 저장 → 동기화
- [ ] Google Play 출시

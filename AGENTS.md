# NEVO Frontend — AGENTS.md

> 에이전트(Claude/Codex)가 읽고 작업하는 단일 기준 문서. 작업하며 계속 갱신할 것.
> 최종 업데이트: 2026-08-13
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
| 위치/실시간 | expo-location, react-native-sse, @mj-studio/react-native-naver-map |

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

**현재 구현 확정(2026-07-07, 실제 세션 번들 실측 기반):**
- **1차 = `isStationary` 휴리스틱 + huga+93 활동분류 모델(6-class, g단위, `gait_stage1_activity.tflite`).** 정지(sitting/standing)는 방향 무관 휴리스틱이 앞단에서 차단, 움직이면 huga+93가 walking 여부 판정 → walking일 때만 2차. 실측 세션 게이팅 14/14(walking 12/12). ⚠️ 초기 재학습본(raw int16 스케일러)은 폰에서 2/14로 실패 → g단위 huga+93로 교체(변환층 없이 원단위). running·계단 구분 능력은 pocket 데이터 없어 **미검증**.
- **2차 = `best_model_quantized-4.tflite`(양자화 normal/abnormal, LOSO 84.31%)** = 현재 배포본(`gait_model.tflite`+`gait_scaler.json`). P(이상) EWMA 평활 + 워밍업 + 히스테리시스로 판정. abnormal 집단 = 파킨슨(`PD_*`)+뇌졸중(`CVA_*`)이라 보고서 "퇴행성 뇌질환 탐지" 목표 직결.
- **전처리 = 1차·2차 모두 g·rad/s 원단위, 10피처 동일, 스케일러만 다름(변환 없음).** 정완 ASVM/GSVM+Butterworth 재학습은 향후 **2차 v2** 목표(아래 계약). ⚠️ 프론트에 필터를 "덧붙이면" 학습 분포와 어긋나 정확도 하락 — 반드시 모델과 동일 전처리.

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
- **1차**: `motionLevel`(acc std<0.025g, gyro avg<0.04rad/s → `{stationary, accStd, gyroAvg}`) 휴리스틱 게이트 → 움직이면 **huga+93 활동분류**(`gait_stage1_activity.tflite`, 6-class, g단위)로 walking 판정. `useGaitPipeline`: 정지→STATIONARY, 1차가 walking→2차 실행, sitting/standing(conf≥0.8)→STATIONARY, 그 외(running·계단)→OTHER(점수 없음). `analyze`는 시연 표시용으로 `{accStd, gyroAvg, ms1, ms2}`(게이트 실측치·단계별 추론 지연)도 함께 반환한다.
- **2차**: `gait_model.tflite` = **`best_model_quantized-4`(양자화 normal/abnormal, LOSO 84.31%)**. 단일 윈도우 신뢰 말고 세션 단위 집계 + P(이상) EWMA 평활 + 워밍업 + 히스테리시스로 판정.
- **전처리**: 피처 `acc_x,y,z, gyro_x,y,z, acc_x_dyn,y_dyn,z_dyn, acc_norm` (`acc_dyn`=윈도우 평균 제거, `acc_norm`=중력 포함 크기 ≈ ASVM 부분 충족). ⚠️ **GSVM·Butterworth 필터 없음**(v1은 모델과 일치하므로 의도된 상태). 단위 g·rad/s 원단위 그대로. scaler는 `gait_scaler.json`. v2에서 위 '재학습 계약'대로 GSVM·필터 추가.
- **특징**: 윈도우 cadence(`estimateCadence`, 세션 평균용) + 스트리밍 걸음 기반 `recentCadence`(최근 10초 간격 → 화면 표시용, 안 튐) + `computeGaitMetrics`(회전 제외 직진 걸음의 변동성 CV·좌우대칭성) + 이동거리(걸음×보폭). ⚠️ `CarePatientDetail`의 symmetry/variability는 여전히 백엔드 todayMetrics 값, `CareAnalysis` 레이더/히트맵은 **더미 데이터**.

### 시연 모드 (`src/components/DemoMonitor.jsx`)
측정 화면 우상단 차트 버튼 → 화면 녹화 전용 고밀도 진단 패널. **어르신 화면이 아니므로 의도적으로 T.fs 타입스케일과 전역 글씨 배율을 따르지 않는다**(react-native `Text` 직접 사용). 스크롤 없이 한 화면 고정 — 점수 추이 카드가 `flex:1`로 남는 높이를 흡수한다.
- ⚠️ **`Modal` 쓰지 말 것 — 절대배치 오버레이다.** 안드로이드에서 `Modal`은 별도 윈도우라 `useSafeAreaInsets()`가 `bottom: 0`을 반환해 하단 내비게이션 바가 버튼을 덮는다(실기기 확인).
- 표시 원칙: **큰 숫자 하나 + 짧은 라벨.** 읽어도 이해 안 되는 설명 문구(예: "100샘플 × 10특징")는 말로 설명할 내용이지 화면에 넣지 않는다. 회색 마이크로 텍스트 금지 — 잘리거나 안 읽힌다.
- 구성: ①센서 ②1차 게이트 ③2차 판정 파이프라인 스트립(비활성 단계는 회색) · 점수+산출식 `(1−P)×100` · **P(이상) 막대(원값 ● / 평활 ▮ / 히스테리시스 전환대)** · 점수 추이(TrustChart) · IMU 3축 + 정지 게이트 실측치 · 보조 지표 5종 · 측정 완료
- 표시 상수는 `gaitPreprocess`(`STATIONARY_ACC_STD/GYRO_AVG`)·`useGaitPipeline`(`EWMA_ALPHA`, `SUSPECT_ON/OFF`)에서 import — 화면 하드코딩 금지
- ⚠️ **보조 지표(리듬·CV·대칭)는 점수의 입력이 아니다.** 점수는 2차 모델이 파형에서 직접 판정한 P(이상)에서 나온다. 화면 문구도 "함께 관찰된 보행 특성"으로 고정 — 근거처럼 표현하지 말 것.
- 시연 타이밍 제약: EWMA 시드가 0(=100점)이라 **걷기 시작 직후는 항상 80점대**, SUSPECTED 전환에 이상 보행 **6~7초(5윈도우) 이상** 필요. 저신뢰 경고를 피하려면 걷기 **20초 이상**(`MIN_WALK_WINDOWS`=12).
- **모델 입력**: `(1,100,10)`. **fast-tflite v3**: `loadTensorflowModel(src, [])` — delegates(빈 배열=CPU) **필수 인자**. `runSync` 입출력은 ArrayBuffer → 입력 `.buffer`, 출력 `new Float32Array(out[0])`.
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
- [x] on-device 2단계 파이프라인 (isStationary 휴리스틱 + huga+93 1차 게이트 → 양자화 2차, JS 번들 검증)
- [x] 1차 = **isStationary 휴리스틱 + huga+93 활동분류 게이트**(2026-07-07, 실측 게이팅 14/14, running·계단 미검증)
- [x] 2차 = **best_model_quantized-4(양자화 84.31%)로 교체**
- [ ] ★ **(정완) 2차 ASVM/GSVM+Butterworth 재학습** → 도착 시 프론트 전처리 미러링+스왑(v2). 재학습 계약은 on-device 섹션 참고
- [x] **Peak Detection 보행 지표 산출**(이동거리·변동성·좌우 대칭성) — 측정 화면은 실데이터. 남은 건 `CareAnalysis` 더미 화면 연결
- [x] **시연 모드 패널**(`DemoMonitor`) — 파이프라인 스트립·점수 산출식·P(이상) 히스테리시스·게이트 실측치·추론 지연(ms)
- [x] EAS dev build 성공 → 실기기 구동 확인
- [ ] ★ **`CareLocation` 실제 지도 연동**(2026-08-13) — 기존 SVG 목업 지도를 `@mj-studio/react-native-naver-map`(NaverMapView+Marker)로 교체, SSE 수신 좌표로 카메라 애니메이션. `app.json`의 `client_id` 발급·반영 완료(NCP Application "NEVO", Dynamic Map 월 600만 건 무료). 남은 건 새 EAS dev build(네이티브 모듈 추가라 기존 빌드로는 동작 안 함)
- [x] **WARD 자동 위치 전송**(2026-08-13, `src/location/track.js`) — 기존엔 `ElderSOS` SOS 버튼 길게 누를 때만 위치 전송돼서 평소엔 보호자 위치 화면이 "위치 대기"만 뜸. 앱 포그라운드 동안 30초 간격 자동 업로드로 확장(백그라운드 전환 시 정지, 복귀 시 재개 — `AppState` 기반). 로그인/앱 시작 시 WARD 역할이면 자동 시작, 로그아웃 시 정지. SOS 버튼 즉시 전송은 그대로 유지
- [ ] ★ **`CareLocation` 오늘 동선(연두색 폴리라인) — 프론트 준비 완료, 백엔드 대기**(2026-08-13) — `NaverMapPathOverlay`로 렌더링까지 다 붙여놨는데, 백엔드 `locations` 테이블이 `ward_id` 유니크 upsert라 이력이 없어서 현재는 빈 동선. 백엔드팀에 스펙 전달함: ① insert-only `location_history` 테이블 추가(기존 upsert 테이블은 SSE용으로 그대로 둠) ② `GET /api/locations/{wardId}/history?date=YYYY-MM-DD`(GUARDIAN) 신설. 프론트는 `api/location.js`의 `getLocationHistory`로 이미 호출 중 — 엔드포인트 생기는 순간 바로 동작
- [ ] ★ **실기기에서 이상 보행 연출 탐색** — 절뚝/종종걸음/무릎 고정 중 어느 것이 `pRaw`를 0.5 위로 올리는지 시연 전 확정
- [ ] 3차 이상유형 분류 모델
- [x] FCM 푸시 **프론트 연동 완료**(`expo-notifications` + `google-services.json`, 네이티브 FCM 토큰 등록/해제 + 알림 탭 네비게이션). ⚠️ 실발송은 백엔드가 `nevo-a5a79` service account 키를 `FcmConfig`에 넣어야 + EAS dev build 필요
- [ ] ★ **running·계단 pocket 데이터로 1차 활동분류 실익 검증** (시연은 정지/평지걸음만 다루므로 전용 UI는 만들지 않음 — 시연 모드에 클래스명만 표시)
- [ ] SQLite 오프라인 저장 → 동기화
- [ ] Google Play 출시

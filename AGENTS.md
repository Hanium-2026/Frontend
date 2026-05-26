# NEVO Frontend — AGENTS.md

> 이 문서는 에이전트(CODEX / Claude)가 읽고 작업하는 **단일 기준 문서**입니다.
> 작업 상황·결정사항·연동 진행도를 여기에 계속 기록합니다.
> 최종 업데이트: 2026-05-26

---

## ⚠️ Expo 버전 주의 (필수)

코드 작성 전 **반드시** 정확한 버전 문서를 확인할 것: https://docs.expo.dev/versions/v54.0.0/
Expo는 버전마다 API가 자주 바뀜. 추측으로 작성 금지.

---

## 프로젝트 개요

- **앱**: NEVO — IMU 기반 보행 분석 앱 (노인 보행 패턴 → 뇌 건강·낙상 위험 모니터링)
- **목표**: iOS App Store + Google Play 출시 / 중간 목표 Vercel 웹 데모
- **역할 구분**: WARD(노인) / GUARDIAN(보호자) — 백엔드 JWT 역할과 1:1 대응

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Expo SDK 54 (React Native 0.81.5, React 19.1.0) |
| 언어 | JavaScript (JSX) — **TypeScript 아님** |
| 라우팅 | Expo Router (파일 기반) |
| 차트/SVG | react-native-svg |
| 그라디언트 | expo-linear-gradient |
| 폰트 | Pretendard (expo-font 로드) |
| 센서 | expo-sensors (가속도·자이로) |
| 웹 빌드 | `npx expo export -p web` → dist/ |
| 배포 | Vercel (vercel.json 완료) |

## 프로젝트 구조

```
app/                    # Expo Router 라우트
  (auth)/  (elder)/  (caregiver)/
src/
  api.js                # API 클라이언트 (현재 AI 추론 서버만)
  tokens.js             # 디자인 토큰
  icons.jsx             # SVG 아이콘
  components/           # 공통 컴포넌트
  screens/auth|elder|caregiver/
  store/                # authStore, sessionStore (현재 메모리 객체)
assets/fonts/           # Pretendard OTF 5종
```

## 구현 완료 화면 (24개)

- **인증(9)**: AuthChoice, AuthRolePick, AuthPhone, AuthOTP, AuthProfile, AuthPermissions, AuthConnect, CareInvite, AuthWelcome
- **노인(8)**: ElderOnboarding, ElderHome, ElderMeasure, ElderResult, ElderHistory, ElderCaregiver, ElderSOS, ElderProfile
- **보호자(7)**: CareDashboard, CarePatientDetail, CareAlerts, CareAnalysis, CareReport, CareLocation, CareNotifSettings

---

## 디자인 시스템

### 폰트 (Pretendard) — `src/tokens.js`
```
T.font / T.fontMedium / T.fontSemiBold / T.fontBold / T.fontExtraBold
```
- **`fontWeight` 사용 금지** — 반드시 `fontFamily`로 지정

### 색상 토큰
```
T.blue / T.blueDark / T.blueSoft / T.blueWash
T.ok / T.okSoft   T.caution / T.cautionSoft   T.danger / T.dangerSoft
T.ink / T.muted / T.line / T.bg
```

### 공통 컴포넌트
Card · Pill · Avatar · TabBar · AppHeader · SectionLabel · ElderTopBlock · SparkLine · BarChart · IMUTrace

### CSS → React Native 규칙
- `fontWeight` → `fontFamily` (Pretendard)
- 그라디언트 → `expo-linear-gradient`
- 2열 그리드 → `flexDirection:'row'` + `flex:1` (width % 금지)
- SVG → `react-native-svg`

---

## 커밋 컨벤션 (반드시 준수)

형식: `이모지 타입: 작업 내용` — **영문 커밋 금지**

| 이모지 | 타입 | 언제 |
|--------|------|------|
| ✨ | Feat | 새 기능 |
| 🐛 | Fix | 버그 수정 |
| 🎨 | Design | UI 변경 |
| ♻️ | Refactor | 리팩토링 |
| 🔧 | Settings | 설정 변경 |
| 📝 | Docs | 문서 수정 |
| 🚀 | Deploy | 배포 |

예: `✨ Feat: 로그인 API 연동`

---

## 백엔드 연동 (★ 핵심)

### 백엔드 위치 / 규칙
- 코드: 바탕화면 `Backend` 폴더 (Hanium-2026/Backend, **develop 브랜치**, Spring Boot)
- **🚫 Backend 폴더는 절대 수정 금지** — 읽기/분석/API 계약 확인 용도로만. 모든 코드 변경은 이 Frontend에서만.
- 서버 실행 전제: PostgreSQL + Redis(OTP) + Firebase(FCM, 선택). Swagger: 서버 기동 후 `http://localhost:8080/swagger-ui/index.html`

### 로컬 개발 환경 기동 (검증 완료 2026-05-26)
Backend 파일을 수정하지 않고 컨테이너를 직접 띄우는 방식. (compose는 5432 고정인데 그 포트가 다른 프로젝트와 충돌 → Postgres를 5433으로 별도 기동)
```powershell
# 1) Postgres (5433 — 5432 충돌 회피, DB/USER/PW는 application.yml 기본값과 일치)
docker run -d --name nevo-db -p 5433:5432 `
  -e POSTGRES_DB=nevo -e POSTGRES_USER=nevo -e POSTGRES_PASSWORD=nevo_backend postgres:15
# 2) Redis (OTP 저장용 — Backend compose엔 없음)
docker run -d --name nevo-redis -p 6379:6379 redis:7
# 3) 백엔드 (DB_PORT만 5433으로 오버라이드, 나머지 env는 기본값 사용)
cd <Backend>; $env:DB_PORT="5433"; .\gradlew.bat bootRun
```
- Firebase 키 없어도 부팅됨 (FCM만 비활성, 경고 로그만). 실제 SMS 발송 안 함 — **OTP 코드는 백엔드 콘솔 로그**에 `[SMS][DEV ONLY] ... code=NNNNNN` 형태로 찍힘.
- 회원가입/로그인/세션/리포트 전부 실테스트 가능. 재시작 시 위 3단계 반복(컨테이너는 `docker start nevo-db nevo-redis`로 재기동).
- **물리 폰에서 테스트 시**: `src/api/client.js`의 `BACKEND_BASE`를 `localhost` → 노트북 IP로 교체 (AI 추론 서버와 동일).

### 공통 규칙
- **Base URL**: `http://localhost:8080` (운영 도메인 교체 필요)
- **인증 헤더**: `Authorization: Bearer {accessToken}` — 아래 Auth 8종만 토큰 불필요
- **응답 래퍼**: 모든 응답이 `{ code, message, timestamp, data }` — 실제 값은 `data` 안
- **역할**: 토큰의 WARD/GUARDIAN에 따라 호출 가능 API 제한 (위반 시 403)
- enum: `Role`=WARD|GUARDIAN, `Gender`=MALE|FEMALE, `riskLevel`=NORMAL|SUSPECTED,
  `ConsentType`=TERMS|PRIVACY|SMS|MEDICAL, `SmsVerificationPurpose`=SIGNUP|PASSWORD_RESET
- 전화번호: `^01[016789]\d{7,8}$` / 비번: 8자+ 영문+숫자+특수문자

### API 전체 맵 (실제 컨트롤러 기준 — 확인 완료)

**1) 인증 `/api/auth` (토큰 불필요)**
| Method | Path | Body → Response |
|--------|------|------|
| POST | /sms/send | `{phone, purpose}` |
| POST | /sms/verify | `{phone, code, purpose}` |
| POST | /sign-up | `{phone, password, name, role, deviceId, height?, weight?, birthDate?, gender?, consents:[{consentType, agreed}]}` → `{accessToken, refreshToken, role}` (201) |
| POST | /login | `{phone, password, deviceId}` → `{accessToken, refreshToken, role}` |
| POST | /logout | `{refreshToken}` |
| POST | /refresh | `{refreshToken}` → `{accessToken, refreshToken, role}` |
| POST | /password-reset/request | `{phone}` |
| POST | /password-reset/confirm | `{phone, newPassword}` |

**2) 사용자 `/api/users` (토큰)**
| GET /me → `{id, phone, name, role}` · PUT /me `{name}` · POST /device-token `{fcmToken}` · DELETE /device-token · DELETE /me(탈퇴) |

**3) 노약자 신체정보 `/api/wards` (WARD)**
| GET·PUT /me/physical-info → `{id, height, weight, birthDate, gender}` |

**4) 가족 연결 `/api/ward-link`**
| Method | Path | 역할 | 비고 |
|--------|------|------|------|
| POST | /code | WARD | `{guardianPhone}` → `{code, expiresAt}` (201) |
| POST | / | GUARDIAN | `{code}` 연결 (201) |
| DELETE | /{wardId} | GUARDIAN | 연결 해제 |
| GET | /wards | GUARDIAN | `[{wardId, name, linkedAt}]` |
| GET | /guardians | WARD | `[{guardianUserId, name, linkedAt}]` |
| GET | /{wardId}/alerts | GUARDIAN | `[{alertId, type, sessionId, message, createdAt}]` |

**5) 보행 세션 `/api/gait/sessions` (WARD)** — 점수는 앱이 계산해 업로드
| Method | Path | 비고 |
|--------|------|------|
| POST | /start | → `{sessionId, startedAt}` (201). 이미 ACTIVE면 SESSION409 |
| GET | /active | 진행중 세션 복원. 없으면 SESSION404 |
| POST | /{id}/data | `{data:[{minuteAt, avgScore, minScore, maxScore, dangerCount}]}` → `{saved, skipped}`. 중복/시각오류 자동 skip |
| POST | /{id}/stop | 멱등 |
| POST | /{id}/analysis | `{riskLevel, avgScore, minScore, maxScore, dangerCount, reportSummary?, variabilityScore?, asymmetryScore?}`. dangerCount>0 → 보호자 FCM 자동 발송 |

**6) 리포트 `/api/gait/reports`**
| Method | Path | 역할 | 응답 |
|--------|------|------|------|
| GET | /{sessionId} | 공통 | SessionDetail (avg/min/max, variability, symmetry, riskLevel, reportSummary) |
| GET | /daily | WARD | `{dailyScores[], sessions[]}` (최근 7일) |
| GET | /ward/{wardId}/daily?days=7\|30\|90 | GUARDIAN | `{dailyScores[], todayMetrics}` |
| GET | /dashboard | GUARDIAN | `{wards:[{wardId, name, latestScore, riskLevel, lastSessionAt, trend[7]}]}` |

**7) 위치 `/api/locations`**
| POST / `{latitude, longitude}` (WARD) · GET /stream/{wardId} SSE (GUARDIAN) |

### 화면 ↔ API 매핑
| 화면 | API |
|------|-----|
| 인증 플로우 전체 | `/api/auth/*` |
| ElderProfile | GET/PUT /api/users/me, /api/wards/me/physical-info |
| ElderCaregiver | POST /ward-link/code, GET /ward-link/guardians |
| CareInvite | POST /ward-link |
| ElderMeasure → Result | /api/gait/sessions/* + AI 추론 서버 |
| ElderHistory | GET /api/gait/reports/daily |
| CareDashboard | GET /ward-link/wards, GET /reports/dashboard |
| CarePatientDetail | GET /reports/ward/{wardId}/daily |
| CareAlerts | GET /ward-link/{wardId}/alerts |
| CareLocation | GET /api/locations/stream/{wardId} (SSE) |
| **CareAnalysis / CareReport** | 전용 API 없음 — 리포트 데이터 재가공 |
| **ElderSOS** | 전용 API 없음 — 위치/알림 조합 검토 필요 |

---

## AI 추론 서버 연동 (세션 API와 별개)

- `src/api.js` → `POST http://<노트북IP>:8000/score` (nevo-ai FastAPI)
- 입력: 가속도+자이로 128샘플(2.56초) 윈도우 → 출력: `{activityState, score, riskLevel, cadence}`
- ElderMeasure에서 ~1.3초마다 호출, 정지 시 세션 요약 → ElderResult
- **구조**: 추론 서버가 실시간 점수 생성 → 그 결과를 위 **세션 API**(8080)로 업로드
- 모델 한계: MobiAct(Galaxy S3) 학습 → 도메인 갭. 절대값보다 상대 변화로 해석.
- 현재 `API_BASE = http://172.30.1.24:8000` (노트북 IP 바뀌면 수정). 폰·노트북 같은 WiFi 필요.

---

## 주요 결정사항

| 날짜 | 내용 |
|------|------|
| 2026-05-21 | 보폭 → 이동 거리로 전체 교체 (6개 파일) |
| 2026-05-21 | 측정 화면을 nevo-ai 추론 서버(`:8000/score`)에 초안 연동 |
| 2026-05-26 | Backend develop 클론 후 실제 API 전수 분석 완료. Backend 코드 수정 금지 원칙 확정 |

---

## 작업 진행도 (연동)

- [x] AI 추론 서버 연동 (초안)
- [x] **프론트 API 레이어 토대** (2026-05-26) — `src/store/storage.js`(secure-store+웹 폴백 기본단위), `src/store/tokenStore.js`(access/refresh/role 메모리캐시+영속), `src/api/client.js`(`BACKEND_BASE`, Bearer 자동주입, 401→refresh 1회 재시도, `{data}` 언랩, `ApiError`).
- [x] **인증 플로우 ↔ `/api/auth` 연동** (2026-05-26) — `src/api/auth.js`(sendSms/verifySms/signUp/login/logout/passwordReset + `getDeviceId` 영속). 라이브 백엔드로 signup→login→users/me→physical-info 전수 검증 완료. 웹 번들 컴파일 OK.
  - 신규 화면: `AuthPassword`(가입 비번 설정 → `signUp()` 호출), `AuthLogin`(전화+비번 로그인). 라우트 `app/(auth)/password.jsx`, `login.jsx`.
  - 가입 플로우: role→phone(sendSms)→otp(verifySms)→profile→password(signUp)→permissions→connect. StepBar 6단계로 변경.
  - 앱 시작: `_layout`에서 `tokenStore.load()`, `app/index.jsx`가 로그인+role로 라우팅(WARD→elder, GUARDIAN→caregiver).
  - **⚠️ 백엔드 검증 주의(코드 분석으로 확인)**: WARD 회원가입은 height·weight·birthDate·gender **모두 필수**(DTO엔 @NotNull 없지만 `AuthService`가 검증). 약관은 TERMS·PRIVACY agreed=true 필수. signup 실패 시 OTP 인증상태 소비됨 → 재시도 시 OTP 재발급 필요.
  - 미해결: AuthProfile은 birthYear만 수집 → birthDate를 `YYYY-01-01`로 보냄(월/일 임시). 연동 데모용 OTP는 백엔드 콘솔 로그 확인.
- [x] **측정 세션 ↔ `/api/gait/sessions` 연동** (2026-05-26) — `src/api/session.js`(start/active/ensureSession/data/stop/analysis + `toMinuteAt` 로컬 분 키). `ElderMeasure`: 진입 시 `ensureSession`(404→start), AI 윈도우 점수를 분당 집계(avg/min/max/dangerCount)해 `/data` 업로드, 정지 시 잔여 `/data`→`/stop`→`/analysis`. **로그인 WARD만 연동**(아니면 AI 측정만, graceful degrade). 라이브 백엔드로 start→active→data→stop→analysis→report 전수 검증. 점수 계산은 여전히 AI 추론 서버(:8000), 백엔드엔 집계만 전송.
- [x] **리포트/대시보드 조회 연동** (2026-05-26) — `src/api/reports.js`(getDailyReport/getGuardianDailyReport/getDashboard/getSessionReport). `ElderHistory`→`/reports/daily`(7일 바차트+세션목록), `CareDashboard`→`/reports/dashboard`(동적 타일/카드, 탭 시 wardId·name 파라미터 전달), `CarePatientDetail`→`/reports/ward/{id}/daily`(기간 7/30/90 선택, todayMetrics 지표). 라이브 백엔드로 WARD daily + 연동 GUARDIAN dashboard/ward-daily 검증. 모두 로딩/빈 상태 처리.
  - **톤 매핑**: 백엔드 riskLevel은 NORMAL/SUSPECTED 2단계뿐 → UI 3단계(ok/caution/danger)는 latestScore<50=danger, SUSPECTED=caution, else ok로 산출.
  - **필드 공백**: CarePatientDetail의 이동거리/속도 등은 백엔드에 없음 → 평균/범위/대칭/변동성/측정·위험 횟수로 대체. symmetryScore는 analysis가 asymmetryScore 보낼 때만 채워짐(현재 null 가능).
- [x] **가족연동/프로필/알림 연동** (2026-05-26):
  - `src/api/user.js`(me/updateMe/deviceToken/deleteAccount), `ward.js`(physical-info get/put), `links.js`(코드생성/연결/목록/해제/알림), `location.js`(업로드/스트림URL).
  - **ElderCaregiver**(WARD): 보호자 전화번호로 `/ward-link/code` 코드 생성 + `/ward-link/guardians` 목록.
  - **CareInvite**(GUARDIAN): 코드 표시→**입력**으로 변경, `/ward-link` 연결 (백엔드 모델=보호자가 코드 입력).
  - **ElderProfile**: `/users/me` + `/wards/me/physical-info` 실제 표시 + 로그아웃(`logout()`→`/(auth)/`).
  - **CareAlerts**: 연동 노약자별 `/ward-link/{id}/alerts` 병합·시간순 정렬. AlertType은 `STROKE_DANGER` 한 종류.
  - 라이브 백엔드로 me/physical-info/guardians/wards/alerts/device-token 전수 검증.
  - **AuthConnect(노약자 가입 중 코드입력 화면)는 미연동**: 백엔드는 WARD가 코드를 *생성*하는 모델이라 "WARD가 코드 입력"은 존재X. 실제 연동은 ElderCaregiver에서 함. 가입 플로우의 AuthConnect는 건너뛰기 단계로 유지.
- [ ] **위치(CareLocation) 미완**: `/api/locations/stream/{wardId}` SSE가 JWT 인증 필요 → 표준 EventSource는 헤더 못 보냄(웹 불가), 네이티브는 헤더지원 SSE(react-native-sse) 필요. 실시간 지도엔 지도 라이브러리도 필요. `location.js`만 만들어둠.
- [ ] **FCM 푸시 미완**: Expo Go 원격푸시 미지원 + 백엔드가 Firebase FCM 토큰 요구 → dev build + google-services.json 필요. `updateDeviceToken()` 함수는 준비됨(등록 검증 완료), 실제 토큰 획득은 dev build 이후.
- [ ] SQLite 로컬 저장 (expo-sqlite, 오프라인 대비)
- [ ] Vercel 실제 배포

> 작업할 때마다 위 체크리스트와 결정사항 표를 갱신할 것.

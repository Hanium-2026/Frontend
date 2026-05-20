# NEVO 프론트엔드 현황 (FE Status)

> 마지막 업데이트: 2026-05-21
> 담당: 프론트엔드 (React Native / Expo)

---

## 프로젝트 개요

- **앱 이름**: NEVO — IMU 기반 보행 분석 앱
- **목적**: 노인 사용자의 보행 패턴을 분석해 뇌 건강·낙상 위험을 모니터링
- **최종 목표**: iOS App Store + Google Play 출시
- **중간 목표**: Vercel 웹 배포 (공유/데모용)
- **센서 계획**: Android IMU 센서 읽기는 Kotlin 네이티브 모듈로 별도 구현 예정 (API 연동)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Expo SDK 54 (React Native 0.81.5, React 19.1.0) |
| 언어 | JavaScript (JSX) — TypeScript 아님 |
| 라우팅 | Expo Router (파일 기반, Next.js 방식) |
| 차트/SVG | react-native-svg |
| 그라디언트 | expo-linear-gradient |
| 폰트 | Pretendard (expo-font로 로드) |
| 웹 빌드 | `npx expo export -p web` → dist/ |
| 배포 | Vercel (vercel.json 설정 완료) |

---

## 프로젝트 구조

```
nevo-app/
├── app/                        # Expo Router 라우트
│   ├── _layout.jsx             # 루트 레이아웃 (폰트 로드)
│   ├── index.jsx               # → /(auth)/ 리다이렉트
│   ├── (auth)/                 # 인증 플로우
│   ├── (elder)/                # 노인 사용자 앱
│   └── (caregiver)/            # 보호자 앱
├── src/
│   ├── tokens.js               # 디자인 토큰 (색상, 폰트)
│   ├── icons.jsx               # 22개 SVG 아이콘
│   ├── components/             # 공통 컴포넌트 (10개)
│   └── screens/
│       ├── auth/               # 인증 화면 9개 ✅
│       ├── elder/              # 노인 화면 8개 ✅
│       └── caregiver/          # 보호자 화면 7개 ✅
└── assets/fonts/               # Pretendard OTF 5종
```

---

## 구현 완료 화면 (총 24개)

### 인증 (9개)
| 파일 | 화면 | 다음 경로 |
|------|------|----------|
| AuthChoice | 시작/로그인 선택 | /(auth)/role |
| AuthRolePick | 역할 선택 (노인/보호자) | /(auth)/phone |
| AuthPhone | 전화번호 입력 (커스텀 넘패드) | /(auth)/otp |
| AuthOTP | 6자리 OTP 입력 | /(auth)/profile |
| AuthProfile | 이름·성별·출생연도 | /(auth)/permissions |
| AuthPermissions | 권한 설정 토글 | /(auth)/connect |
| AuthConnect | 4자리 가족 연결 코드 | /(auth)/welcome |
| CareInvite | 보호자 초대 코드 | /(auth)/welcome |
| AuthWelcome | 완료 | /(elder)/ |

### 노인 (8개)
| 파일 | 화면 |
|------|------|
| ElderOnboarding | 앱 소개 + 역할 선택 |
| ElderHome | 홈 (오늘 상태, 측정 CTA, 지표 타일) |
| ElderMeasure | 실시간 IMU 측정 (다크 테마) |
| ElderResult | 측정 결과 + 상세 지표 |
| ElderHistory | 30일 기록 + 7일 바차트 |
| ElderCaregiver | 보호자 연결 + 초대코드 |
| ElderSOS | 비상 알림 |
| ElderProfile | 내 정보 + 설정 |

### 보호자 (7개)
| 파일 | 화면 |
|------|------|
| CareDashboard | 가족 보행 상태 대시보드 |
| CarePatientDetail | 개별 환자 상세 (30일 트렌드) |
| CareAlerts | 알림 · AI 리포트 피드 |
| CareAnalysis | 히트맵 + 레이더 차트 분석 |
| CareReport | 병원 공유용 PDF 리포트 |
| CareLocation | 실시간 위치 지도 |
| CareNotifSettings | 알림 설정 |

---

## 디자인 시스템

### 폰트 (Pretendard)
```js
T.font           // Pretendard-Regular
T.fontMedium     // Pretendard-Medium
T.fontSemiBold   // Pretendard-SemiBold
T.fontBold       // Pretendard-Bold
T.fontExtraBold  // Pretendard-ExtraBold
```
- fontWeight 속성 사용 금지 — 반드시 fontFamily로 지정
- 폰트 파일 위치: assets/fonts/

### 주요 색상 토큰 (src/tokens.js)
```js
T.blue / T.blueDark / T.blueSoft / T.blueWash
T.ok / T.okSoft
T.caution / T.cautionSoft
T.danger / T.dangerSoft
T.ink / T.muted / T.line / T.bg
```

### 공통 컴포넌트
| 컴포넌트 | 역할 |
|---------|------|
| Card | 흰 카드 (shadow + border) |
| Pill | 상태 뱃지 (ok/caution/danger/info) |
| Avatar | 이니셜 원형 아바타 |
| TabBar | 하단 탭바 (Expo Router 연동) |
| AppHeader | 상단 헤더 (back 버튼 옵션) |
| SectionLabel | 섹션 제목 행 |
| ElderTopBlock | 파란 그라디언트 헤더 (blob 장식 포함) |
| SparkLine | SVG 스파크라인 차트 |
| BarChart | SVG 바차트 |
| IMUTrace | SVG IMU 파형 |

### CSS → React Native 규칙
- `fontWeight` → `fontFamily` (Pretendard)
- `gap` → React Native 0.71+ 지원 (사용 가능)
- 그라디언트 → `expo-linear-gradient`
- 2열 그리드 → `flexDirection: 'row'` + `flex: 1` (width % 금지)
- SVG → `react-native-svg`

---

## 주요 결정사항 (회의 반영)

| 날짜 | 결정 내용 |
|------|----------|
| 2026-05-21 | **보폭 → 이동 거리로 전체 교체** (ElderHome, ElderMeasure, ElderResult, CarePatientDetail, CareReport, CareAnalysis 6개 파일) |

---

## 백엔드 API 연동 가이드

> 출처: 백엔드팀 제공 front_session.md

### 기본 정보
- **Base URL**: `http://localhost:8080` (운영 도메인으로 교체 필요)
- **인증**: 모든 세션 API에 `Authorization: Bearer {accessToken}` 헤더 필수
- **대상**: WARD 전용 — GUARDIAN JWT로 호출 시 403

### 점수 계산 책임
앱이 직접 계산해서 백엔드로 전송
```
TFLite 모델 → 2초 슬라이딩 윈도우 → 초당 score 출력
앱 (1분마다 집계) → avg / min / max / dangerCount → SQLite 저장 → 백엔드 업로드
```

### API 목록

| 메서드 | 경로 | 역할 |
|--------|------|------|
| POST | /api/gait/sessions/start | 세션 시작 → sessionId, startedAt 반환 |
| GET | /api/gait/sessions/active | 진행 중 세션 조회 |
| POST | /api/gait/sessions/{sessionId}/data | 분당 보행 데이터 업로드 (배치) |
| POST | /api/gait/sessions/{sessionId}/stop | 세션 종료 |
| POST | /api/gait/sessions/{sessionId}/analysis | 분석 결과 업로드 |

### 전체 앱 흐름
```
앱 실행
  └─ GET /active
       ├─ 200 ACTIVE → 기존 sessionId 복구 → 미업로드 데이터 배치 전송 후 재개
       └─ 404 없음  → 시작 버튼 활성화

시작 버튼 클릭
  └─ POST /start → sessionId 저장 (SQLite)

측정 중 (백그라운드)
  └─ TFLite 분석 → 분당 avg/min/max/dangerCount 계산 → SQLite 저장
  └─ 네트워크 연결마다 POST /data 배치 업로드

종료 버튼 클릭
  └─ POST /stop
  └─ POST /data (마지막 잔여 데이터)
  └─ AI 분석 완료 후 POST /analysis

매일 00시 (백엔드 자동)
  └─ 남아있는 ACTIVE 세션 → COMPLETED 처리
```

### /data 업로드 형식
```json
{
  "data": [
    {
      "minuteAt": "2026-05-17T03:01:00",
      "avgScore": 75.5,
      "minScore": 60.0,
      "maxScore": 90.0,
      "dangerCount": 1
    }
  ]
}
```
- minuteAt은 분 단위로 전송 권장 (초 단위 보내도 서버가 분으로 처리)
- 중복 전송 안전 (같은 minuteAt 재전송해도 중복 저장 안 됨)

### /analysis 업로드 형식
```json
{
  "riskLevel": "NORMAL",
  "avgScore": 77.5,
  "minScore": 60.0,
  "maxScore": 95.0,
  "dangerCount": 1,
  "reportSummary": "보행 패턴 정상"
}
```
- `riskLevel`: "NORMAL" 또는 "SUSPECTED" (대문자 정확히)
- `dangerCount > 0` 이면 보호자에게 FCM 알림 자동 발송

### 에러 코드
| 코드 | HTTP | 상황 | 앱 처리 |
|------|------|------|--------|
| SESSION403 | 403 | GUARDIAN 계정으로 호출 | 접근 불가 안내 |
| SESSION404 | 404 | 진행 중 세션 없음 | 시작 버튼 표시 |
| SESSION409 | 409 | ACTIVE 세션 중복 생성 | /active로 기존 세션 복구 |

---

## 다음에 할 작업 (미완성)

- [ ] 실제 API 연동 (측정 화면 → 백엔드 세션 API)
- [ ] 로그인/인증 토큰 관리 (JWT 저장, 갱신)
- [ ] SQLite 로컬 저장 (expo-sqlite)
- [ ] TFLite 모델 연동 (Kotlin 네이티브 모듈)
- [ ] FCM 푸시 알림 수신 처리
- [ ] Vercel 실제 배포
- [ ] 전체 화면 디자인 QA (간격, 폰트 등 세부 조정)

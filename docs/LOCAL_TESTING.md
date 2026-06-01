# NEVO Local Testing

다른 PC에서 Expo Go로 앱을 테스트할 때 쓰는 절차입니다. Claude나 Codex에게 아래 문장을 그대로 요청해도 됩니다.

```text
NEVO 프론트 테스트 환경을 켜줘. scripts/nevo-dev.ps1로 의존성 설치, Docker DB/Redis 실행, .env.local 생성, 백엔드와 AI 서버 실행까지 하고 마지막에 내가 실행할 Expo 명령과 QR 안내를 알려줘.
```

## 사전 설치

- Node.js LTS
- Docker Desktop
- JDK 17 이상
- 휴대폰의 Expo Go 앱
- Backend 저장소: `Frontend`와 같은 상위 폴더의 `Backend` 또는 `Hanium-2026/Backend`

## 한 번에 준비

PowerShell에서 `Frontend` 폴더를 열고 실행합니다.

```powershell
.\scripts\nevo-dev.ps1 -StartBackend
```

이 명령은 백엔드와 AI 추론 서버를 함께 실행합니다.

Backend 폴더를 자동으로 못 찾으면 직접 지정합니다.

```powershell
.\scripts\nevo-dev.ps1 -StartBackend -BackendPath "C:\Users\sun07\OneDrive\바탕 화면\Backend"
```

스크립트가 하는 일:

- `npm install`
- 현재 Wi-Fi IP 확인
- `.env.local` 생성
- `nevo-db` PostgreSQL 컨테이너 실행, 포트 `5433`
- `nevo-redis` Redis 컨테이너 실행, 포트 `6379`
- 백엔드 `DB_PORT=5433`으로 실행
- AI Python 의존성 설치 후 `scripts/nevo_score_server.py` 실행, 포트 `8000`

`.env.local` 예시:

```env
EXPO_PUBLIC_BACKEND_BASE=http://192.168.0.10:8080
EXPO_PUBLIC_AI_BASE=http://192.168.0.10:8000
```

## Expo 실행

스크립트가 끝나면 같은 터미널에서 실행합니다.

```powershell
npx expo start
```

터미널에 표시되는 QR 코드를 휴대폰 Expo Go로 스캔합니다. PC와 휴대폰은 반드시 같은 Wi-Fi에 있어야 합니다.

## AI 추론 서버를 끄고 준비하기

AI 서버가 필요 없는 경우에만 `-SkipAi`를 붙입니다.

```powershell
.\scripts\nevo-dev.ps1 -StartBackend -SkipAi
npx expo start
```

## 자주 막히는 지점

- 휴대폰에서 API 연결이 안 되면 `.env.local`의 IP가 현재 PC Wi-Fi IP인지 확인하고 `npx expo start -c`로 캐시를 지웁니다.
- Docker 포트 충돌이 나면 기존 `5433`, `6379`, `8080` 사용 프로세스를 종료해야 합니다.
- OTP 코드는 실제 SMS가 아니라 백엔드 콘솔 로그의 `[SMS][DEV ONLY] ... code=NNNNNN`에서 확인합니다.

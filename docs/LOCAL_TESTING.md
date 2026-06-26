# NEVO 로컬 테스트

로컬 백엔드를 띄우고 실기기에서 앱을 테스트하는 절차. (AI 추론은 on-device라 별도 AI 서버 없음)

## 사전 설치
- Node.js LTS, Docker Desktop, JDK 17+
- Backend 저장소: `Frontend`와 같은 상위 폴더의 `Backend` (또는 `Hanium-2026/Backend`)

## 1) 백엔드 환경 기동
PowerShell에서 `Frontend` 폴더를 열고:

```powershell
.\scripts\nevo-dev.ps1 -StartBackend
```

하는 일: `npm install` → Wi-Fi IP 확인 → Docker `nevo-db`(Postgres :5433)·`nevo-redis`(Redis :6379) 실행 → 백엔드 `DB_PORT=5433`으로 실행. 끝나면 이 PC의 LAN IP를 출력한다.

Backend 폴더를 못 찾으면 직접 지정:
```powershell
.\scripts\nevo-dev.ps1 -StartBackend -BackendPath "C:\path\to\Backend"
```

## 2) 앱이 백엔드를 바라보게 설정
앱은 백엔드 주소를 `src/store/serverConfig.js`의 `DEFAULT_BACKEND_BASE`(또는 앱 내 **서버설정 화면**)에서 읽는다. 1)에서 출력된 IP로 둘 중 하나를 맞춘다:
- 코드 기본값: `DEFAULT_BACKEND_BASE = 'http://<이 PC IP>:8080'`
- 또는 앱 실행 후 서버설정 화면(로그인 전 AuthChoice 톱니 / WARD ElderProfile / GUARDIAN CareNotifSettings)에서 입력·저장

## 3) 앱 실행
on-device 보행 측정(TFLite)은 네이티브 모듈이라 **dev build**가 필요하다. → [DEV_BUILD.md](DEV_BUILD.md) 참고.

dev build 설치 후:
```powershell
npx expo start --dev-client
```
폰의 NEVO dev 앱으로 접속(같은 Wi-Fi 필수). 측정 외 화면(인증·대시보드 등)만 볼 거면 Expo Go로 `npx expo start`도 가능하지만, 측정 화면 점수는 dev build에서만 동작한다.

## 자주 막히는 지점
- 폰에서 API 연결 안 됨 → 백엔드 주소 IP가 현재 PC Wi-Fi IP인지 확인, `npx expo start -c`로 캐시 클리어.
- Docker 포트 충돌 → `5433`/`6379`/`8080` 사용 중인 프로세스 종료.
- OTP는 실제 SMS가 아니라 백엔드 콘솔 로그 `[SMS][DEV ONLY] ... code=NNNNNN`에서 확인.

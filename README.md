# NEVO Frontend

스마트폰 IMU(가속도·자이로) 센서로 보행을 분석해 퇴행성 뇌질환(파킨슨·뇌졸중)의 초기 보행 변화를 일상에서 조기 탐지하는 **Android 앱**. AI 추론은 기기에서(on-device 2단계 TFLite) 수행하고, Spring Boot 백엔드는 저장·리포트·알림을 담당한다. 노인(WARD)·보호자(GUARDIAN) 역할을 지원한다.

- 기술: Expo SDK 54 (React Native 0.81.5 / JavaScript), Expo Router, react-native-fast-tflite
- 기준 문서: 한이음 개발보고서 (목표) → 세부 구현 기준은 아래 문서 참고

## 📚 문서 맵

| 문서 | 내용 |
|------|------|
| [AGENTS.md](AGENTS.md) | **단일 기준 문서** — 아키텍처·디자인 시스템·on-device 파이프라인·백엔드 API·현재/목표 갭 |
| [docs/LOCAL_TESTING.md](docs/LOCAL_TESTING.md) | 로컬 백엔드 기동 + 실기기 테스트 절차 |
| [docs/DEV_BUILD.md](docs/DEV_BUILD.md) | EAS dev build(on-device 측정용) 절차 |

## 🎯 Git Convention

| 이모지 | 타입 | 설명 |
|--------|------|------|
| 🎉 `Start` | Start New Project | 프로젝트 시작 (`:tada:`) |
| ✨ `Feat` | 새로운 기능 추가 | 새로운 기능 구현 (`:sparkles:`) |
| 🐛 `Fix` | 버그 수정 | 버그 해결 (`:bug:`) |
| 🎨 `Design` | UI / CSS 수정 | UI 디자인 변경 (`:art:`) |
| ♻️ `Refactor` | 리팩토링 | 코드 구조 개선 (`:recycle:`) |
| 🔧 `Settings` | 설정 변경 | 환경설정, 설정 파일 수정 (`:wrench:`) |
| 🗃️ `Comment` | 주석 | 필요한 주석 추가/변경 (`:card_file_box:`) |
| ➕ `Dependency/Plugin` | 의존성 추가 | 라이브러리, 플러그인 추가 (`:heavy_plus_sign:`) |
| 📊 `Data` | 데이터 / 실험 / 성능 분석 | 데이터셋 추가, 전처리, 실험 결과, 성능 개선 (`:bar_chart:`) |
| 📝 `Docs` | 문서 | 문서 수정 (`:memo:`) |
| 🔀 `Merge` | 병합 | 브랜치 병합 (`:twisted_rightwards_arrows:`) |
| 🚀 `Deploy` | 배포 | 배포 관련 작업 (`:rocket:`) |
| 🚚 `Rename` | 이름 변경 | 파일/폴더명 수정 또는 이동 (`:truck:`) |
| 🔥 `Remove` | 삭제 | 파일/코드 삭제 (`:fire:`) |
| ⏪️ `Revert` | 되돌리기 | 이전 버전으로 롤백 (`:rewind:`) |

<br>



## 📝 커밋 메시지 형식

형식: 작업 내용 요약

예: <br>
✨ Feat: 로그인 기능 구현  
🐛 Fix: 로그인 오류 해결

<br>



## 🌿Branch Convention (GitHub Flow)

- `main` : 배포 가능한 브랜치, 항상 배포 가능한 상태를 유지
- `develop` : 개발 중 사용할 브랜치
- `feature/{작성자 이름}/{description}` : 새로운 기능을 개발하는 브랜치
    - 예: `feature/minho/add-login-page`

<br>



## 🔀 Flow

1. `develop` 브랜치에서 `feature` 브랜치 생성.
2. 작업을 완료하고 커밋 메시지에 맞게 커밋.
3. Pull Request를 생성 / 팀원들의 리뷰.
4. 리뷰가 완료 후 `develop` 브랜치로 병합.
5. 배포 시점에 `develop` 브랜치를 `main` 브랜치로 병합.
6. `main` 브랜치 배포 <br>
#### 예시:
```bash
# 새로운 기능 개발 브랜치 생성
git checkout -b feature/minho/기능명

# 작업 후 커밋 & 원격 저장소에 푸시
git add .
git commit -m "✨ Feat: 기능 설명"
git push origin feature/minho/기능명

# ➡️ GitHub에서 PR(Pull Request) 생성
#    base: develop ← compare: feature/기능명
#    팀원들과 코드 리뷰 후 develop 브랜치로 병합

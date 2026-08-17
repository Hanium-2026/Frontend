# NEVO Dev Build (Android)

on-device 보행 측정은 `react-native-fast-tflite`(네이티브 모듈)를 쓰므로 Expo Go로는 측정 화면이 동작하지 않는다. 개발 빌드(dev client)가 필요하다. 이 PC엔 Android SDK가 없어 **EAS 클라우드 빌드**를 쓴다.

## 빌드 절차
```powershell
# 1) Expo 계정 로그인 (app.json의 projectId 소유 계정)
npx eas-cli login

# 2) Android dev build (클라우드, ~15-20분 → APK 링크/QR)
npx eas-cli build --profile development --platform android
```

`eas.json`의 `development` 프로파일: `developmentClient: true`, `distribution: internal`, APK.

## 설치 & 실행
1. 빌드 완료 후 나온 APK를 폰에 설치 (QR 스캔 또는 링크)
2. `npx expo start --dev-client`
3. 폰의 **NEVO dev 앱**(Expo Go 아님)으로 접속, PC와 같은 Wi-Fi
4. 측정 화면에서 걸으면 on-device 추론(1차 동작분류 → 2차 정상/이상)으로 점수 표시

## 참고
- 로컬 HTTP 백엔드 접속을 위해 `app.json`의 `expo-build-properties`에 `android.usesCleartextTraffic: true` 설정됨.
- 모델 갱신: `assets/models/`의 `.tflite`/scaler를 교체하면 다음 빌드에 반영. (전처리는 `src/ml/gaitPreprocess.js`)
- FCM 푸시: 프론트 연동 완료(`expo-notifications` + `google-services.json` 커밋됨, `com.nevo.app`/`nevo-a5a79`). 이 dev build부터 로그인 시 FCM 토큰 등록됨. ⚠️ 실발송은 백엔드가 같은 프로젝트 service account 키를 넣어야 동작.

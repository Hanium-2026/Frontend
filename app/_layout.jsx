import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { tokenStore } from '../src/store/tokenStore';
import { serverConfig } from '../src/store/serverConfig';
import { fontScale } from '../src/store/fontScale';
import { registerPushToken } from '../src/notifications/push';

SplashScreen.preventAutoHideAsync();

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const [loaded] = useFonts({
    'Pretendard-Regular':   require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':    require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold':  require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':      require('../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  });

  // 저장된 토큰·서버 주소를 메모리로 로드 — 라우팅/요청 전에 완료돼야 함.
  const [sessionLoaded, setSessionLoaded] = useState(false);
  useEffect(() => {
    Promise.all([tokenStore.load(), serverConfig.load(), fontScale.load()]).finally(() => setSessionLoaded(true));
  }, []);

  const ready = loaded && sessionLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // 이미 로그인 상태면 앱 시작 시 FCM 토큰 등록/갱신.
  const router = useRouter();
  useEffect(() => {
    if (ready && tokenStore.isLoggedIn()) registerPushToken();
  }, [ready]);

  // 알림 탭 → 보호자 알림 화면으로 이동. (백엔드 data.type: STROKE_DANGER)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const data = res?.notification?.request?.content?.data || {};
      if (data.type === 'STROKE_DANGER') router.push('/(caregiver)/alerts');
    });
    return () => sub.remove();
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#fff' }}/>;

  const stack = (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, animationTypeForReplace: 'push' }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(auth)"/>
      <Stack.Screen name="(elder)"/>
      <Stack.Screen name="(caregiver)"/>
      <Stack.Screen name="server-config"/>
    </Stack>
  );

  if (!isWeb) return <SafeAreaProvider>{stack}</SafeAreaProvider>;

  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @media (max-width: 480px) {
          .phone-shell { border-radius: 0 !important; box-shadow: none !important; width: 100vw !important; height: 100vh !important; }
        }
      `}</style>
      <View
        className="phone-shell"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
        }}
      >
        {stack}
      </View>
    </View>
  );
}

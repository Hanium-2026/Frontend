import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { tokenStore } from '../src/store/tokenStore';

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

  // 저장된 토큰을 메모리로 로드 — 라우팅/요청 전에 완료돼야 함.
  const [sessionLoaded, setSessionLoaded] = useState(false);
  useEffect(() => {
    tokenStore.load().finally(() => setSessionLoaded(true));
  }, []);

  const ready = loaded && sessionLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#fff' }}/>;

  const stack = (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, animationTypeForReplace: 'push' }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(auth)"/>
      <Stack.Screen name="(elder)"/>
      <Stack.Screen name="(caregiver)"/>
    </Stack>
  );

  if (!isWeb) return stack;

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

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Pretendard-Regular':   require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium':    require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold':  require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold':      require('../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#fff' }}/>;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(auth)"/>
      <Stack.Screen name="(elder)"/>
      <Stack.Screen name="(caregiver)"/>
    </Stack>
  );
}

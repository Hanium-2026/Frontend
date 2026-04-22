import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="permissions" />
        <Stack.Screen name="connect" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="mypage" />
        <Stack.Screen name="elderly" />
        <Stack.Screen name="guardian" />
      </Stack>
    </>
  );
}

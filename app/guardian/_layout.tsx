import { Stack } from 'expo-router';

export default function GuardianLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="detail/[id]" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

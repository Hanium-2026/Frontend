import { Stack } from 'expo-router';

export default function ElderlyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="prep" />
      <Stack.Screen name="measure" />
      <Stack.Screen name="analyzing" />
      <Stack.Screen name="result" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function ElderLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, animationTypeForReplace: 'push' }}/>;
}

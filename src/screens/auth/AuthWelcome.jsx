import React from 'react';
import { View } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import Button from '../../components/Button';
import { authStore } from '../../store/authStore';

export default function AuthWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, role } = authStore.get();
  const displayName = name || '사용자';
  const isWard = role !== 'caregiver';
  const dest = isWard ? '/(elder)/' : '/(caregiver)/';

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: T.sp.lg, gap: T.sp.lg }}>
        <Card pad={T.sp.xl}>
          <Pill tone="ok" size="lg">준비 완료</Pill>
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35, marginTop: T.sp.lg }}>
            {displayName}님,{'\n'}이제 걸으시면 됩니다
          </Text>
        </Card>

        {isWard && (
          <Card pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>가족도 함께 보게 할까요</Text>
            <Button variant="outline" onPress={() => router.push('/(elder)/caregiver')} style={{ marginTop: T.sp.lg }}>
              보호자와 연결하기
            </Button>
          </Card>
        )}
      </View>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
        <Button onPress={() => router.replace(dest)}>홈으로 가기</Button>
      </View>
    </View>
  );
}

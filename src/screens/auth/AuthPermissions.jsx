import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';
import { authStore } from '../../store/authStore';

const PERMS = [
  ['신체 활동', '걸음을 감지하는 데 씁니다.'],
  ['위치', '긴급 요청 때만 사용합니다.'],
];

export default function AuthPermissions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    const { role } = authStore.get();
    router.push(role === 'caregiver' ? '/(auth)/invite' : '/(auth)/connect');
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StepHeader step={5} total={5}/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl, gap: T.sp.lg }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>두 가지 권한이{'\n'}필요합니다</Text>

        {PERMS.map(([title, body]) => (
          <Card key={title} pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{title}</Text>
            <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm, lineHeight: T.fs.body * 1.6 }}>{body}</Text>
          </Card>
        ))}
      </ScrollView>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
        <Button onPress={handleNext}>권한 허용하기</Button>
      </View>
    </View>
  );
}

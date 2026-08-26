import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import { authStore } from '../../store/authStore';
import Button from '../../components/Button';
import SelectableCard from '../../components/SelectableCard';

const OPTIONS = [
  ['elder', '본인이 사용해요'],
  ['caregiver', '가족을 살펴요'],
];

export default function AuthRolePick() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState('elder');

  const handleNext = () => {
    authStore.set({ role });
    router.push('/(auth)/phone');
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 40, paddingHorizontal: T.sp.lg }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>
          어떤 분이{'\n'}사용하시나요
        </Text>
        <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>나중에 바꿀 수 없어요.</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.xl, gap: T.sp.lg }}>
        {OPTIONS.map(([value, label]) => (
          <SelectableCard key={value} title={label} selected={role === value} onPress={() => setRole(value)}/>
        ))}
      </ScrollView>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
        <Button onPress={handleNext}>다음</Button>
      </View>
    </View>
  );
}

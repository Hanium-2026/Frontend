import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import { authStore } from '../../store/authStore';

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
        {OPTIONS.map(([value, label]) => {
          const on = role === value;
          return (
            <Pressable key={value} onPress={() => setRole(value)} style={{
              backgroundColor: T.surface, borderRadius: T.radius.md, padding: T.sp.xl,
              borderWidth: on ? 2 : 1, borderColor: on ? T.blue : T.line,
            }}>
              <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
        <Pressable onPress={handleNext} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

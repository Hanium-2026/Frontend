import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import { authStore } from '../../store/authStore';

function ProgressBar({ ratio }) {
  return (
    <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: T.line }}>
      <View style={{ width: `${ratio * 100}%`, height: 6, borderRadius: 3, backgroundColor: T.ink }}/>
    </View>
  );
}

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
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.lg, paddingBottom: T.sp.md, flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <ProgressBar ratio={1}/>
      </View>

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
        <Pressable onPress={handleNext} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>권한 허용하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

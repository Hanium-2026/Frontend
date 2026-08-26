import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Button from '../../components/Button';

export default function AuthChoice() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <Pressable
        onPress={() => router.push('/server-config')}
        style={{ position: 'absolute', top: insets.top + 10, right: 20, zIndex: 1, width: 38, height: 38, borderRadius: 19, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon.settings width={18} height={18} color={T.muted}/>
      </Pressable>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: T.sp.lg }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display, letterSpacing: -0.9 }}>nevo</Text>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35, marginTop: T.sp.xl }}>
          걷기만 하면{'\n'}걸음의 변화를 살펴봅니다
        </Text>

        <View style={{ height: 200, borderRadius: T.radius.md, backgroundColor: T.line, alignItems: 'center', justifyContent: 'center', marginTop: T.sp.xl }}>
          <Text style={{ fontSize: T.fs.caption, color: T.muted }}>일러스트 자리</Text>
        </View>
      </ScrollView>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl), gap: T.sp.lg }}>
        <Button onPress={() => router.push('/(auth)/role')}>시작하기</Button>
        <Button variant="text" onPress={() => router.push('/(auth)/login')} style={{ height: 56, alignItems: 'center', justifyContent: 'center' }}>
          이미 계정이 있어요
        </Button>
        <Text style={{ fontSize: T.fs.caption, color: T.muted, textAlign: 'center', lineHeight: T.fs.caption * 1.5 }}>
          시작하시면 이용약관과 개인정보 처리방침에{'\n'}동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
}

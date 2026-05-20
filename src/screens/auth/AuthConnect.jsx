import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Avatar from '../../components/Avatar';

function StepBar({ step, total = 5 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
    </View>
  );
}

export default function AuthConnect() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <StepBar step={5}/>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>가족과{'\n'}연결해볼까요?</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>보호자 앱에서 발급받은 4자리 코드를 입력해주세요</Text>

        <View style={{ marginTop: 40, flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
          {['4','8','2','7'].map((d, i) => (
            <View key={i} style={{ width: 60, height: 72, borderRadius: 14, backgroundColor: T.blueSoft, borderWidth: 1.5, borderColor: T.blueChip, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32, fontFamily: T.fontExtraBold, color: T.ink }}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, marginBottom: 10, textAlign: 'center', letterSpacing: 0.4 }}>이 사람과 연결됩니다</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name="민지" size={48}/>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>이민지</Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>딸 · 010-9876-5432</Text>
            </View>
            <Icon.check width={22} height={22} color={T.ok}/>
          </View>
        </View>

        <Pressable style={{ marginTop: 18, height: 48, borderRadius: 12, backgroundColor: T.bg, borderWidth: 1.5, borderColor: T.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14, fontFamily: T.fontSemiBold, color: T.body }}>QR 코드로 연결하기</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/welcome')} style={{ marginTop: 16, alignItems: 'center', padding: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>나중에 연결할게요</Text>
        </Pressable>
      </ScrollView>

      <View style={{ padding: 20, paddingBottom: 36 }}>
        <Pressable onPress={() => router.push('/(auth)/welcome')} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>연결하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

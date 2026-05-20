import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';

function StepBar({ step, total = 5 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
    </View>
  );
}

export default function AuthOTP() {
  const router = useRouter();
  const digits = ['4','8','2','7','',''];
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <StepBar step={2}/>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>인증번호를{'\n'}입력해주세요</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
          <Text style={{ fontFamily: T.fontBold, color: T.body }}>010-1234-5678</Text>으로 6자리 코드를 보냈어요
        </Text>

        <View style={{ marginTop: 40, flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
          {digits.map((d, i) => (
            <View key={i} style={{
              width: 50, height: 60, borderRadius: 12,
              backgroundColor: d ? T.blueSoft : T.bg,
              borderWidth: i === 4 ? 2 : 1.5,
              borderColor: i === 4 ? T.blue : (d ? T.blueChip : T.line),
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28, fontFamily: T.fontExtraBold, color: T.ink }}>{d}</Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: T.muted }}>
          남은 시간 <Text style={{ color: T.blue, fontFamily: T.fontBold }}>2:48</Text>
        </Text>

        <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
          <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted }}>번호 변경</Text>
          </Pressable>
          <View style={{ width: 1, backgroundColor: T.line }}/>
          <Pressable style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.blue }}>다시 받기</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}/>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 16 }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            <Pressable key={i} disabled={!k} style={{ width: '33.33%', height: 52, borderRadius: 10, backgroundColor: k ? '#fff' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, fontFamily: T.fontSemiBold, color: T.ink }}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ padding: 20, paddingBottom: 36 }}>
        <Pressable onPress={() => router.push('/(auth)/profile')} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

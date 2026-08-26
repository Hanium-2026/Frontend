import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';

export default function AuthConnect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const isComplete = code.length === 4;

  const handleKey = (k) => {
    if (k === '⌫') setCode(c => c.slice(0, -1));
    else if (code.length < 4) setCode(c => c + k);
  };

  const boxes = Array.from({ length: 4 }, (_, i) => code[i] || '');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StepHeader step={6} total={6}/>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: T.fs.title * 1.25 }}>가족과{'\n'}연결해볼까요?</Text>
        <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 10, lineHeight: 22 }}>보호자 앱에서 발급받은 4자리 코드를 입력해주세요</Text>

        <View style={{ marginTop: 32, flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
          {boxes.map((d, i) => {
            const isCurrent = i === code.length;
            const isFilled = i < code.length;
            return (
              <View key={i} style={{
                width: 60, height: 72, borderRadius: 14,
                backgroundColor: isFilled ? T.blueSoft : T.bg,
                borderWidth: isCurrent ? 2 : 1.5,
                borderColor: isCurrent ? T.blue : (isFilled ? T.blueChip : T.line),
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 32, fontFamily: T.fontExtraBold, color: T.ink }}>{d}</Text>
              </View>
            );
          })}
        </View>

        {isComplete && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontBold, marginBottom: 10, textAlign: 'center', letterSpacing: 0.4 }}>이 사람과 연결됩니다</Text>
            <View style={{ backgroundColor: T.surface, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name="민지" size={48}/>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontBold, color: T.ink }}>이민지</Text>
                <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 1 }}>딸 · 010-9876-5432</Text>
              </View>
              <Icon.check width={22} height={22} color={T.ok}/>
            </View>
          </View>
        )}

        <View style={{ flex: 1 }}/>

        {!isComplete && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 16 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <Pressable key={i} onPress={() => k && handleKey(k)} disabled={!k}
                style={{ width: '33.33%', height: 52, borderRadius: 10, backgroundColor: k ? T.surface : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, fontFamily: T.fontSemiBold, color: T.ink }}>{k}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20), gap: 10 }}>
        <Button onPress={() => router.push('/(auth)/welcome')}>{isComplete ? '연결하기' : '나중에 연결할게요'}</Button>
      </View>
    </View>
  );
}

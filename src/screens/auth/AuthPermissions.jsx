import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';

function StepBar({ step, total = 6 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
    </View>
  );
}

const PERMS = [
  { i: 'walk',  t: '걸음 측정',          s: '주머니에 있을 때 자동 측정', need: '필수' },
  { i: 'bell',  t: '알림',               s: '측정 결과와 가족 알림',      need: '필수' },
  { i: 'pin',   t: '위치 (선택)',        s: '응급 시 가족에게 위치 전송',  need: '선택' },
  { i: 'heart', t: '건강 데이터 (선택)', s: 'Apple 건강과 연동',          need: '선택' },
];

export default function AuthPermissions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [enabled, setEnabled] = useState([true, true, false, false]);

  const toggle = (i) => setEnabled(prev => prev.map((v, j) => j === i ? !v : v));

  const handleNext = () => {
    const { role } = authStore.get();
    router.push(role === 'caregiver' ? '/(auth)/invite' : '/(auth)/connect');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <StepBar step={5}/>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>몇 가지 권한이{'\n'}필요해요</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>정확한 측정과 가족 알림을 위해 사용됩니다</Text>

        <View style={{ marginTop: 28, gap: 10 }}>
          {PERMS.map((p, i) => {
            const I = Icon[p.i];
            const on = enabled[i];
            return (
              <Pressable key={i} onPress={() => toggle(i)} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: on ? T.blueChip : T.line, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: on ? T.blueSoft : T.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <I width={22} height={22} color={on ? T.blue : T.muted}/>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>{p.t}</Text>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: p.need === '필수' ? T.dangerSoft : T.bg }}>
                      <Text style={{ fontSize: 10, color: p.need === '필수' ? '#9B1B1B' : T.muted, fontFamily: T.fontBold }}>{p.need}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{p.s}</Text>
                </View>
                <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: on ? T.blue : T.line, justifyContent: 'center', flexShrink: 0 }}>
                  <View style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable onPress={handleNext} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>모두 허용하기</Text>
        </Pressable>
        <Text style={{ marginTop: 12, fontSize: 12.5, color: T.muted, textAlign: 'center' }}>언제든지 설정에서 변경할 수 있어요</Text>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';
import Icon from '../icons';

// 회원가입 플로우 전용 헤더(뒤로가기+진행바). 기존엔 화면마다 진행바 구현이 3종류로 갈려 있었고
// (단일 fill bar 6곳 + 분절bar 1곳), 진행률도 ratio={n/5}처럼 화면마다 분수를 하드코딩했다.
// 여기서는 step/total만 받아 계산한다. 뒤로가기 버튼은 AppHeader의 것과 시각적으로 동일하게 맞춘다.
export default function StepHeader({ step, total, onBack }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ratio = total > 0 ? Math.min(1, Math.max(0, step / total)) : 0;
  return (
    <View style={{
      paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 20,
      flexDirection: 'row', alignItems: 'center', gap: 14,
    }}>
      <Pressable onPress={onBack || (() => router.back())} style={{
        width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface,
        borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon.arrowLeft width={18} height={18} color={T.ink}/>
      </Pressable>
      <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: T.line, overflow: 'hidden' }}>
        <View style={{ width: `${ratio * 100}%`, height: 8, borderRadius: 4, backgroundColor: T.blue }}/>
      </View>
    </View>
  );
}

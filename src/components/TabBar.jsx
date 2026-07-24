import React from 'react';
import { View, Pressable } from 'react-native';
import Text from './Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';
import Icon from '../icons';

export default function TabBar({ tabs, active }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // 하단 제스처/네비게이션 바 높이는 기기마다 달라 인셋으로 보정(없으면 최소 여백).
  const bottomPad = Math.max(insets.bottom, 10);
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: bottomPad, paddingTop: 8,
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderTopWidth: 0.5, borderTopColor: T.hair,
      flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {tabs.map((t, i) => {
        const on = i === active;
        const I = Icon[t.icon];
        return (
          <Pressable key={i} onPress={() => t.path && router.push(t.path)}
            style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <I width={24} height={24} color={on ? T.blue : T.muted}/>
            <Text style={{ fontSize: 10.5, fontFamily: on ? T.fontBold : T.fontMedium, color: on ? T.blue : T.muted }}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

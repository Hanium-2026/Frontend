import React from 'react';
import { View, Pressable } from 'react-native';
import Text from './Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';

// 확정 디자인: 아이콘 없이 글자만. 활성 탭은 위쪽 인셋 선(ink) + ink 색, 비활성은 muted.
export default function TabBar({ tabs, active }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: bottomPad,
      backgroundColor: T.surface,
      borderTopWidth: 1, borderTopColor: T.line,
      flexDirection: 'row',
    }}>
      {tabs.map((t, i) => {
        const on = i === active;
        return (
          <Pressable key={i} onPress={() => t.path && router.push(t.path)}
            style={{
              flex: 1, height: 64, alignItems: 'center', justifyContent: 'center',
              borderTopWidth: 3, borderTopColor: on ? T.ink : 'transparent', marginTop: -1,
            }}>
            <Text style={{ fontSize: T.fs.body, fontFamily: on ? T.fontSemiBold : T.fontMedium, color: on ? T.ink : T.muted }}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

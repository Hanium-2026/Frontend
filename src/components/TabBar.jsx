import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../tokens';
import Icon from '../icons';

export default function TabBar({ tabs, active }) {
  const router = useRouter();
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 84, paddingBottom: 28, paddingTop: 8,
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

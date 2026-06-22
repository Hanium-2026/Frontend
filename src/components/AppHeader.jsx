import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../tokens';
import Icon from '../icons';

export default function AppHeader({ title, sub, right, onBack }) {
  const router = useRouter();
  return (
    <View style={{ paddingTop: 54, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      {onBack && (
        <Pressable onPress={() => router.back()} style={{
          width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
          borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
        }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6, lineHeight: 30 }}>{title}</Text>
        {sub && <Text style={{ fontSize: T.fs.label, fontFamily: T.font, color: T.body, marginTop: 3 }}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

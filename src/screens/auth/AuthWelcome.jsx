import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';

export default function AuthWelcome() {
  const router = useRouter();
  const { name, role } = authStore.get();
  const displayName = name || '사용자';
  const dest = role === 'caregiver' ? '/(caregiver)/' : '/(elder)/';
  return (
    <View style={{ flex: 1, backgroundColor: T.blue }}>
      <View style={{ flex: 1, paddingTop: 180, paddingHorizontal: 32, alignItems: 'center' }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 60, elevation: 12 }}>
          <Icon.check width={56} height={56} color={T.blue}/>
        </View>

        <Text style={{ fontSize: 32, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 28, letterSpacing: -1, lineHeight: 40, textAlign: 'center' }}>
          {displayName}님,{'\n'}이제 시작해요!
        </Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 14, lineHeight: 24, textAlign: 'center' }}>
          평소처럼 걸으시면 자동으로{'\n'}분석해드릴게요
        </Text>

        <View style={{ marginTop: 40, gap: 10, width: '100%', maxWidth: 320 }}>
          {[['shield','계정 생성 완료'],['family','딸 이민지님과 연결됨'],['walk','자동 측정 시작']].map(([i, t], k) => {
            const I = Icon[i];
            return (
              <View key={k} style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                <I width={20} height={20} color="#fff"/>
                <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: '#fff' }}>{t}</Text>
                <Icon.check width={16} height={16} color="#86E3C1"/>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => router.replace(dest)} style={{ height: 58, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: T.blue }}>NEVO 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

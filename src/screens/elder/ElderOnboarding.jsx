import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';

export default function ElderOnboarding() {
  const router = useRouter();
  const features = [
    { i: 'spark',  t: '자동 측정',  s: '평소처럼 걸으면 됩니다' },
    { i: 'brain',  t: 'AI 분석',    s: '보행 패턴을 정밀 분석해요' },
    { i: 'family', t: '가족 연결',  s: '보호자와 결과를 공유해요' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* radial-gradient 근사: blueSoft → white 세로 그라디언트 */}
        <LinearGradient
          colors={[T.blueSoft, '#ffffff']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.65 }}
          style={{ paddingTop: 120, paddingHorizontal: 32, paddingBottom: 40, alignItems: 'center' }}
        >
          <View style={{
            width: 96, height: 96, borderRadius: 28, backgroundColor: T.blue,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: T.blue, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.25, shadowRadius: 32,
            elevation: 12, marginBottom: 28,
          }}>
            <Icon.walk width={56} height={56} color="#fff"/>
          </View>
          <Text style={{ fontSize: 36, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: 4, lineHeight: 40 }}>NEVO</Text>
          <Text style={{ fontSize: 15, fontFamily: T.font, color: T.muted, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            {'매일 걷는 것만으로\n뇌 건강을 살펴드려요'}
          </Text>

          <View style={{ marginTop: 48, width: '100%', gap: 14 }}>
            {features.map((f, k) => {
              const I = Icon[f.i];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                  }}>
                    <I width={22} height={22} color={T.blue}/>
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>{f.t}</Text>
                    <Text style={{ fontSize: 13, fontFamily: T.font, color: T.muted, marginTop: 1 }}>{f.s}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 12, fontFamily: T.font, color: T.muted, textAlign: 'center', marginBottom: 12 }}>어떻게 사용하시나요?</Text>
          <Pressable
            onPress={() => router.push('/(auth)/')}
            style={{ width: '100%', height: 56, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <Icon.user width={20} height={20} color="#fff"/>
            <Text style={{ fontSize: 16, fontFamily: T.fontBold, color: '#fff' }}>본인이 사용해요</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/')}
            style={{ width: '100%', height: 56, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: T.blueSoft }}>
            <Icon.family width={20} height={20} color={T.blue}/>
            <Text style={{ fontSize: 16, fontFamily: T.fontBold, color: T.blue }}>가족을 돌봐요</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

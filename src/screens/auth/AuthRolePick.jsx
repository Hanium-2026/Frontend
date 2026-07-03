import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Pill from '../../components/Pill';
import { authStore } from '../../store/authStore';

export default function AuthRolePick() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState('elder');

  const handleNext = () => {
    authStore.set({ role });
    router.push('/(auth)/phone');
  };

  const elderOn = role === 'elder';
  const careOn = role === 'caregiver';

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{
          width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
          borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.6 }}>역할 선택 · STEP 0</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 28 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>
          어떻게 사용하시나요?
        </Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
          역할에 따라 다른 화면을 보여드려요.{'\n'}나중에 설정에서 변경할 수 있어요.
        </Text>

        {/* 노약자 카드 */}
        <Pressable onPress={() => setRole('elder')} style={{
          marginTop: 28, backgroundColor: '#fff', borderRadius: 18, padding: 20,
          borderWidth: elderOn ? 2 : 1.5,
          borderColor: elderOn ? T.blue : T.line,
          shadowColor: elderOn ? T.blue : '#000',
          shadowOffset: { width: 0, height: elderOn ? 8 : 2 },
          shadowOpacity: elderOn ? 0.1 : 0.04,
          shadowRadius: elderOn ? 24 : 8,
          elevation: elderOn ? 4 : 1,
        }}>
          {elderOn && (
            <View style={{
              position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13,
              backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.check width={16} height={16} color="#fff"/>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: elderOn ? T.blue : T.bg, alignItems: 'center', justifyContent: 'center', borderWidth: elderOn ? 0 : 1, borderColor: T.line }}>
              <Icon.user width={30} height={30} color={elderOn ? '#fff' : T.body}/>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: T.ink }}>본인이 사용해요</Text>
                <Pill tone="info" size="sm">노약자</Pill>
              </View>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>내 걸음을 직접 측정하고 분석받아요</Text>
            </View>
          </View>
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.line, gap: 8 }}>
            {[['walk','평소처럼 걸으면 자동 측정'],['brain','AI가 보행 패턴을 분석'],['sos','비상 시 가족과 119에 알림']].map(([ic, t], k) => {
              const I = Icon[ic];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <I width={16} height={16} color={elderOn ? T.blue : T.muted}/>
                  <Text style={{ fontSize: 13, color: T.body, fontFamily: T.fontMedium }}>{t}</Text>
                </View>
              );
            })}
          </View>
        </Pressable>

        {/* 보호자 카드 */}
        <Pressable onPress={() => setRole('caregiver')} style={{
          marginTop: 12, backgroundColor: '#fff', borderRadius: 18, padding: 20,
          borderWidth: careOn ? 2 : 1.5,
          borderColor: careOn ? T.blue : T.line,
          shadowColor: careOn ? T.blue : '#000',
          shadowOffset: { width: 0, height: careOn ? 8 : 2 },
          shadowOpacity: careOn ? 0.1 : 0.04,
          shadowRadius: careOn ? 24 : 8,
          elevation: careOn ? 4 : 1,
        }}>
          {careOn && (
            <View style={{
              position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13,
              backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.check width={16} height={16} color="#fff"/>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: careOn ? T.blue : T.bg, alignItems: 'center', justifyContent: 'center', borderWidth: careOn ? 0 : 1, borderColor: T.line }}>
              <Icon.family width={30} height={30} color={careOn ? '#fff' : T.body}/>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: T.ink }}>가족을 돌봐요</Text>
                <Pill tone="neutral" size="sm">보호자</Pill>
              </View>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>부모님·배우자의 보행 데이터를 살펴요</Text>
            </View>
          </View>
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.line, gap: 8 }}>
            {[['chart','여러 가족 한눈에 모니터링'],['bell','위험 신호 즉시 알림'],['doc','의료진에게 PDF 리포트 공유']].map(([ic, t], k) => {
              const I = Icon[ic];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <I width={16} height={16} color={careOn ? T.blue : T.muted}/>
                  <Text style={{ fontSize: 13, color: T.body, fontFamily: T.fontMedium }}>{t}</Text>
                </View>
              );
            })}
          </View>
        </Pressable>
      </ScrollView>

      <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable onPress={handleNext} style={{
          height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

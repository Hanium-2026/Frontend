import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import TextInput from '../../components/TextInput';
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

const CURRENT_YEAR = 2026;

export default function AuthProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWard = authStore.get().role !== 'caregiver';
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [birthYear, setBirthYear] = useState(1960);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('이름 확인', '이름을 입력해주세요.');
      return;
    }
    // WARD(노약자)는 키·몸무게가 회원가입 필수 (백엔드 검증)
    if (isWard) {
      const h = parseFloat(height), w = parseFloat(weight);
      if (!(h > 0) || !(w > 0)) {
        Alert.alert('신체 정보 확인', '키와 몸무게를 입력해주세요.');
        return;
      }
      authStore.set({ height: h, weight: w });
    }
    authStore.set({ name: name.trim(), gender, birthYear });
    router.push('/(auth)/password');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <StepBar step={3}/>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>기본 정보를{'\n'}알려주세요</Text>
          <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>나이와 성별로 더 정확하게 분석해드려요</Text>

          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>이름</Text>
            <TextInput
              style={{
                backgroundColor: T.bg, borderRadius: 12, padding: 16,
                borderWidth: 1.5, borderColor: name ? T.blue : T.line,
                fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink,
              }}
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor={T.muted}
              returnKeyType="done"
            />
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>성별</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[['여성', 'female'], ['남성', 'male']].map(([label, val], i) => {
                const on = gender === val;
                return (
                  <Pressable key={i} onPress={() => setGender(val)} style={{ flex: 1, height: 56, borderRadius: 12, backgroundColor: on ? T.blueSoft : '#fff', borderWidth: on ? 2 : 1.5, borderColor: on ? T.blue : T.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {on && <Icon.check width={18} height={18} color={T.blue}/>}
                    <Text style={{ fontSize: 16, fontFamily: T.fontBold, color: on ? T.blue : T.body }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>출생 연도</Text>
            <View style={{ backgroundColor: T.bg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: T.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable onPress={() => setBirthYear(y => Math.max(1920, y - 1))} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                <Text style={{ fontSize: 24, fontFamily: T.fontBold, color: T.blue }}>−</Text>
              </Pressable>
              <Text style={{ fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}>
                {birthYear}년 ({CURRENT_YEAR - birthYear}세)
              </Text>
              <Pressable onPress={() => setBirthYear(y => Math.min(2010, y + 1))} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                <Text style={{ fontSize: 24, fontFamily: T.fontBold, color: T.blue }}>+</Text>
              </Pressable>
            </View>
          </View>

          {isWard && (
            <View style={{ marginTop: 22, flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>키 (cm)</Text>
                <TextInput
                  style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: height ? T.blue : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={height}
                  onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ''))}
                  placeholder="160"
                  placeholderTextColor={T.muted}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>몸무게 (kg)</Text>
                <TextInput
                  style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: weight ? T.blue : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={weight}
                  onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
                  placeholder="58"
                  placeholderTextColor={T.muted}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
            </View>
          )}

          <View style={{ marginTop: 20, padding: 14, backgroundColor: T.blueWash, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Icon.shield width={16} height={16} color={T.blue}/>
            <Text style={{ fontSize: 12, color: T.body, lineHeight: 20, flex: 1 }}>
              입력하신 정보는 보행 분석에만 사용되며, 외부에 공유되지 않아요.
            </Text>
          </View>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
          <Pressable onPress={handleNext} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>다음</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

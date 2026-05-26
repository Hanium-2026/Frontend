import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';
import { signUp } from '../../api/auth';
import { ApiError } from '../../api/client';

function StepBar({ step, total = 6 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
    </View>
  );
}

// 백엔드 규칙: 8자 이상 + 영문 + 숫자 + 특수문자(@$!%*#?&)
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const ALL_CONSENTS = ['TERMS', 'PRIVACY', 'SMS', 'MEDICAL'].map(
  (consentType) => ({ consentType, agreed: true })
);

export default function AuthPassword() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = PW_RE.test(pw);
  const match = pw.length > 0 && pw === pw2;
  const canSubmit = valid && match && !busy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const { role, phone, name, gender, birthYear, height, weight } = authStore.get();
    const isWard = role !== 'caregiver';

    const payload = {
      phone,
      password: pw,
      name,
      role: isWard ? 'WARD' : 'GUARDIAN',
      consents: ALL_CONSENTS,
      // WARD(노약자)는 키·몸무게·생년월일·성별이 모두 필수 (백엔드 검증)
      ...(isWard ? {
        gender: gender === 'male' ? 'MALE' : 'FEMALE',
        birthDate: `${birthYear}-01-01`,
        height,
        weight,
      } : {}),
    };

    setBusy(true);
    try {
      await signUp(payload);
      router.push('/(auth)/permissions');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '회원가입 중 문제가 발생했어요. 다시 시도해주세요.';
      Alert.alert('회원가입 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <StepBar step={4}/>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>비밀번호를{'\n'}설정해주세요</Text>
          <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>다음 로그인부터 이 비밀번호를 사용해요</Text>

          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>비밀번호</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: pw ? (valid ? T.blue : '#FF453A') : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
              value={pw}
              onChangeText={setPw}
              placeholder="영문·숫자·특수문자 8자 이상"
              placeholderTextColor={T.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            {pw.length > 0 && !valid && (
              <Text style={{ fontSize: 12, color: '#FF453A', marginTop: 6 }}>영문·숫자·특수문자(@$!%*#?&)를 포함해 8자 이상이어야 해요</Text>
            )}
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>비밀번호 확인</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: pw2 ? (match ? T.blue : '#FF453A') : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
              value={pw2}
              onChangeText={setPw2}
              placeholder="한 번 더 입력하세요"
              placeholderTextColor={T.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            {pw2.length > 0 && !match && (
              <Text style={{ fontSize: 12, color: '#FF453A', marginTop: 6 }}>비밀번호가 일치하지 않아요</Text>
            )}
          </View>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: 36 }}>
          <Pressable onPress={handleSubmit} disabled={!canSubmit} style={{ height: 58, borderRadius: 14, backgroundColor: canSubmit ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
            {busy
              ? <ActivityIndicator color="#fff"/>
              : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: canSubmit ? '#fff' : T.muted }}>가입 완료</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

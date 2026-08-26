import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';
import { authStore } from '../../store/authStore';
import { signUp } from '../../api/auth';
import { ApiError } from '../../api/client';

function CheckRow({ ok, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.sm }}>
      <View style={{
        width: 20, height: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
        backgroundColor: ok ? T.okSoft : T.line,
      }}>
        {ok && <Icon.check width={13} height={13} color={T.ok}/>}
      </View>
      <Text style={{ fontSize: T.fs.body, color: ok ? T.ok : T.muted }}>{label}</Text>
    </View>
  );
}

// 백엔드 규칙: 8자 이상 + 영문 + 숫자 + 특수문자(@$!%*#?&)
const HAS_LEN = (pw) => pw.length >= 8;
const HAS_ALNUM = (pw) => /[A-Za-z]/.test(pw) && /\d/.test(pw);
const HAS_SPECIAL = (pw) => /[@$!%*#?&]/.test(pw);
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const ALL_CONSENTS = ['TERMS', 'PRIVACY', 'SMS', 'MEDICAL'].map((consentType) => ({ consentType, agreed: true }));

export default function AuthPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [visible, setVisible] = useState(false);
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
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <StepHeader step={4} total={5}/>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>비밀번호를{'\n'}정해주세요</Text>

          <View style={{
            height: 60, borderRadius: T.radius.md, borderWidth: 2, borderColor: T.blue,
            backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.xxl,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <TextInput
              value={pw}
              onChangeText={setPw}
              placeholder="비밀번호"
              placeholderTextColor={T.muted}
              secureTextEntry={!visible}
              autoCapitalize="none"
              style={{ flex: 1, fontSize: T.fs.h, color: T.ink, letterSpacing: visible ? 0 : 2 }}
            />
            <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.body }}>{visible ? '숨기기' : '보기'}</Text>
            </Pressable>
          </View>

          <View style={{
            height: 60, borderRadius: T.radius.md, borderWidth: 1,
            borderColor: pw2 ? (match ? T.blue : T.danger) : T.line,
            backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.md,
            justifyContent: 'center',
          }}>
            <TextInput
              value={pw2}
              onChangeText={setPw2}
              placeholder="비밀번호 확인"
              placeholderTextColor={T.muted}
              secureTextEntry={!visible}
              autoCapitalize="none"
              style={{ fontSize: T.fs.h, color: T.ink, letterSpacing: visible ? 0 : 2 }}
            />
          </View>
          {pw2.length > 0 && !match && (
            <Text style={{ fontSize: T.fs.caption, color: T.danger, marginTop: T.sp.sm }}>비밀번호가 일치하지 않아요</Text>
          )}

          <View style={{ marginTop: T.sp.xl, gap: T.sp.sm }}>
            <CheckRow ok={HAS_LEN(pw)} label="8자 이상"/>
            <CheckRow ok={HAS_ALNUM(pw)} label="영문과 숫자 포함"/>
            <CheckRow ok={HAS_SPECIAL(pw)} label="특수문자 포함 (@$!%*#?&)"/>
          </View>
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Button onPress={handleSubmit} disabled={!valid || !match} loading={busy}>가입 완료</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

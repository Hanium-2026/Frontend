import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';
import FormField from '../../components/FormField';
import { confirmPasswordReset, requestPasswordReset, verifySms } from '../../api/auth';
import { ApiError } from '../../api/client';

const PHONE_RE = /^01[016789]\d{7,8}$/;
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const STEP_NUM = { phone: 1, code: 2, password: 3 };

// "OO 확인됨" 칩 — code·password 단계에서 동일하게 반복돼 여기서만 묶었다(다른 화면엔 없는 패턴).
function ConfirmedChip({ text }) {
  return (
    <View style={{
      backgroundColor: T.line, borderRadius: T.radius.md, padding: T.sp.lg,
      flexDirection: 'row', alignItems: 'center', gap: T.sp.md,
    }}>
      <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: T.okSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon.check width={14} height={14} color={T.ok}/>
      </View>
      <Text style={{ fontSize: T.fs.body, color: T.body }}>{text} 확인됨</Text>
    </View>
  );
}

export default function AuthPasswordReset() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '처리 중 문제가 발생했어요.';
      Alert.alert('확인 필요', msg);
    } finally {
      setBusy(false);
    }
  };

  const send = () => run(async () => {
    if (!PHONE_RE.test(phone)) {
      Alert.alert('전화번호 확인', '휴대폰 번호를 정확히 입력해주세요.');
      return;
    }
    await requestPasswordReset(phone);
    setStep('code');
  });

  const verify = () => run(async () => {
    if (code.length !== 6) {
      Alert.alert('인증번호 확인', '6자리 인증번호를 입력해주세요.');
      return;
    }
    await verifySms(phone, code, 'PASSWORD_RESET');
    setStep('password');
  });

  const save = () => run(async () => {
    if (!PW_RE.test(password)) {
      Alert.alert('비밀번호 확인', '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.');
      return;
    }
    await confirmPasswordReset(phone, password);
    Alert.alert('변경 완료', '새 비밀번호로 로그인해주세요.', [
      { text: '확인', onPress: () => router.replace('/(auth)/login') },
    ]);
  });

  const title = step === 'phone' ? '비밀번호를\n재설정할게요'
    : step === 'code' ? '인증번호를\n입력해주세요'
    : '새 비밀번호를\n정해주세요';
  const submit = step === 'phone' ? send : step === 'code' ? verify : save;
  const label = step === 'phone' ? '인증번호 받기' : step === 'code' ? '인증하기' : '비밀번호 바꾸기';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <StepHeader step={STEP_NUM[step]} total={3}/>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>{title}</Text>

          {step === 'phone' && (
            <FormField
              style={{ marginTop: T.sp.xxl }}
              label="전화번호"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
              placeholder="01012345678"
              keyboardType="number-pad"
              maxLength={11}
            />
          )}

          {step === 'code' && (
            <View style={{ marginTop: T.sp.xxl }}>
              <ConfirmedChip text={phone}/>

              <FormField
                style={{ marginTop: T.sp.xl }}
                label="인증번호"
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button variant="text" onPress={send} disabled={busy} style={{ marginTop: T.sp.md, alignSelf: 'center' }}>
                인증번호 다시 받기
              </Button>
            </View>
          )}

          {step === 'password' && (
            <View style={{ marginTop: T.sp.xxl }}>
              <ConfirmedChip text={phone}/>

              <FormField
                style={{ marginTop: T.sp.xl }}
                label="새 비밀번호"
                value={password}
                onChangeText={setPassword}
                placeholder="영문/숫자/특수문자 포함 8자 이상"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          )}
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Button onPress={submit} loading={busy}>{label}</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

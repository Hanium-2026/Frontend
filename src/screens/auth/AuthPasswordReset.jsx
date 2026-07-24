import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import { confirmPasswordReset, requestPasswordReset, verifySms } from '../../api/auth';
import { ApiError } from '../../api/client';

const PHONE_RE = /^01[016789]\d{7,8}$/;
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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
    : '새 비밀번호를\n입력해주세요';
  const submit = step === 'phone' ? send : step === 'code' ? verify : save;
  const label = step === 'phone' ? '인증번호 받기' : step === 'code' ? '인증하기' : '비밀번호 변경';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.6 }}>비밀번호 찾기</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>{title}</Text>
          <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
            {step === 'phone' ? '가입한 휴대폰 번호로 인증번호를 보냅니다.' : step === 'code' ? `${phone}으로 보낸 6자리 코드를 확인해주세요.` : '앞으로 사용할 새 비밀번호를 설정해주세요.'}
          </Text>

          <View style={{ marginTop: 32 }}>
            {step === 'phone' && (
              <>
                <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>전화번호</Text>
                <TextInput
                  style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: phone ? T.blue : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder="01012345678"
                  placeholderTextColor={T.muted}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </>
            )}
            {step === 'code' && (
              <>
                <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>인증번호</Text>
                <TextInput
                  style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: code ? T.blue : T.line, fontSize: 24, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: 5, textAlign: 'center' }}
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor={T.line}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Pressable onPress={send} disabled={busy} style={{ marginTop: 14, alignItems: 'center', padding: 8 }}>
                  <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.blue }}>인증번호 다시 받기</Text>
                </Pressable>
              </>
            )}
            {step === 'password' && (
              <>
                <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>새 비밀번호</Text>
                <TextInput
                  style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: password ? T.blue : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="영문/숫자/특수문자 포함 8자 이상"
                  placeholderTextColor={T.muted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </>
            )}
          </View>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
          <Pressable onPress={submit} disabled={busy} style={{ height: 58, borderRadius: 14, backgroundColor: busy ? T.line : T.blue, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>{label}</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

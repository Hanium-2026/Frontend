import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import AppHeader from '../../components/AppHeader';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import { login } from '../../api/auth';
import { ApiError } from '../../api/client';

export default function AuthLogin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSubmit = phone.length >= 10 && pw.length > 0 && !busy;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const { role } = await login(phone, pw);
      router.replace(role === 'GUARDIAN' ? '/(caregiver)/' : '/(elder)/');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '로그인 중 문제가 발생했어요. 다시 시도해주세요.';
      Alert.alert('로그인 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <AppHeader title="로그인" onBack/>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl, gap: T.sp.xl }} keyboardShouldPersistTaps="handled">
          <FormField
            label="전화번호"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
            placeholder="01012345678"
            keyboardType="number-pad"
            maxLength={11}
          />

          <View>
            <FormField
              label="비밀번호"
              value={pw}
              onChangeText={setPw}
              placeholder="비밀번호"
              secureTextEntry={!visible}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
            <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={{ position: 'absolute', right: T.sp.lg, bottom: T.sp.md }}>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.body }}>{visible ? '숨기기' : '보기'}</Text>
            </Pressable>
          </View>

          <Button variant="text" onPress={() => router.push('/(auth)/password-reset')} style={{ alignSelf: 'flex-start' }}>
            비밀번호를 잊으셨나요?
          </Button>
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Button onPress={handleLogin} disabled={phone.length < 10 || pw.length === 0} loading={busy}>로그인</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
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
        <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.lg, paddingBottom: T.sp.md, flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink }}>로그인</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl, gap: T.sp.xl }} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>전화번호</Text>
            <View style={{ height: 60, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.line, backgroundColor: T.surface, paddingHorizontal: T.sp.lg, justifyContent: 'center', marginTop: T.sp.sm }}>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                placeholder="01012345678"
                placeholderTextColor={T.muted}
                keyboardType="number-pad"
                maxLength={11}
                style={{ fontSize: T.fs.h, color: T.ink }}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>비밀번호</Text>
            <View style={{ height: 60, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.line, backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TextInput
                value={pw}
                onChangeText={setPw}
                placeholder="비밀번호"
                placeholderTextColor={T.muted}
                secureTextEntry={!visible}
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
                returnKeyType="go"
                style={{ flex: 1, fontSize: T.fs.h, color: T.ink }}
              />
              <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.body }}>{visible ? '숨기기' : '보기'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => router.push('/(auth)/password-reset')}>
            <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.body, textDecorationLine: 'underline' }}>비밀번호를 잊으셨나요?</Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Pressable onPress={handleLogin} disabled={!canSubmit} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: canSubmit ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: canSubmit ? '#fff' : T.muted }}>로그인</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

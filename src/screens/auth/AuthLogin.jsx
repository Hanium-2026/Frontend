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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.6 }}>로그인</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>다시 오셨네요!{'\n'}로그인해주세요</Text>

          <View style={{ marginTop: 32 }}>
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
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>비밀번호</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 12, padding: 16, borderWidth: 1.5, borderColor: pw ? T.blue : T.line, fontSize: 17, fontFamily: T.fontSemiBold, color: T.ink }}
              value={pw}
              onChangeText={setPw}
              placeholder="비밀번호"
              placeholderTextColor={T.muted}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
          </View>

          <Pressable onPress={() => router.push('/(auth)/password-reset')} style={{ marginTop: 16, alignItems: 'flex-end', paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.blue }}>비밀번호를 잊으셨나요?</Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
          <Pressable onPress={handleLogin} disabled={!canSubmit} style={{ height: 58, borderRadius: 14, backgroundColor: canSubmit ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
            {busy
              ? <ActivityIndicator color="#fff"/>
              : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: canSubmit ? '#fff' : T.muted }}>로그인</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

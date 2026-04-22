import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

type UserType = 'elderly' | 'guardian';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('elderly');
  const canLogin = Boolean(email && password);

  const handleLogin = () => {
    router.push({
      pathname: '/permissions',
      params: { role: userType },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>G</Text>
            </View>
            <Text style={styles.appName}>GaitCare</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>다시 만나 반가워요</Text>
            <Text style={styles.subtitle}>계정에 로그인하고 오늘의 보행 상태를 확인하세요</Text>

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, userType === 'elderly' && styles.typeBtnActive]}
                onPress={() => setUserType('elderly')}
                activeOpacity={0.85}
              >
                <Text style={[styles.typeBtnText, userType === 'elderly' && styles.typeBtnTextActive]}>
                  노인 사용자
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, userType === 'guardian' && styles.typeBtnActive]}
                onPress={() => setUserType('guardian')}
                activeOpacity={0.85}
              >
                <Text style={[styles.typeBtnText, userType === 'guardian' && styles.typeBtnTextActive]}>
                  보호자
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호 입력"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !canLogin && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={!canLogin}
            >
              <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupText}>
                계정이 없으신가요?{'  '}
                <Text style={styles.signupHighlight}>회원가입</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 22, fontWeight: '800', color: colors.surface },
  appName: { fontSize: 20, fontWeight: '700', color: colors.text },
  form: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 27, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 30, lineHeight: 20 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeBtnText: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  typeBtnTextActive: { color: colors.primary },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: { backgroundColor: colors.disabledBg },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.surface },
  signupLink: { marginTop: 18, alignItems: 'center' },
  signupText: { fontSize: 14, color: colors.textSecondary },
  signupHighlight: { color: colors.primary, fontWeight: '600' },
});

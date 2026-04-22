import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

type UserType = 'elderly' | 'guardian' | null;

export default function SignupScreen() {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [userType, setUserType] = useState<UserType>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setStep('form');
  };

  const handleSignup = () => {
    router.push({
      pathname: '/permissions',
      params: { role: userType ?? 'elderly' },
    });
  };

  if (step === 'type') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>어떤 계정으로{'\n'}시작하시겠어요?</Text>

          <View style={styles.typeCards}>
            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleSelectType('elderly')}
              activeOpacity={0.85}
            >
              <View style={[styles.typeIcon, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.typeEmoji}>🧓</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>노인 사용자</Text>
                <Text style={styles.typeDesc}>본인의 보행을 측정하고 관리합니다</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleSelectType('guardian')}
              activeOpacity={0.85}
            >
              <View style={[styles.typeIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.typeEmoji}>👨‍👩‍👧</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>보호자</Text>
                <Text style={styles.typeDesc}>가족의 건강 상태를 모니터링합니다</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('type')}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {userType === 'elderly' ? '노인 사용자' : '보호자'}{'\n'}회원가입
          </Text>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="홍길동"
                placeholderTextColor={colors.textTertiary}
              />
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
                placeholder="8자 이상 입력"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (!name || !email || !password) && styles.buttonDisabled]}
              onPress={handleSignup}
              activeOpacity={0.85}
              disabled={!name || !email || !password}
            >
              <Text style={styles.buttonText}>가입하기</Text>
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
  backBtn: { marginTop: 8, marginBottom: 24, width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.text },
  title: { fontSize: 27, fontWeight: '800', color: colors.text, marginBottom: 28, lineHeight: 36, letterSpacing: -0.6 },
  typeCards: { gap: 12, marginTop: 8 },
  typeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeEmoji: { fontSize: 24 },
  typeInfo: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  typeDesc: { fontSize: 13, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textTertiary },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
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
});

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

export default function ConnectScreen() {
  const [code, setCode] = useState('');

  const handleConnect = () => {
    router.replace('/guardian/main');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.topCard}>
          <Text style={styles.topEmoji}>🔗</Text>
          <Text style={styles.title}>노인 사용자와{'\n'}연결하기</Text>
          <Text style={styles.subtitle}>노인 사용자의 초대 코드를 입력하세요</Text>
        </View>

        <Text style={styles.label}>초대 코드</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="ex) GCAB12"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="characters"
          maxLength={8}
        />

        <TouchableOpacity
          style={[styles.button, !code && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={!code}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, !code && styles.buttonTextDisabled]}>연결하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { marginTop: 8, marginBottom: 8, width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.text },
  topCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  topEmoji: { fontSize: 48, marginBottom: 14 },
  title: { fontSize: 25, fontWeight: '800', color: colors.text, textAlign: 'center', lineHeight: 34, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 20,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.inputBg },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.surface },
  buttonTextDisabled: { color: colors.textTertiary },
});

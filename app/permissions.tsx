import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

type PermKeys = 'motion' | 'location' | 'notification';

const PERMS: { key: PermKeys; emoji: string; title: string; desc: string; bg: string }[] = [
  { key: 'motion', emoji: '📱', title: '모션 센서', desc: '가속도계와 자이로스코프로 보행 패턴을 측정합니다', bg: colors.primaryLight },
  { key: 'location', emoji: '📍', title: '위치 정보', desc: '실내/실외 환경을 파악하여 더 정확한 분석을 제공합니다', bg: colors.successLight },
  { key: 'notification', emoji: '🔔', title: '알림', desc: '중요한 건강 정보와 측정 알림을 받습니다', bg: colors.warningLight },
];

export default function PermissionsScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [permissions, setPermissions] = useState<Record<PermKeys, boolean>>({
    motion: false,
    location: false,
    notification: false,
  });

  const grant = (key: PermKeys) =>
    setPermissions((prev) => ({ ...prev, [key]: true }));

  const allGranted = Object.values(permissions).every(Boolean);

  const handleContinue = () => {
    const nextRoute = role === 'elderly' ? '/elderly/main' : '/guardian/main';
    router.replace(nextRoute);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>앱 사용에 필요한{'\n'}권한을 허용해주세요</Text>
          <Text style={styles.subtitle}>정확한 보행 측정을 위해 아래 권한이 필요합니다</Text>
        </View>

        <View style={styles.cards}>
          {PERMS.map((p) => (
            <View key={p.key} style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: p.bg }]}>
                <Text style={styles.emoji}>{p.emoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardDesc}>{p.desc}</Text>
              </View>
              {permissions[p.key] ? (
                <View style={styles.grantedBadge}>
                  <Text style={styles.grantedText}>허용됨</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.grantBtn}
                  onPress={() => grant(p.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.grantBtnText}>허용</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.button, !allGranted && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!allGranted}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, !allGranted && styles.buttonTextDisabled]}>
              계속하기
            </Text>
          </TouchableOpacity>
          {!allGranted && (
            <Text style={styles.hint}>모든 권한을 허용해야 계속할 수 있습니다</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 30, paddingBottom: 24 },
  title: { fontSize: 27, fontWeight: '800', color: colors.text, lineHeight: 36, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  cards: { gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  grantedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  grantedText: { fontSize: 12, fontWeight: '600', color: colors.success },
  grantBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  grantBtnText: { fontSize: 13, fontWeight: '600', color: colors.surface },
  bottom: { marginTop: 'auto', paddingBottom: 24, paddingTop: 24 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.inputBg },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.surface },
  buttonTextDisabled: { color: colors.textTertiary },
  hint: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginTop: 12 },
});

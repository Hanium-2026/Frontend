import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const result = {
  status: 'normal',
  score: 92,
  metrics: { stability: 94, balance: 89, symmetry: 93 },
};

const METRICS = [
  { key: 'stability', label: '보행 안정성', color: colors.primary },
  { key: 'balance', label: '좌우 균형', color: colors.success },
  { key: 'symmetry', label: '보행 대칭성', color: '#6B7AE0' },
] as const;

export default function ResultScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/elderly/main')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>정상</Text>
          </View>
          <Text style={styles.scoreNum}>{result.score}</Text>
          <Text style={styles.scoreLabel}>점</Text>
          <Text style={styles.scoreDesc}>안정적인 보행 상태입니다</Text>
          <Text style={styles.scoreDate}>
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상세 분석</Text>
          <View style={styles.card}>
            {METRICS.map((m, i) => (
              <View key={m.key} style={[styles.metricRow, i < METRICS.length - 1 && styles.metricBorder]}>
                <View style={styles.metricLeft}>
                  <View style={[styles.metricDot, { backgroundColor: m.color }]} />
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </View>
                <Text style={[styles.metricValue, { color: m.color }]}>{result.metrics[m.key]}점</Text>
              </View>
            ))}
            {METRICS.map((m, i) => (
              <View key={`bar-${m.key}`} style={[styles.barRow, i < METRICS.length - 1 && { marginBottom: 14 }]}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${result.metrics[m.key]}%`, backgroundColor: m.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>건강 팁</Text>
            <Text style={styles.tipText}>
              현재 보행 상태가 매우 양호합니다. 규칙적인 산책과 가벼운 운동을 계속 유지하시면 건강한 보행 상태를 오래 유지하실 수 있습니다.
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace('/elderly/prep')}
            activeOpacity={0.85}
          >
            <Text style={styles.retryBtnText}>다시 측정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace('/elderly/main')}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.text },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },

  content: { paddingHorizontal: 20, paddingBottom: 40 },

  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 36,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 20,
  },
  scoreBadgeText: { fontSize: 14, fontWeight: '700', color: colors.success },
  scoreNum: { fontSize: 72, fontWeight: '900', color: colors.text, lineHeight: 80, letterSpacing: -1 },
  scoreLabel: { fontSize: 20, fontWeight: '500', color: colors.textSecondary, marginBottom: 12 },
  scoreDesc: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
  scoreDate: { fontSize: 13, color: colors.textTertiary },

  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  metricLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricDot: { width: 10, height: 10, borderRadius: 5 },
  metricLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },
  metricValue: { fontSize: 16, fontWeight: '700' },
  barRow: { marginTop: 6 },
  barTrack: { height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipBody: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  tipText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  buttons: { flexDirection: 'row', gap: 12 },
  retryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  retryBtnText: { fontSize: 15, fontWeight: '700', color: colors.surface },
  doneBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },
});

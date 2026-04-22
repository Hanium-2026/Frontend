import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const recentResults = [
  { date: '2026-04-03', score: 92, status: 'normal' },
  { date: '2026-04-02', score: 89, status: 'normal' },
  { date: '2026-04-01', score: 91, status: 'normal' },
];

export default function ElderlyMainScreen() {
  const latestScore = recentResults[0]?.score ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Text style={styles.greetingSub}>오늘의 보행 상태를 확인해볼까요?</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.85}>
            <Text style={styles.bellIcon}>알림</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/elderly/prep')}
          activeOpacity={0.9}
        >
          <View>
            <Text style={styles.ctaLabel}>오늘의 측정</Text>
            <Text style={styles.ctaTitle}>보행 측정 시작</Text>
            <View style={styles.ctaChip}>
              <Text style={styles.ctaChipText}>지금 시작하기</Text>
            </View>
          </View>
          <View style={styles.ctaScoreBox}>
            <Text style={styles.ctaScoreLabel}>최근 점수</Text>
            <Text style={styles.ctaScoreValue}>{latestScore}점</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.sectionLabel}>오늘의 상태</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <View>
              <Text style={styles.statusValue}>정상</Text>
              <Text style={styles.statusDesc}>안정적인 보행입니다</Text>
            </View>
            <Text style={styles.statusScore}>92점</Text>
          </View>
        </View>

        {/* Recent Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 측정 결과</Text>
          <View style={styles.card}>
            {recentResults.map((r, i) => (
              <View key={i} style={[styles.resultRow, i < recentResults.length - 1 && styles.resultRowBorder]}>
                <View style={styles.resultDot} />
                <Text style={styles.resultDate}>
                  {new Date(r.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </Text>
                <View style={styles.resultScoreBadge}>
                  <Text style={styles.resultScore}>{r.score}점</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/elderly/result')} activeOpacity={0.85}>
            <Text style={styles.quickTag}>기록</Text>
            <Text style={styles.quickLabel}>전체 기록</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/mypage')} activeOpacity={0.85}>
            <Text style={styles.quickTag}>설정</Text>
            <Text style={styles.quickLabel}>설정</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  greetingSub: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  bellBtn: {
    minWidth: 64,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  bellIcon: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: colors.danger, borderRadius: 4 },

  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, fontWeight: '600', letterSpacing: 0.3 },
  ctaTitle: { fontSize: 28, fontWeight: '800', color: colors.text, lineHeight: 34, marginBottom: 14, letterSpacing: -0.8 },
  ctaChip: { backgroundColor: colors.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: 'flex-start' },
  ctaChipText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  ctaScoreBox: { alignItems: 'flex-end', gap: 4 },
  ctaScoreLabel: { fontSize: 12, color: colors.textTertiary, fontWeight: '600' },
  ctaScoreValue: { fontSize: 20, color: colors.primary, fontWeight: '800' },

  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginBottom: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 14, height: 14, backgroundColor: colors.success, borderRadius: 7 },
  statusValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statusDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusScore: { marginLeft: 'auto', fontSize: 22, fontWeight: '800', color: colors.primary },

  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  resultRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  resultDot: { width: 8, height: 8, backgroundColor: colors.success, borderRadius: 4 },
  resultDate: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  resultScoreBadge: { backgroundColor: colors.successLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  resultScore: { fontSize: 13, fontWeight: '700', color: colors.success },

  quickActions: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickTag: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },
  quickLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
});

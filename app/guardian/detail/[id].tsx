import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../constants/colors';

const weeklyData = [
  { date: '3/28', score: 89 }, { date: '3/29', score: 91 }, { date: '3/30', score: 88 },
  { date: '3/31', score: 90 }, { date: '4/1', score: 92 }, { date: '4/2', score: 91 }, { date: '4/3', score: 92 },
];

const recentMeasurements = [
  { date: '2026년 4월 3일 오전 10:30', score: 92, stability: 94, balance: 90, symmetry: 92 },
  { date: '2026년 4월 2일 오후 3:20', score: 91, stability: 93, balance: 89, symmetry: 91 },
  { date: '2026년 4월 1일 오전 9:15', score: 92, stability: 94, balance: 90, symmetry: 92 },
];

const maxScore = Math.max(...weeklyData.map((d) => d.score));
const minScore = 80;

export default function GuardianDetailScreen() {
  const { id } = useLocalSearchParams();
  const userName = id === '2' ? '김영희' : id === '3' ? '이철수' : '홍길동';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상세 정보</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{userName[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileAge}>75세</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeNum}>92</Text>
            <Text style={styles.scoreBadgeLabel}>점</Text>
          </View>
        </View>

        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.chipText, { color: colors.success }]}>정상</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>최근 7일 안정</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주간 보행 점수 추이</Text>
          <View style={styles.card}>
            <View style={styles.chartArea}>
              {weeklyData.map((d, i) => {
                const pct = (d.score - minScore) / (maxScore - minScore + 2);
                return (
                  <View key={i} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      <View style={[styles.chartBar, { height: `${pct * 100}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={styles.chartDate}>{d.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 측정 기록</Text>
          <View style={styles.card}>
            {recentMeasurements.map((m, i) => (
              <View key={i} style={[styles.measureRow, i < recentMeasurements.length - 1 && styles.measureBorder]}>
                <View style={styles.measureTop}>
                  <View>
                    <Text style={styles.measureDate}>{m.date}</Text>
                    <View style={styles.normalChip}>
                      <Text style={styles.normalChipText}>정상</Text>
                    </View>
                  </View>
                  <Text style={styles.measureScore}>{m.score}점</Text>
                </View>
                <View style={styles.measureMetrics}>
                  {[['안정성', m.stability], ['균형', m.balance], ['대칭성', m.symmetry]].map(([label, val]) => (
                    <View key={label as string} style={styles.metricBox}>
                      <Text style={styles.metricLabel}>{label}</Text>
                      <Text style={styles.metricVal}>{val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertBody}>
            <Text style={styles.alertTitle}>알림 설정</Text>
            <Text style={styles.alertDesc}>보행 점수가 80점 이하로 떨어지거나 주의 상태가 되면 알림을 받습니다.</Text>
            <TouchableOpacity>
              <Text style={styles.alertLink}>알림 설정 변경</Text>
            </TouchableOpacity>
          </View>
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

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    backgroundColor: colors.primaryLight,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.text },
  profileAge: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  scoreBadge: { alignItems: 'center' },
  scoreBadgeNum: { fontSize: 32, fontWeight: '900', color: colors.primary },
  scoreBadgeLabel: { fontSize: 13, color: colors.textSecondary },

  chips: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  chipText: { fontSize: 13, fontWeight: '600' },

  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  chartCol: { flex: 1, alignItems: 'center', gap: 6 },
  chartBarWrap: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  chartBar: { width: '100%', borderRadius: 6, minHeight: 6 },
  chartDate: { fontSize: 10, color: colors.textTertiary },

  measureRow: { paddingVertical: 16 },
  measureBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  measureTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  measureDate: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  normalChip: { backgroundColor: colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  normalChipText: { fontSize: 12, fontWeight: '600', color: colors.success },
  measureScore: { fontSize: 24, fontWeight: '800', color: colors.text },
  measureMetrics: { flexDirection: 'row', gap: 8 },
  metricBox: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 10, padding: 10, alignItems: 'center' },
  metricLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  metricVal: { fontSize: 16, fontWeight: '700', color: colors.primary },

  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  alertDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  alertLink: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const users = [
  { id: '1', name: '홍길동', age: 75, status: 'normal', score: 92, ago: '1시간 전' },
  { id: '2', name: '김영희', age: 72, status: 'warning', score: 78, ago: '어제' },
  { id: '3', name: '이철수', age: 68, status: 'normal', score: 88, ago: '3시간 전' },
];

const statusMap = {
  normal: { label: '정상', color: colors.success, bg: colors.successLight, emoji: '✅' },
  warning: { label: '주의', color: colors.warning, bg: colors.warningLight, emoji: '⚠️' },
  danger: { label: '위험', color: colors.danger, bg: colors.dangerLight, emoji: '🚨' },
};

export default function GuardianMainScreen() {
  const warningCount = users.filter((u) => u.status !== 'normal').length;
  const normalCount = users.filter((u) => u.status === 'normal').length;
  const avgScore = Math.round(users.reduce((acc, user) => acc + user.score, 0) / users.length);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>보호자 대시보드</Text>
            <Text style={styles.subtitle}>연결된 가족의 상태를 확인하세요</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.85}>
            <Text style={styles.bellIcon}>알림</Text>
            {warningCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{warningCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>현재 평균 보행 점수</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryScore}>{avgScore}</Text>
            <Text style={styles.summaryUnit}>점</Text>
          </View>
          <Text style={styles.summaryHint}>최근 측정 기준으로 자동 업데이트됩니다</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{users.length}</Text>
            <Text style={styles.statLabel}>전체 사용자</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.success }]}>{normalCount}</Text>
            <Text style={styles.statLabel}>정상</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: colors.warning }]}>{warningCount}</Text>
            <Text style={styles.statLabel}>주의</Text>
          </View>
        </View>

        {/* User List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>연결된 사용자</Text>
            <TouchableOpacity onPress={() => router.push('/connect')}>
              <Text style={styles.addBtn}>+ 추가</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userList}>
            {users.map((user, i) => {
              const s = statusMap[user.status as keyof typeof statusMap] ?? statusMap.normal;
              return (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userCard, i < users.length - 1 && styles.userCardBorder]}
                  onPress={() => router.push(`/guardian/detail/${user.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.avatar, { backgroundColor: s.bg }]}>
                    <Text style={[styles.avatarText, { color: s.color }]}>{user.name[0]}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userAge}>{user.age}세</Text>
                    </View>
                    <Text style={styles.userTime}>{user.ago}</Text>
                  </View>
                  <View style={styles.userRight}>
                    <View style={[styles.statusChip, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.userScore}>
                      {user.score}점
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>홈</Text>
          <Text style={styles.navLabelActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mypage')}>
          <Text style={styles.navIcon}>설정</Text>
          <Text style={styles.navLabel}>설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
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
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    backgroundColor: colors.danger,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: { fontSize: 10, fontWeight: '700', color: colors.surface },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  summaryScore: { fontSize: 42, lineHeight: 48, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  summaryUnit: { fontSize: 18, color: colors.textSecondary, marginBottom: 6 },
  summaryHint: { fontSize: 13, color: colors.textTertiary, marginTop: 8 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  section: { marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  addBtn: { fontSize: 14, color: colors.primary, fontWeight: '600' },

  userList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  userCardBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userAge: { fontSize: 13, color: colors.textSecondary },
  userTime: { fontSize: 12, color: colors.textTertiary },
  userRight: { alignItems: 'flex-end', gap: 6 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  userScore: { fontSize: 16, fontWeight: '800', color: colors.text },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 12, color: colors.textTertiary, fontWeight: '700' },
  navIconActive: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  navLabel: { fontSize: 11, color: colors.textTertiary, fontWeight: '600' },
  navLabelActive: { fontSize: 11, color: colors.primary, fontWeight: '700' },
});

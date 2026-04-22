import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

const notifications = [
  { id: '1', type: 'warning', title: '보행 점수 감소', message: '김영희님의 보행 점수가 78점으로 낮아졌습니다. 확인이 필요합니다.', time: '14분 전', read: false },
  { id: '2', type: 'success', title: '측정 완료', message: '오늘의 보행 측정이 완료되었습니다. 점수: 92점', time: '4시간 전', read: false },
  { id: '3', type: 'info', title: '정기 측정 알림', message: '오늘 보행 측정을 진행해주세요.', time: '오전 9:00', read: true },
  { id: '4', type: 'success', title: '연결 완료', message: '김영희님과 성공적으로 연결되었습니다.', time: '어제', read: true },
];

const typeConfig = {
  warning: { label: '주의', bg: colors.warningLight, color: colors.warning },
  success: { label: '완료', bg: colors.successLight, color: colors.success },
  info: { label: '안내', bg: colors.primaryLight, color: colors.primary },
};

export default function NotificationsScreen() {
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity style={styles.markBtn} activeOpacity={0.85}>
          <Text style={styles.markBtnText}>전체 읽음</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unread.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>새 알림 {unread.length}</Text>
            <View style={styles.card}>
              {unread.map((n, i) => {
                const cfg = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.info;
                return (
                  <View key={n.id} style={[styles.notifRow, i < unread.length - 1 && styles.notifBorder]}>
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.notifTypeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <View style={styles.notifBody}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifMsg}>{n.message}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                    <View style={styles.unreadDot} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {read.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>이전 알림</Text>
            <View style={styles.card}>
              {read.map((n, i) => {
                const cfg = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.info;
                return (
                  <View key={n.id} style={[styles.notifRow, { opacity: 0.55 }, i < read.length - 1 && styles.notifBorder]}>
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.notifTypeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <View style={styles.notifBody}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifMsg}>{n.message}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        )}
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
  markBtn: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markBtnText: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },

  content: { paddingHorizontal: 20, paddingBottom: 40 },
  group: { marginTop: 20 },
  groupLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  notifBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  notifIcon: {
    minWidth: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: 8,
  },
  notifTypeText: { fontSize: 12, fontWeight: '700' },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  notifMsg: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 6 },
  notifTime: { fontSize: 12, color: colors.textTertiary },
  unreadDot: { width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 4, marginTop: 6, flexShrink: 0 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});

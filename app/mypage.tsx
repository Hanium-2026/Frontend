import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

const MENU_SECTIONS = [
  {
    title: '계정',
    items: [
      { emoji: '👤', label: '개인정보 수정' },
      { emoji: '📧', label: '이메일 변경' },
    ],
  },
  {
    title: '알림',
    items: [
      { emoji: '🔔', label: '알림 설정' },
      { emoji: '⏰', label: '측정 리마인더', right: '매일 오전 9시' },
    ],
  },
  {
    title: '보안',
    items: [
      { emoji: '🔒', label: '비밀번호 변경' },
    ],
  },
  {
    title: '지원',
    items: [
      { emoji: '❓', label: '도움말' },
      { emoji: '💬', label: '문의하기' },
    ],
  },
];

export default function MyPageScreen() {
  const [showCode, setShowCode] = useState(false);
  const inviteCode = 'GC' + 'AB12CD';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>홍</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>홍길동</Text>
            <Text style={styles.profileEmail}>example@email.com</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>노인 사용자</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowCode(!showCode)} activeOpacity={0.85}>
          <View style={styles.inviteInfo}>
            <Text style={styles.inviteLabel}>보호자 초대</Text>
            <Text style={styles.inviteDesc}>초대 코드 생성</Text>
          </View>
          <Text style={styles.chevron}>{showCode ? '접기' : '열기'}</Text>
        </TouchableOpacity>

        {showCode && (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>초대 코드</Text>
            <View style={styles.codeRow}>
              <Text style={styles.code}>{inviteCode}</Text>
              <TouchableOpacity style={styles.copyBtn}>
                <Text style={styles.copyText}>복사</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.codeHint}>이 코드를 보호자에게 알려주세요</Text>
          </View>
        )}

        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {item.right && <Text style={styles.menuRightText}>{item.right}</Text>}
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>앱 버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>개인정보처리방침</Text>
            <Text style={styles.infoLink}>보기</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
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
    width: 60,
    height: 60,
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 3 },
  profileEmail: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  typeBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  inviteBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteInfo: { flex: 1 },
  inviteLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  inviteDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },

  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 8, fontWeight: '600' },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  code: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: 1.5 },
  copyBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  copyText: { fontSize: 13, fontWeight: '600', color: colors.surface },
  codeHint: { fontSize: 12, color: colors.textSecondary },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  menuCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 15, color: colors.text },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuRightText: { fontSize: 13, color: colors.textSecondary },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 15, color: colors.text },
  infoValue: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  infoLink: { fontSize: 15, color: colors.primary, fontWeight: '600' },

  logoutBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.danger },
});

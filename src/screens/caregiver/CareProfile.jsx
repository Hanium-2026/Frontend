import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMe, updateMe, deleteAccount } from '../../api/user';
import { logout } from '../../api/auth';
import { ApiError } from '../../api/client';
import { tokenStore } from '../../store/tokenStore';

const CARE_TABS = [
  { label: '대시보드', path: '/(caregiver)/' },
  { label: '알림', path: '/(caregiver)/alerts' },
  { label: '위치', path: '/(caregiver)/location' },
  { label: '내정보', path: '/(caregiver)/profile' },
];

const MENU_ITEMS = [
  ['연결된 어르신 관리', '/(caregiver)/'],
  ['서버 설정', '/server-config'],
];

function fmtPhone(p) {
  if (!p) return '';
  if (p.length === 11) return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  return p;
}

export default function CareProfile() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null));
  }, []);

  const openEdit = () => { setDraft(me?.name || ''); setEditing(true); };

  const handleSaveName = async () => {
    const next = draft.trim();
    if (!next || saving) return;
    setSaving(true);
    try {
      const updated = await updateMe(next);
      setMe(updated ?? { ...me, name: next });
      setEditing(false);
    } catch (e) {
      Alert.alert('저장 실패', e instanceof ApiError ? e.message : '이름을 저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  const name = me?.name || '보호자';
  const phone = fmtPhone(me?.phone);

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/');
      } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('회원 탈퇴', '계정을 탈퇴하면 다시 복구할 수 없어요. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴', style: 'destructive', onPress: async () => {
        try {
          await deleteAccount();
        } finally {
          await tokenStore.clear();
          router.replace('/(auth)/');
        }
      } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="내 정보"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, gap: T.sp.lg }}>
          <Card pad={T.sp.xl} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
            <Avatar name={name} size={56} tone={[T.blueSoft, T.blueDark]}/>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{name}</Text>
              <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: 2 }}>{phone}</Text>
            </View>
            <Pressable onPress={openEdit} hitSlop={8}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>수정</Text>
            </Pressable>
          </Card>

          <Card pad={0}>
            {MENU_ITEMS.map(([label, path], i) => (
              <Pressable key={label} onPress={() => router.push(path)} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                minHeight: 56, paddingHorizontal: T.sp.xl,
                borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0, borderBottomColor: T.line,
              }}>
                <Text style={{ fontSize: T.fs.body, color: T.ink }}>{label}</Text>
                <Text style={{ fontSize: T.fs.body, color: T.muted }}>→</Text>
              </Pressable>
            ))}
            <Pressable onPress={handleLogout} style={{ minHeight: 56, paddingHorizontal: T.sp.xl, justifyContent: 'center', borderTopWidth: 1, borderTopColor: T.line }}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>로그아웃</Text>
            </Pressable>
          </Card>

          <Pressable onPress={handleDeleteAccount} style={{ alignItems: 'center', paddingVertical: T.sp.sm }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, textDecorationLine: 'underline' }}>회원 탈퇴</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={3}/>

      {/* 이름 수정 — GUARDIAN은 확정 디자인에 별도 수정 화면이 없어 모달로 처리한다 */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: T.sp.xl }}>
          <View style={{ backgroundColor: T.surface, borderRadius: 20, padding: T.sp.xl }}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>이름 수정</Text>
            <TextInput
              style={{ marginTop: T.sp.md, backgroundColor: T.bg, borderRadius: T.radius.md, paddingHorizontal: T.sp.md, paddingVertical: T.sp.md, fontSize: T.fs.body, color: T.ink, borderWidth: 1, borderColor: T.line }}
              value={draft}
              onChangeText={setDraft}
              placeholder="이름"
              placeholderTextColor={T.muted}
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: T.sp.sm, marginTop: T.sp.lg }}>
              <Pressable onPress={() => setEditing(false)} style={{ flex: 1, paddingVertical: T.sp.md, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.line, alignItems: 'center' }}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.body }}>취소</Text>
              </Pressable>
              <Pressable onPress={handleSaveName} disabled={!draft.trim() || saving} style={{ flex: 1, paddingVertical: T.sp.md, borderRadius: T.radius.md, backgroundColor: draft.trim() ? T.blue : T.line, alignItems: 'center' }}>
                {saving ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>저장</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

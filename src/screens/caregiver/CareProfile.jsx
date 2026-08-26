import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, Modal } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import ListRow from '../../components/ListRow';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
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

          <Card pad={0} style={{ paddingHorizontal: T.sp.xl }}>
            {MENU_ITEMS.map(([label, path]) => (
              <ListRow key={label} label={label} value="→" onPress={() => router.push(path)}/>
            ))}
            <ListRow label="로그아웃" value="" onPress={handleLogout} last/>
          </Card>

          <Button variant="text" onPress={handleDeleteAccount} style={{ alignSelf: 'center' }}>회원 탈퇴</Button>
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={3}/>

      {/* 이름 수정 — GUARDIAN은 확정 디자인에 별도 수정 화면이 없어 모달로 처리한다 */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: T.sp.xl }}>
          <View style={{ backgroundColor: T.surface, borderRadius: 20, padding: T.sp.xl }}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>이름 수정</Text>
            <FormField
              style={{ marginTop: T.sp.md }}
              value={draft}
              onChangeText={setDraft}
              placeholder="이름"
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: T.sp.sm, marginTop: T.sp.lg }}>
              <Button variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }}>취소</Button>
              <Button onPress={handleSaveName} disabled={!draft.trim()} loading={saving} style={{ flex: 1 }}>저장</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

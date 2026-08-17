import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMe, updateMe, deleteAccount } from '../../api/user';
import { logout } from '../../api/auth';
import { ApiError } from '../../api/client';
import { tokenStore } from '../../store/tokenStore';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'user',     label: '내정보',  path: '/(caregiver)/profile' },
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
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('회원 탈퇴', '계정을 탈퇴하면 다시 복구할 수 없어요. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
          } finally {
            await tokenStore.clear();
            router.replace('/(auth)/');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader
        title="내 정보"
        onBack
        right={
          <Pressable onPress={openEdit} style={{ paddingHorizontal: 14, height: 36, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.blueDark }}>수정</Text>
          </Pressable>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={18} style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={name} size={62} tone={[T.blueSoft, T.blueDark]} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{name}</Text>
              <Text style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>보호자{phone ? ` · ${phone}` : ''}</Text>
            </View>
          </Card>

          <Pressable
            onPress={() => router.push('/server-config')}
            style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line }}
          >
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF0F4', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.settings width={18} height={18} color={T.muted}/>
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}>서버 설정</Text>
            <Icon.chevron width={14} height={14} color={T.muted}/>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={{ marginTop: 12, paddingVertical: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.danger }}>로그아웃</Text>
          </Pressable>

          <Pressable onPress={handleDeleteAccount} style={{ marginTop: 10, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>
              회원 탈퇴
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={3}/>

      {/* 이름 수정 — 보호자는 수정할 항목이 이름뿐이라 별도 화면 대신 모달 */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: T.ink }}>이름 수정</Text>
            <TextInput
              style={{ marginTop: 14, backgroundColor: T.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontFamily: T.fontSemiBold, color: T.ink, borderWidth: 1, borderColor: T.line }}
              value={draft}
              onChangeText={setDraft}
              placeholder="이름"
              placeholderTextColor={T.muted}
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <Pressable onPress={() => setEditing(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: T.line, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.body }}>취소</Text>
              </Pressable>
              <Pressable onPress={handleSaveName} disabled={!draft.trim() || saving} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: draft.trim() ? T.blue : T.line, alignItems: 'center' }}>
                {saving ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: '#fff' }}>저장</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

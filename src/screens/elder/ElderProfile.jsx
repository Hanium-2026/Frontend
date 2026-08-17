import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { deleteAccount, getMe } from '../../api/user';
import { getPhysicalInfo } from '../../api/ward';
import { logout } from '../../api/auth';
import { tokenStore } from '../../store/tokenStore';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure-intro' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const etcItems = [
  ['settings', '앱 설정',       '/(elder)/app-settings'],
  ['shield',   '개인정보 보호',  '/(elder)/privacy'],
  ['doc',      '이용 가이드',    '/(elder)/guide'],
];

const CURRENT_YEAR = new Date().getFullYear();

export default function ElderProfile() {
  const router = useRouter();
  const [me, setMe] = useState(null);     // { id, phone, name, role }
  const [ward, setWard] = useState(null); // { height, weight, birthDate, gender }

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null));
    getPhysicalInfo().then(setWard).catch(() => setWard(null));
  }, []);

  const name = me?.name || '사용자';
  const sub = ward ? [
    ward.gender === 'MALE' ? '남' : '여',
    ward.birthDate ? `${CURRENT_YEAR - new Date(ward.birthDate).getFullYear()}세` : null,
    ward.height ? `${Math.round(ward.height)}cm` : null,
    ward.weight ? `${Math.round(ward.weight)}kg` : null,
  ].filter(Boolean).join(' · ') : (me?.phone || '');

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
      <AppHeader
        title="내 정보"
        right={
          <Pressable onPress={() => router.push('/(elder)/profile-edit')} style={{ paddingHorizontal: 16, height: 40, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontBold, color: T.blueDark }}>수정</Text>
          </Pressable>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={18} style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={name} size={62}/>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{name}</Text>
              <Text style={{ fontSize: T.fs.label, color: T.body, marginTop: 3 }}>{sub}</Text>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionLabel>기타</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {etcItems.map(([i, t, path], k) => {
              const I = Icon[i];
              return (
                <Pressable key={k} onPress={() => router.push(path)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: k < etcItems.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF0F4', alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.muted}/>
                  </View>
                  <Text style={{ flex: 1, fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{t}</Text>
                  <Icon.chevron width={14} height={14} color={T.muted}/>
                </Pressable>
              );
            })}
          </Card>

          <Pressable onPress={() => router.push('/server-config')} style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF0F4', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.settings width={18} height={18} color={T.muted}/>
            </View>
            <Text style={{ flex: 1, fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>서버 설정</Text>
            <Icon.chevron width={14} height={14} color={T.muted}/>
          </Pressable>

          <Pressable onPress={handleLogout} style={{ marginTop: 12, paddingVertical: 18, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center' }}>
            <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.danger }}>로그아웃</Text>
          </Pressable>
          <Pressable onPress={handleDeleteAccount} style={{ marginTop: 10, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>회원 탈퇴</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={4}/>
    </View>
  );
}

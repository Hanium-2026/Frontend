import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { deleteAccount, getMe } from '../../api/user';
import { getPhysicalInfo } from '../../api/ward';
import { logout } from '../../api/auth';
import { tokenStore } from '../../store/tokenStore';

const ELDER_TABS = [
  { label: '홈', path: '/(elder)/' },
  { label: '기록', path: '/(elder)/history' },
  { label: '보호자', path: '/(elder)/caregiver' },
  { label: '내정보', path: '/(elder)/profile' },
];

const MENU_ITEMS = [
  ['앱 설정', '/(elder)/app-settings'],
  ['이용 가이드', '/(elder)/guide'],
  ['개인정보 보호', '/(elder)/privacy'],
  ['서버 설정', '/server-config'],
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

  const infoRows = [
    ['성별', ward?.gender === 'MALE' ? '남성' : ward?.gender === 'FEMALE' ? '여성' : '--'],
    ['나이', ward?.birthDate ? `${CURRENT_YEAR - new Date(ward.birthDate).getFullYear()}세` : '--'],
    ['키', ward?.height ? `${Math.round(ward.height)} cm` : '--'],
    ['몸무게', ward?.weight ? `${Math.round(ward.weight)} kg` : '--'],
  ];

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
            <Avatar name={name} size={64}/>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{name}</Text>
              <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: 2 }}>{me?.phone || ''}</Text>
            </View>
            <Pressable onPress={() => router.push('/(elder)/profile-edit')} hitSlop={8}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>수정</Text>
            </Pressable>
          </Card>

          <Card pad={0}>
            {infoRows.map(([label, value], i) => (
              <View key={label} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                minHeight: 56, paddingHorizontal: T.sp.xl,
                borderBottomWidth: i < infoRows.length - 1 ? 1 : 0, borderBottomColor: T.line,
              }}>
                <Text style={{ fontSize: T.fs.body, color: T.body }}>{label}</Text>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{value}</Text>
              </View>
            ))}
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
          </Card>

          <Card pad={0}>
            <Pressable onPress={handleLogout} style={{ minHeight: 56, paddingHorizontal: T.sp.xl, justifyContent: 'center' }}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>로그아웃</Text>
            </Pressable>
          </Card>

          <Pressable onPress={handleDeleteAccount} style={{ alignItems: 'center', paddingVertical: T.sp.sm }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, textDecorationLine: 'underline' }}>회원 탈퇴</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={3}/>
    </View>
  );
}

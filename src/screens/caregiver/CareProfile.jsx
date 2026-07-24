import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import { getMe, deleteAccount } from '../../api/user';
import { logout } from '../../api/auth';
import { tokenStore } from '../../store/tokenStore';

function fmtPhone(p) {
  if (!p) return '';
  if (p.length === 11) return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  return p;
}

export default function CareProfile() {
  const router = useRouter();
  const [me, setMe] = useState(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null));
  }, []);

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
      <AppHeader title="내 정보" onBack />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={18} style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={name} size={62} tone={[T.blueSoft, T.blueDark]} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{name}</Text>
              <Text style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>보호자{phone ? ` · ${phone}` : ''}</Text>
            </View>
          </Card>

          <Pressable
            onPress={handleLogout}
            style={{ marginTop: 24, paddingVertical: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center' }}
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
    </View>
  );
}

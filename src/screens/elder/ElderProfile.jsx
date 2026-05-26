import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMe } from '../../api/user';
import { getPhysicalInfo } from '../../api/ward';
import { logout } from '../../api/auth';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const measureSettings = [
  ['walk',   '자동 측정',    '하루 종일', true],
  ['bell',   '측정 알림 시간', '오전 9시', null],
  ['shield', '낙상 감지',     '켜짐',    true],
];

const healthItems = [
  ['heart', '건강 상태',   '4개 등록'],
  ['doc',   '복용 중인 약', '3개 등록'],
  ['phone', '주치의 / 병원', '서울 봉천의원'],
];

const etcItems = [
  ['settings', '앱 설정'],
  ['shield',   '개인정보 보호'],
  ['doc',      '이용 가이드'],
];

const CURRENT_YEAR = 2026;

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

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="내 정보"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Card pad={18} style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={name} size={62}/>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{name}</Text>
              <Text style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{sub}</Text>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionLabel>측정</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {measureSettings.map(([i, t, d, on], k) => {
              const I = Icon[i];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: k < measureSettings.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.blue}/>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}>{t}</Text>
                  {on !== null ? (
                    <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: on ? T.blue : T.line }}>
                      <View style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 13, color: T.muted }}>{d}</Text>
                      <Icon.chevron width={14} height={14} color={T.muted}/>
                    </View>
                  )}
                </View>
              );
            })}
          </Card>

          <SectionLabel>의료 정보</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {healthItems.map(([i, t, d], k) => {
              const I = Icon[i];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: k < healthItems.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.blue}/>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}>{t}</Text>
                  <Text style={{ fontSize: 13, color: T.muted }}>{d}</Text>
                  <Icon.chevron width={14} height={14} color={T.muted}/>
                </View>
              );
            })}
          </Card>

          <SectionLabel>기타</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {etcItems.map(([i, t], k) => {
              const I = Icon[i];
              return (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: k < etcItems.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF0F4', alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.muted}/>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}>{t}</Text>
                  <Icon.chevron width={14} height={14} color={T.muted}/>
                </View>
              );
            })}
          </Card>

          <Pressable onPress={handleLogout} style={{ marginTop: 16, paddingVertical: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.danger }}>로그아웃</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={4}/>
    </View>
  );
}

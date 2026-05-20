import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const family = [
  { n: '민지', r: '딸',  on: true,  last: '5분 전 확인' },
  { n: '현우', r: '아들', on: false, last: '어제 21:40 확인' },
];

const sharing = [
  ['일일 걸음 점수', true],
  ['상세 보행 지표', true],
  ['위치 정보',      false],
  ['낙상 / 비상 알림', true],
];

export default function ElderCaregiver() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="보호자" sub="가족과 결과를 함께 보세요"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* invite code */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={18} style={{ borderRadius: 20, backgroundColor: T.blue, borderWidth: 0 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontSemiBold, letterSpacing: 0.4 }}>초대 코드</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon.refresh width={13} height={13} color="rgba(255,255,255,0.85)"/>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>24:00 후 갱신</Text>
              </View>
            </View>
            <Text style={{ fontSize: 38, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: 8, marginTop: 8, fontFamily: T.fontMono }}>4 8 2 7</Text>
            <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
              <Pressable style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
                <Icon.share width={16} height={16} color={T.blue}/>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.blue }}>공유하기</Text>
              </Pressable>
              <Pressable style={{ paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#fff' }}>QR</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionLabel action="추가">연결된 가족 (2명)</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {family.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < family.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <View style={{ position: 'relative' }}>
                  <Avatar name={p.n} size={44}/>
                  {p.on && <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: T.ok, borderWidth: 2, borderColor: '#fff' }}/>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>{p.n} <Text style={{ color: T.muted, fontFamily: T.fontMedium, fontSize: 12 }}>· {p.r}</Text></Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{p.last}</Text>
                </View>
                <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.message width={18} height={18} color={T.blue}/>
                </Pressable>
              </View>
            ))}
          </Card>

          <SectionLabel>공유하는 정보</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {sharing.map(([l, on], i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < sharing.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <Text style={{ flex: 1, fontSize: 14, color: T.ink, fontFamily: T.fontMedium }}>{l}</Text>
                <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: on ? T.blue : T.line }}>
                  <View style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={3}/>
    </View>
  );
}

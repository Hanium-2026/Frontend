import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

function Toggle({ on }) {
  return (
    <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: on ? T.blue : T.line }}>
      <View style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
    </View>
  );
}

function Row({ label, sub, on, last }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: T.line }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: T.ink, fontFamily: T.fontSemiBold }}>{label}</Text>
        {sub && <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{sub}</Text>}
      </View>
      <Toggle on={on}/>
    </View>
  );
}

export default function CareNotifSettings() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="알림 설정" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SectionLabel>위험 신호</SectionLabel>
        <Card pad={0} style={{ borderRadius: 18 }}>
          <Row label="점수 급락"   sub="3일 이상 연속 하락 시 알림"      on={true}/>
          <Row label="낙상 감지"   sub="즉시 알림 · 119 자동 연결 가능"  on={true}/>
          <Row label="좌우 비대칭" sub="대칭성 10% 이상 차이"           on={true}/>
          <Row label="활동량 부족" sub="평균 대비 -50% 이하"            on={false} last/>
        </Card>

        <SectionLabel>일일 리포트</SectionLabel>
        <Card pad={0} style={{ borderRadius: 18 }}>
          <Row label="매일 아침 요약" sub="08:00 · 어제 분석 결과" on={true}/>
          <Row label="주간 리포트"    sub="일요일 21:00"           on={true}/>
          <Row label="월간 리포트"    sub="매월 1일 · PDF 첨부"   on={false} last/>
        </Card>

        <SectionLabel>위치 알림</SectionLabel>
        <Card pad={0} style={{ borderRadius: 18 }}>
          <Row label="안전 구역 이탈"     sub="설정한 안전 구역을 벗어날 때" on={true}/>
          <Row label="장시간 정지"        sub="20분 이상 정지 상태"         on={true}/>
          <Row label="실시간 위치 동기화" sub="배터리 사용량 증가"           on={false} last/>
        </Card>

        <SectionLabel>방해 금지</SectionLabel>
        <Card pad={0} style={{ borderRadius: 18 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.line }}>
            <Text style={{ fontSize: 14, color: T.ink, fontFamily: T.fontSemiBold }}>방해 금지 시간</Text>
            <View style={{ marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>23:00</Text>
              </View>
              <Text style={{ fontSize: 12, color: T.muted }}>부터</Text>
              <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>06:30</Text>
              </View>
              <Text style={{ fontSize: 12, color: T.muted }}>까지</Text>
            </View>
            <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>긴급/낙상 알림은 항상 전달됩니다.</Text>
          </View>
          <Row label="진동만 사용" on={false} last/>
        </Card>

        <SectionLabel>개발자</SectionLabel>
        <Card pad={0} style={{ borderRadius: 18 }}>
          <Pressable onPress={() => router.push('/server-config')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF0F4', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.settings width={18} height={18} color={T.muted}/>
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}>서버 설정</Text>
            <Icon.chevron width={14} height={14} color={T.muted}/>
          </Pressable>
        </Card>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={4}/>
    </View>
  );
}

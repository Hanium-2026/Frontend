import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import BarChart from '../../components/BarChart';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const trend = [72, 70, 74, 78, 76, 75, 79];
const days = ['월', '화', '수', '목', '금', '토', '일'];
const records = [
  { d: '오늘 14:14', s: 79, t: 'ok',      n: '안정 · 30초 측정',    icon: 'walk' },
  { d: '오늘 09:32', s: 76, t: 'ok',      n: '백그라운드 · 자동',   icon: 'spark' },
  { d: '어제 18:01', s: 75, t: 'ok',      n: '안정 · 산책 중',      icon: 'walk' },
  { d: '어제 11:20', s: 68, t: 'caution', n: '주의 · 좌우차 8%',    icon: 'walk' },
  { d: '5/16 17:45', s: 78, t: 'ok',      n: '안정 · 30초 측정',    icon: 'walk' },
  { d: '5/15 09:10', s: 72, t: 'ok',      n: '안정 · 백그라운드',   icon: 'spark' },
];

export default function ElderHistory() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader
        title="기록"
        sub="지난 30일의 걸음 건강"
        right={
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.filter width={18} height={18} color={T.muted}/>
          </View>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold, letterSpacing: 0.2 }}>최근 7일 평균</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 30, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>74.9</Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>점</Text>
                </View>
              </View>
              <Pill tone="ok">▲ 2.1</Pill>
            </View>
            <View style={{ marginTop: 10 }}>
              <BarChart data={trend} width={328} height={92} color={T.blue} max={100} labels={days}/>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SectionLabel>측정 기록</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {records.map((r, i) => {
              const I = Icon[r.icon];
              return (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
                  borderBottomWidth: i < records.length - 1 ? 1 : 0, borderBottomColor: T.line,
                }}>
                  <View style={{
                    width: 38, height: 38, borderRadius: 12,
                    backgroundColor: r.t === 'ok' ? T.blueSoft : T.cautionSoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <I width={20} height={20} color={r.t === 'ok' ? T.blue : '#8B5A06'}/>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>{r.d}</Text>
                    <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{r.n}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: T.ink }}>{r.s}</Text>
                    <Pill tone={r.t} size="sm">{r.t === 'ok' ? '안정' : '주의'}</Pill>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={2}/>
    </View>
  );
}

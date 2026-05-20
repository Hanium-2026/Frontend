import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

const alerts = [
  { who: '이정희', tone: 'danger',  t: '보행 점수 급락',   d: '5일간 60→54점 · 의료진 상담 권장', when: '30분 전',  i: 'brain' },
  { who: '박영호', tone: 'caution', t: '좌우 대칭성 저하', d: '92% → 85% (-7%) · 추가 관찰',     when: '2시간 전',  i: 'shield' },
  { who: '박영호', tone: 'caution', t: '걸음 속도 감소',   d: '1.1 → 0.9 m/s (-18%)',           when: '어제',      i: 'walk' },
  { who: '김순자', tone: 'info',    t: '주간 리포트 도착', d: '5월 12-18일 분석 완료',           when: '오늘 09:00', i: 'doc' },
  { who: '이정희', tone: 'danger',  t: '낙상 감지',        d: '화장실 부근 · 자동 신고됨',        when: '어제 23:14', i: 'fall' },
  { who: '김순자', tone: 'info',    t: '기상 측정 완료',   d: '점수 79점 · 안정 범위',           when: '오늘 07:30', i: 'walk' },
];

const tonemap = {
  danger:  { bg: '#FCE0E0', fg: T.danger  },
  caution: { bg: '#FCEDC8', fg: '#B07203' },
  info:    { bg: T.blueSoft, fg: T.blue   },
};

const filterTabs = [
  { l: '전체', n: 14, on: true  },
  { l: '위험', n: 2,  on: false },
  { l: '주의', n: 5,  on: false },
  { l: '정보', n: 7,  on: false },
];

export default function CareAlerts() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader
        title="알림 · AI 리포트"
        sub="최근 7일"
        right={
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.filter width={18} height={18} color={T.muted}/>
          </View>
        }
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 6, flexDirection: 'row', gap: 8 }}>
        {filterTabs.map((t, i) => (
          <View key={i} style={{
            paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100,
            backgroundColor: t.on ? T.ink : '#fff',
            borderWidth: t.on ? 0 : 1, borderColor: T.line,
            flexDirection: 'row', alignItems: 'center', gap: 6,
          }}>
            <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: t.on ? '#fff' : T.body }}>{t.l}</Text>
            <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: t.on ? 'rgba(255,255,255,0.18)' : T.bg }}>
              <Text style={{ fontSize: 10, color: t.on ? '#fff' : T.muted }}>{t.n}</Text>
            </View>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100, gap: 10 }} showsVerticalScrollIndicator={false}>
        {alerts.map((a, i) => {
          const I = Icon[a.i];
          const c = tonemap[a.tone];
          return (
            <Card key={i} pad={14} style={{ borderRadius: 16, borderLeftWidth: 3, borderLeftColor: c.fg }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <I width={20} height={20} color={c.fg}/>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text style={{ fontSize: 13.5, fontFamily: T.fontBold, color: T.ink, flex: 1 }}>{a.t}</Text>
                    <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMedium }}>{a.when}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2, fontFamily: T.fontMedium }}>{a.who} · {a.d}</Text>
                  {a.tone === 'danger' && (
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                      <Pressable style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: T.danger, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: '#fff' }}>전화 걸기</Text>
                      </Pressable>
                      <Pressable style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: T.body }}>상세 보기</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={1}/>
    </View>
  );
}

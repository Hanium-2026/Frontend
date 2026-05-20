import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import SparkLine from '../../components/SparkLine';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

const patients = [
  { n: '김순자', r: '어머니', age: 72, s: 79, tone: 'ok',      sub: '안정 · 5분 전',      trend: [72,74,75,73,78,77,79], steps: '2,840' },
  { n: '박영호', r: '아버지', age: 78, s: 62, tone: 'caution', sub: '주의 · 좌우차 ↑',    trend: [68,70,67,65,63,64,62], steps: '1,205' },
  { n: '이정희', r: '시모',   age: 81, s: 54, tone: 'danger',  sub: '위험 · 30분 전 알림', trend: [60,58,57,55,56,52,54], steps: '420 · 활동 적음' },
];

const toneScore = { ok: T.ok, caution: T.caution, danger: T.danger };
const toneSub   = { ok: T.body, caution: '#8B5A06', danger: '#9B1B1B' };

export default function CareDashboard() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* header */}
      <View style={{ paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: T.line }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSemiBold }}>안녕하세요, 민지님</Text>
            <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6, marginTop: 2 }}>가족 보행 상태</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.bell width={18} height={18} color={T.body}/>
              <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: T.danger, borderWidth: 1.5, borderColor: '#fff' }}/>
            </Pressable>
            <Avatar name="민지" size={38} tone={[T.blueSoft, T.blueDark]}/>
          </View>
        </View>

        {/* summary tiles */}
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          {[['전체','3','명', T.ink], ['주의','1','명', T.caution], ['위험','1','명', T.danger]].map(([l,v,s,c], i) => (
            <View key={i} style={{ flex: 1, backgroundColor: T.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.line }}>
              <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 2 }}>
                <Text style={{ fontSize: 24, fontFamily: T.fontExtraBold, color: c, letterSpacing: -0.5 }}>{v}</Text>
                <Text style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>{s}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* alert banner */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Pressable onPress={() => router.push('/(caregiver)/alerts')} style={{ backgroundColor: T.dangerSoft, borderWidth: 1, borderColor: '#F8BFBF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.danger, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.bell width={20} height={20} color="#fff"/>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#9B1B1B' }}>이정희님 · 보행 점수 급락</Text>
              <Text style={{ fontSize: 11.5, color: '#9B1B1B', opacity: 0.8, marginTop: 1 }}>최근 5일간 60→54점 · 의료진 상담 권장</Text>
            </View>
            <Icon.chevron width={14} height={14} color="#9B1B1B"/>
          </Pressable>
        </View>

        {/* patient cards */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionLabel action="추가">돌보는 가족</SectionLabel>
          <View style={{ gap: 10 }}>
            {patients.map((p, i) => (
              <Pressable key={i} onPress={() => router.push('/(caregiver)/patient-detail')}>
                <Card pad={0} style={{ borderRadius: 16 }}>
                  <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={p.n} size={48}/>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontSize: 15, fontFamily: T.fontExtraBold, color: T.ink }}>{p.n}</Text>
                        <Text style={{ fontSize: 11.5, color: T.muted }}>{p.r} · {p.age}세</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: toneSub[p.tone], marginTop: 3, fontFamily: T.fontSemiBold }}>{p.sub}</Text>
                      <Text style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>걸음 {p.steps}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: toneScore[p.tone], letterSpacing: -0.6, lineHeight: 30 }}>{p.s}</Text>
                      <Pill tone={p.tone} size="sm">{p.tone === 'ok' ? '안정' : p.tone === 'caution' ? '주의' : '위험'}</Pill>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                    <SparkLine data={p.trend} width={344} height={42} color={toneScore[p.tone]}/>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={0}/>
    </View>
  );
}

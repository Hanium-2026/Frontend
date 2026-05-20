import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import SparkLine from '../../components/SparkLine';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

const trendData = [72,74,75,73,76,74,77,75,78,76,79,77,76,79,78,80,76,77,75,79,78,77,76,75,79,78,76,77,79,79];
const metricGrid = [['이동거리','1.4km'],['속도','1.12m/s'],['대칭','92%'],['케이던스','108/m'],['지지','0.42s'],['흔들림','0.18']];
const recipients = [
  { n: '서울 봉천의원', s: '신경과 김재현 · 주치의', sel: true },
  { n: '서울대병원',    s: '신경과 외래',           sel: false },
];
const sendMethods = [['download','다운로드'],['share','공유'],['message','문자']];

export default function CareReport() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="리포트 공유" sub="병원·의료진에게 전달" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* report preview */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={0} style={{ borderRadius: 18 }}>
            <View style={{ backgroundColor: '#F8FAFC', padding: 18, borderBottomWidth: 1, borderBottomColor: T.line }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 9, color: T.muted, fontFamily: T.fontBold, letterSpacing: 1 }}>WALKMIND CLINICAL REPORT</Text>
                  <Text style={{ fontSize: 14, fontFamily: T.fontExtraBold, color: T.ink, marginTop: 4 }}>김순자 (F·72)</Text>
                  <Text style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>2026.04.19 ~ 2026.05.18 · 30 days</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 9, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.4 }}>SCORE</Text>
                  <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.blue, lineHeight: 32, marginTop: 2 }}>75.4</Text>
                </View>
              </View>

              <View style={{ marginTop: 12, backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: T.line }}>
                <Text style={{ fontSize: 9, color: T.muted, fontFamily: T.fontBold, marginBottom: 4 }}>30-DAY TREND</Text>
                <SparkLine data={trendData} width={280} height={50} color={T.blue}/>
              </View>

              <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {metricGrid.map(([l,v], i) => (
                  <View key={i} style={{ width: '30%', backgroundColor: '#fff', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: T.line }}>
                    <Text style={{ fontSize: 8.5, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
                    <Text style={{ fontSize: 11.5, fontFamily: T.fontBold, color: T.ink, marginTop: 1 }}>{v}</Text>
                  </View>
                ))}
              </View>

              <View style={{ marginTop: 10, padding: 10, backgroundColor: T.blueSoft, borderRadius: 6 }}>
                <Text style={{ fontSize: 9, color: T.blueDarker, fontFamily: T.fontBold, letterSpacing: 0.4 }}>AI ASSESSMENT</Text>
                <Text style={{ fontSize: 10, color: T.ink, marginTop: 2, lineHeight: 15 }}>
                  Overall gait stable. Single-support phase slightly shortened — recommend continued monitoring.
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: T.muted }}>4 페이지 · PDF</Text>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: T.blue }}>미리보기</Text>
                <Icon.arrowRight width={13} height={13} color={T.blue}/>
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionLabel>받는 사람</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {recipients.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < recipients.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.heart width={18} height={18} color={T.blue}/>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>{r.n}</Text>
                  <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{r.s}</Text>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: r.sel ? 7 : 2, borderColor: r.sel ? T.blue : T.line, backgroundColor: '#fff' }}/>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionLabel>전송 방법</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {sendMethods.map(([i, l], k) => {
              const I = Icon[i];
              return (
                <Card key={k} pad={14} style={{ borderRadius: 14, flex: 1, alignItems: 'center', gap: 6 }}>
                  <I width={22} height={22} color={T.blue}/>
                  <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.ink }}>{l}</Text>
                </Card>
              );
            })}
          </View>
          <Pressable style={{ marginTop: 16, width: '100%', height: 52, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Icon.share width={18} height={18} color="#fff"/>
            <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: '#fff' }}>리포트 보내기</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={3}/>
    </View>
  );
}

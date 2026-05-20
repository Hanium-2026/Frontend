import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import TabBar from '../../components/TabBar';
import ElderTopBlock from '../../components/ElderTopBlock';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const metrics = [
  { label: '이동 거리',     v: '1.4 km',   bar: 70, tone: T.blue,    note: '정상 범위' },
  { label: '케이던스',      v: '108 /분',  bar: 82, tone: T.blue,    note: '안정적' },
  { label: '좌우 대칭성',   v: '92%',       bar: 92, tone: T.ok,      note: '좋아요' },
  { label: '보행 속도',     v: '1.12 m/s', bar: 68, tone: T.blue,    note: '평균보다 약간 느림' },
  { label: '흔들림 (편차)', v: '0.18',      bar: 86, tone: T.ok,      note: '안정' },
  { label: '한 발 지지시간', v: '0.42초',   bar: 60, tone: T.caution, note: '주의 관찰' },
];

export default function ElderResult() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ElderTopBlock minHeight={300}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color="#fff"/>
          </Pressable>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontSemiBold }}>5월 18일 · 오후 2:14</Text>
          <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.share width={18} height={18} color="#fff"/>
          </Pressable>
        </View>

        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={160} height={160} viewBox="0 0 160 160" style={{ position: 'absolute' }}>
              <Circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none"/>
              <Circle cx="80" cy="80" r="68" stroke="#fff" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray="427" strokeDashoffset="90"
                transform="rotate(-90 80 80)"/>
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: T.fontSemiBold, letterSpacing: 1 }}>걸음 건강 점수</Text>
              <Text style={{ fontSize: 56, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -2, lineHeight: 60 }}>79</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>/ 100</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, marginTop: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#86E3C1' }}/>
            <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: '#fff', letterSpacing: -0.2 }}>안정 · 위험도 낮음</Text>
          </View>
        </View>
      </ElderTopBlock>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* AI summary */}
        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.brain width={18} height={18} color={T.blue}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: T.blue, fontFamily: T.fontBold, letterSpacing: 0.4 }}>AI 분석 요약</Text>
                <Text style={{ fontSize: 14, color: T.ink, fontFamily: T.fontSemiBold, lineHeight: 21, marginTop: 4 }}>
                  전반적으로 보행이 <Text style={{ color: T.blue }}>안정적</Text>이에요.{'\n'}
                  다만 <Text style={{ fontFamily: T.fontBold }}>한 발 지지시간</Text>이 평소보다 짧아 주의 관찰을 권해드려요.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* metrics */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionLabel action="자세히">상세 지표</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {metrics.map((m, i) => (
              <View key={i} style={{ padding: 16, borderBottomWidth: i < metrics.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.ink }}>{m.label}</Text>
                  <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>{m.v}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: T.line }}>
                    <View style={{ width: `${m.bar}%`, height: 6, backgroundColor: m.tone, borderRadius: 3 }}/>
                  </View>
                  <Text style={{ fontSize: 11, color: m.tone, fontFamily: T.fontSemiBold, minWidth: 64, textAlign: 'right' }}>{m.note}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={1}/>
    </View>
  );
}

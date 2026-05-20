import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import TabBar from '../../components/TabBar';
import Avatar from '../../components/Avatar';
import ElderTopBlock from '../../components/ElderTopBlock';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

export default function ElderHome() {
  const router = useRouter();
  const metrics = [
    { i: 'steps',  label: '걸음수',      v: '2,840', sub: '걸음', tone: T.blue },
    { i: 'walk',   label: '이동 거리',   v: '1.4',   sub: 'km',   tone: '#7B5BD9' },
    { i: 'shield', label: '좌우 대칭성', v: '92%',   sub: '안정', tone: T.ok },
    { i: 'fall',   label: '낙상 위험',   v: '낮음',  sub: '0건',  tone: T.ok },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ElderTopBlock minHeight={246}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: T.font }}>5월 18일 월요일</Text>
            <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 2, letterSpacing: -0.6 }}>안녕하세요, 김순자님</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.bell width={20} height={20} color="#fff"/>
            <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FCD34D', borderWidth: 1.5, borderColor: T.blue }}/>
          </View>
        </View>

        <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Svg width={92} height={92} viewBox="0 0 92 92">
            <Circle cx="46" cy="46" r="38" stroke="rgba(255,255,255,0.22)" strokeWidth="8" fill="none"/>
            <Circle cx="46" cy="46" r="38" stroke="#fff" strokeWidth="8" fill="none"
              strokeLinecap="round" strokeDasharray="238.7" strokeDashoffset="50"
              transform="rotate(-90 46 46)"/>
            <SvgText x="46" y="50" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">79</SvgText>
            <SvgText x="46" y="63" textAnchor="middle" fontSize="9" fill="#fff" opacity="0.7">/ 100</SvgText>
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontSemiBold, letterSpacing: 0.4 }}>오늘의 걸음 건강</Text>
            <Text style={{ fontSize: 20, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 4, letterSpacing: -0.4 }}>안정적이에요</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontFamily: T.font }}>
              어제보다 <Text style={{ fontFamily: T.fontBold }}>+3점</Text> · 7일 평균 76점
            </Text>
          </View>
        </View>
      </ElderTopBlock>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* floating CTA — overlaps blue header */}
        <View style={{ paddingHorizontal: 16, marginTop: -32 }}>
          <Card pad={0} style={{ borderRadius: 20, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 8 }}>
            <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.walk width={30} height={30} color={T.blue}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>지금 측정하기</Text>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2, fontFamily: T.font }}>30초 동안 평소처럼 걸어주세요</Text>
              </View>
              <Pressable
                onPress={() => router.push('/(elder)/measure')}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: T.blue }}>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#fff' }}>시작</Text>
              </Pressable>
            </View>
            <View style={{ backgroundColor: T.blueWash, paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', gap: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: T.line }}>
              <Icon.spark width={14} height={14} color={T.blue}/>
              <Text style={{ fontSize: 11.5, color: T.muted, fontFamily: T.font }}>
                오늘은 백그라운드로 <Text style={{ fontFamily: T.fontBold }}>2,840걸음</Text>이 자동 분석되었어요
              </Text>
            </View>
          </Card>
        </View>

        {/* metric tiles 2x2 */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 10 }}>
          {[metrics.slice(0, 2), metrics.slice(2, 4)].map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 10 }}>
              {row.map((m, k) => {
                const I = Icon[m.i];
                return (
                  <Card key={k} pad={14} style={{ borderRadius: 16, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11.5, color: T.muted, fontFamily: T.fontSemiBold }}>{m.label}</Text>
                      <I width={16} height={16} color={m.tone}/>
                    </View>
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{m.v}</Text>
                      <Text style={{ fontSize: 11, color: T.muted, marginBottom: 2, fontFamily: T.font }}>{m.sub}</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          ))}
        </View>

        {/* family card */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Pressable onPress={() => router.push('/(elder)/caregiver')}>
            <Card pad={14} style={{ borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row' }}>
                <Avatar name="민지" size={32}/>
                <Avatar name="현우" size={32} tone={['#FCEDC8', '#8B5A06']}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink }}>딸 민지님이 확인했어요</Text>
                <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1, fontFamily: T.font }}>오늘 오전 9:24 · 메시지 1개</Text>
              </View>
              <Icon.chevron width={16} height={16} color={T.muted}/>
            </Card>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={0}/>
    </View>
  );
}

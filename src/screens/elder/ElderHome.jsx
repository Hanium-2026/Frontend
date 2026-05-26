import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import TabBar from '../../components/TabBar';
import Avatar from '../../components/Avatar';
import ElderTopBlock from '../../components/ElderTopBlock';
import { getMe } from '../../api/user';
import { getMyGuardians } from '../../api/links';

const ELDER_TABS = [
  { icon: 'home', label: '홈', path: '/(elder)/' },
  { icon: 'walk', label: '걷기', path: '/(elder)/measure' },
  { icon: 'history', label: '기록', path: '/(elder)/history' },
  { icon: 'family', label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user', label: '내정보', path: '/(elder)/profile' },
];

export default function ElderHome() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [guardians, setGuardians] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getMe().then((m) => { if (alive) setName(m?.name || ''); }).catch(() => {});
      getMyGuardians().then((list) => { if (alive) setGuardians(list ?? []); }).catch(() => {
        if (alive) setGuardians([]);
      });
      return () => { alive = false; };
    }, [])
  );

  const metrics = [
    { i: 'steps', label: '걸음수', v: '2,840', sub: '걸음', tone: T.blue },
    { i: 'walk', label: '이동 거리', v: '1.4', sub: 'km', tone: '#7B5BD9' },
    { i: 'shield', label: '좌우 균형', v: '92%', sub: '안정', tone: T.ok },
    { i: 'fall', label: '낙상 위험', v: '낮음', sub: '0건', tone: T.ok },
  ];

  const guardianCount = guardians.length;
  const guardianPreview = guardians.slice(0, 2);
  const guardianNames = guardianPreview.map((g) => g.name).filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ElderTopBlock minHeight={246}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: T.font }}>오늘도 함께 걸어요</Text>
            <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 2, letterSpacing: -0.6 }}>
              안녕하세요, {name ? `${name}님` : '반갑습니다'}
            </Text>
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
            <SvgText x="46" y="50" textAnchor="middle" fontSize="22" fontFamily={T.fontExtraBold} fill="#fff">79</SvgText>
            <SvgText x="46" y="63" textAnchor="middle" fontSize="9" fontFamily={T.font} fill="#fff" opacity="0.7">/ 100</SvgText>
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
                오늘은 백그라운드로 <Text style={{ fontFamily: T.fontBold }}>2,840걸음</Text>을 자동 분석했어요
              </Text>
            </View>
          </Card>
        </View>

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

        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Pressable onPress={() => router.push('/(elder)/caregiver')}>
            <Card pad={14} style={{ borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {guardianCount > 0 ? (
                <View style={{ flexDirection: 'row' }}>
                  {guardianPreview.map((g, i) => (
                    <View key={g.guardianUserId ?? i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                      <Avatar name={g.name || '보호자'} size={32}/>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.family width={20} height={20} color={T.blue}/>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink }}>
                  {guardianCount > 0 ? `연결된 보호자 ${guardianCount}명` : '보호자 연결하기'}
                </Text>
                <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1, fontFamily: T.font }}>
                  {guardianCount > 0 ? `${guardianNames || '보호자'}님과 결과를 공유 중이에요` : '보호자 전화번호로 연동 코드를 만들 수 있어요'}
                </Text>
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

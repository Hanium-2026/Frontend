import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

const stats = [['이동 거리','1.4 km'],['시간','32분'],['걸음 수','2,840']];

export default function CareLocation() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* map area */}
      <View style={{ height: 420, backgroundColor: '#E8EDF2', overflow: 'hidden' }}>
        <Svg width="100%" height={420} viewBox="0 0 402 420">
          <Rect width="402" height="420" fill="#E8EDF2"/>
          {/* streets pattern - manual grid */}
          {[0,1,2,3,4,5,6].map(i => (
            <Rect key={`h${i}`} x="0" y={26+i*60} width="402" height="8" fill="#fff"/>
          ))}
          {[0,1,2,3,4,5,6].map(i => (
            <Rect key={`v${i}`} x={26+i*60} y="0" width="8" height="420" fill="#fff"/>
          ))}
          {/* parks */}
          <Rect x="220" y="80" width="120" height="80" rx="10" fill="#D6EAD8"/>
          <Rect x="60" y="280" width="100" height="120" rx="10" fill="#D6EAD8"/>
          {/* river */}
          <Path d="M0 320 Q 80 300 160 320 T 320 300 T 402 320 L 402 350 Q 320 330 240 350 T 80 330 T 0 350 Z" fill="#BFD8EF"/>
          {/* walk path */}
          <Path d="M 80 80 Q 110 110 150 130 Q 200 150 230 200 Q 250 240 270 290 Q 280 320 250 330"
            fill="none" stroke={T.blue} strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" opacity="0.8"/>
          {/* start */}
          <Circle cx="80" cy="80" r="9" fill="#fff" stroke={T.blue} strokeWidth="3"/>
          {/* end pin */}
          <Circle cx="250" cy="330" r="20" fill={T.blue} opacity="0.18"/>
          <Circle cx="250" cy="330" r="12" fill={T.blue}/>
          <Circle cx="250" cy="330" r="5" fill="#fff"/>
        </Svg>

        {/* top bar over map */}
        <View style={{ position: 'absolute', top: 54, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Icon.arrowLeft width={18} height={18} color={T.body}/>
          </Pressable>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 }}>
            <Avatar name="김순자" size={26}/>
            <View>
              <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink, lineHeight: 16 }}>김순자</Text>
              <Text style={{ fontSize: 10, color: T.ok, fontFamily: T.fontSemiBold, marginTop: 2 }}>● 이동 중</Text>
            </View>
          </View>
          <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <Icon.more width={18} height={18} color={T.body}/>
          </Pressable>
        </View>

        {/* safe zone legend */}
        <View style={{ position: 'absolute', top: 110, right: 16, backgroundColor: '#fff', borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ fontSize: 10, color: T.muted, fontFamily: T.fontBold, marginBottom: 4 }}>안전 구역</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.ok }}/>
            <Text style={{ fontSize: 11, color: T.body }}>집 · 공원</Text>
          </View>
        </View>
      </View>

      {/* bottom sheet */}
      <View style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100, marginTop: -24, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 10 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.line, alignSelf: 'center', marginBottom: 14 }}/>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 15, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.3 }}>지금 위치 · 봉천공원 산책로</Text>
            <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>관악구 봉천동 · 1분 전 업데이트</Text>
          </View>
          <Pill tone="ok">안전 구역</Pill>
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          {stats.map(([l,v], i) => (
            <View key={i} style={{ flex: 1, backgroundColor: T.bg, borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 10.5, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
              <Text style={{ fontSize: 17, fontFamily: T.fontExtraBold, color: T.ink, marginTop: 2, letterSpacing: -0.3 }}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          <Pressable style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            <Icon.phone width={16} height={16} color="#fff"/>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#fff' }}>전화 걸기</Text>
          </Pressable>
          <Pressable style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.body }}>안전구역 설정</Text>
          </Pressable>
        </View>
      </View>

      <TabBar tabs={CARE_TABS} active={2}/>
    </View>
  );
}

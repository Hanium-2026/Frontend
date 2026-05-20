import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Svg, { G, Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';

const score30 = [76,72,75,74,71,73,72,70,74,78,76,75,79,77,73,74,76,72,75,78,80,79,77,76,79,76,74,77,79,79];

const metrics = [
  { l: '이동 거리', v: '1.4',  u: 'km',   d: '+0.3',  tone: T.ok },
  { l: '케이던스',  v: '108',  u: '/분',  d: '+3',    tone: T.ok },
  { l: '좌우 대칭', v: '92',   u: '%',    d: '-1',    tone: T.muted },
  { l: '보행 속도', v: '1.12', u: 'm/s',  d: '+0.04', tone: T.ok },
  { l: '흔들림',    v: '0.18', u: '',     d: '-0.02', tone: T.ok },
  { l: '한 발 지지',v: '0.42', u: '초',  d: '-0.03', tone: T.caution },
];

export default function CarePatientDetail() {
  const router = useRouter();

  const W = 344, H = 120;
  const xs = score30.map((_, i) => 22 + i * (322 / 29));
  const ys = score30.map(v => 108 - (v - 40) * 1.5);
  const d = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = d + ` L ${xs[xs.length-1].toFixed(1)} 108 L 22 108 Z`;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.body}/>
        </Pressable>
        <Avatar name="김순자" size={40}/>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.3 }}>
            김순자 <Text style={{ color: T.muted, fontFamily: T.fontMedium, fontSize: 12 }}> · 어머니 · 72세</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.ok }}/>
            <Text style={{ fontSize: 11.5, color: T.ok, fontFamily: T.fontSemiBold }}>안정 · 5분 전 동기화</Text>
          </View>
        </View>
        <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.message width={18} height={18} color={T.blue}/>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Card pad={14} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>30일 평균 점수</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 30, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>75.4</Text>
                  <Pill tone="ok" size="sm">▲ 1.8</Pill>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4, backgroundColor: T.bg, borderRadius: 10, padding: 3 }}>
                {['7일', '30일', '3개월'].map((l, i) => (
                  <View key={i} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: i === 1 ? '#fff' : 'transparent' }}>
                    <Text style={{ fontSize: 11, fontFamily: T.fontSemiBold, color: i === 1 ? T.ink : T.muted }}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <Svg width={W} height={H + 12} viewBox={`0 0 ${W} ${H + 12}`}>
                {[40,60,80,100].map((y, i) => (
                  <G key={i}>
                    <Line x1="22" y1={108-(y-40)*1.5} x2={W} y2={108-(y-40)*1.5} stroke={T.line}/>
                    <SvgText x="0" y={112-(y-40)*1.5} fontSize="9" fill={T.muted}>{y}</SvgText>
                  </G>
                ))}
                <Path d={area} fill={T.blue} opacity="0.08"/>
                <Path d={d} fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round"/>
                <Circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4" fill={T.blue} stroke="#fff" strokeWidth="2"/>
                <SvgText x="22" y={H+12} fontSize="9" fill={T.muted}>4/19</SvgText>
                <SvgText x={W/2} y={H+12} fontSize="9" fill={T.muted} textAnchor="middle">5/4</SvgText>
                <SvgText x={W} y={H+12} fontSize="9" fill={T.muted} textAnchor="end">5/18</SvgText>
              </Svg>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Card pad={14} style={{ borderRadius: 16, backgroundColor: T.blueWash, borderWidth: 1, borderColor: T.blueChip }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.brain width={16} height={16} color="#fff"/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: T.blueDarker, fontFamily: T.fontBold, letterSpacing: 0.4 }}>AI 리포트</Text>
                <Text style={{ fontSize: 13, color: T.ink, marginTop: 2, lineHeight: 20, fontFamily: T.fontMedium }}>
                  이동 거리가 지난주 대비 <Text style={{ fontFamily: T.fontBold }}>+0.3km</Text> 늘었어요. 좌우 대칭성도 안정적입니다.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionLabel action="모든 지표">핵심 지표 (오늘)</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {metrics.map((m, i) => (
              <Card key={i} pad={12} style={{ borderRadius: 14, width: '47.5%' }}>
                <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{m.l}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 5 }}>
                  <Text style={{ fontSize: 20, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{m.v}</Text>
                  <Text style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{m.u}</Text>
                  <Text style={{ marginLeft: 'auto', fontSize: 11, color: m.tone, fontFamily: T.fontBold }}>{m.d}</Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

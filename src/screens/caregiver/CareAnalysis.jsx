import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import Svg, { G, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Pill from '../../components/Pill';

const grid = [
  [3,3,4,3,3,3,4],
  [3,4,3,3,4,3,3],
  [3,3,3,4,3,4,3],
  [2,3,3,3,3,3,3],
  [2,2,3,3,2,3,3],
  [2,2,2,2,2,3,2],
  [1,2,2,1,2,2,2],
];
const swatch = ['#EAECF1','#D7E1FA','#A8BEF2','#5C82E0','#2F5BD4'];
const dayLabels = ['월','화','수','목','금','토','일'];

const radarLabels = ['이동거리','속도','대칭','케이던스','지지시간','흔들림'];
const radarAvg  = [0.78,0.82,0.85,0.8,0.83,0.81];
const radarThis = [0.62,0.55,0.78,0.68,0.7,0.6];
const R = 80;
function radarPoints(vals) {
  return vals.map((v, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    return `${(Math.cos(a) * R * v).toFixed(1)},${(Math.sin(a) * R * v).toFixed(1)}`;
  }).join(' ');
}
function gridPoints(r) {
  return [0,1,2,3,4,5].map(i => {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    return `${(Math.cos(a) * R * r).toFixed(1)},${(Math.sin(a) * R * r).toFixed(1)}`;
  }).join(' ');
}

export default function CareAnalysis() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.body}/>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>박영호 · 보행 분석</Text>
          <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>지난 7주 패턴</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* heatmap */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink }}>일별 위험도 히트맵</Text>
                <Text style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>색이 진할수록 위험 신호</Text>
              </View>
              <Pill tone="caution" size="sm">최근 악화</Pill>
            </View>

            {/* header row */}
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
              <View style={{ width: 24 }}/>
              {dayLabels.map(d => (
                <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: T.muted, fontFamily: T.fontSemiBold }}>{d}</Text>
                </View>
              ))}
            </View>
            {grid.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                <View style={{ width: 24, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9, color: T.muted }}>{`-${(7-ri)*7}d`}</Text>
                </View>
                {row.map((v, ci) => (
                  <View key={ci} style={{ flex: 1, aspectRatio: 1, borderRadius: 6, backgroundColor: swatch[v], alignItems: 'center', justifyContent: 'center' }}>
                    {v >= 3 && <Text style={{ fontSize: 9, color: '#fff', fontFamily: T.fontSemiBold }}>!</Text>}
                  </View>
                ))}
              </View>
            ))}

            {/* legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 10 }}>
              <Text style={{ fontSize: 10, color: T.muted }}>낮음</Text>
              {swatch.map((c, i) => <View key={i} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: c }}/>)}
              <Text style={{ fontSize: 10, color: T.muted }}>높음</Text>
            </View>
          </Card>
        </View>

        {/* radar chart */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink, marginBottom: 8 }}>지표별 비교 (이번주 vs 평균)</Text>
            <View style={{ alignItems: 'center' }}>
              <Svg width={200} height={200} viewBox="-100 -100 200 200">
                {[1,0.75,0.5,0.25].map(r => (
                  <Polygon key={r} fill="none" stroke={T.line} points={gridPoints(r)}/>
                ))}
                {[0,1,2,3,4,5].map(i => {
                  const a = -Math.PI / 2 + i * Math.PI / 3;
                  return <Line key={i} x1="0" y1="0" x2={(Math.cos(a)*R).toFixed(1)} y2={(Math.sin(a)*R).toFixed(1)} stroke={T.line}/>;
                })}
                <Polygon points={radarPoints(radarAvg)} fill={T.muted} fillOpacity="0.15" stroke={T.muted} strokeWidth="1.5" strokeDasharray="3 3"/>
                <Polygon points={radarPoints(radarThis)} fill={T.blue} fillOpacity="0.18" stroke={T.blue} strokeWidth="2"/>
                {radarLabels.map((l, i) => {
                  const a = -Math.PI / 2 + i * Math.PI / 3;
                  return <SvgText key={i} x={(Math.cos(a)*(R+18)).toFixed(1)} y={(Math.sin(a)*(R+18)+3).toFixed(1)} fontSize="9" fill={T.body} fontWeight="600" textAnchor="middle">{l}</SvgText>;
                })}
              </Svg>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: T.blue }}/>
                <Text style={{ fontSize: 11, color: T.muted }}>이번주</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 2, backgroundColor: T.muted }}/>
                <Text style={{ fontSize: 11, color: T.muted }}>3개월 평균</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 12, paddingBottom: 40 }}>
          <Card pad={14} style={{ borderRadius: 16, backgroundColor: '#FCEDC8', borderWidth: 1, borderColor: '#F0D89B' }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Icon.spark width={18} height={18} color="#B07203"/>
              <Text style={{ flex: 1, fontSize: 12.5, color: '#5B3D02', lineHeight: 20, fontFamily: T.fontMedium }}>
                <Text style={{ fontFamily: T.fontBold }}>속도와 이동 거리가 평균 대비 낮아지는 추세</Text>입니다. 동일 패턴이 2주 이상 지속되면 신경과 진료 시기를 검토해보세요.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

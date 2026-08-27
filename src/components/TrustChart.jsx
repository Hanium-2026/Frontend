import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import T from '../tokens';
import { smoothPathD, useChartReveal } from './chartPath';

// 시연 신뢰 차트 — Figma trend-card(node 101:177)와 동일한 구성.
//  · 평활선(파랑) = 전체 추세    · raw선(회색) = 매 윈도우 원점수(흔들린 순간이 튀는 선)
//  · 평균선(회색 점선) 하나만 — 위험도 배경 밴드·색상 구분은 이 차트엔 없다(Figma 원본 기준)
// data: [{ raw, smooth }] (0~100). 부모가 폭을 측정해 반응형으로 그린다.
// dangerAt: 위험 신호(원점수 raw가 임계값을 넘긴)가 찍힌 인덱스 배열 — 해당 지점에 빨간 점을 얹는다(선택).
const REF_GRAY = '#B8C2CC'; // Figma trend-card 원본 색 — 톤 팔레트(T.ok/caution/danger)와 무관한 중립 회색이라 토큰화하지 않음

export default function TrustChart({ data, avg, height = 200, dangerAt }) {
  const [w, setW] = useState(0);
  const reveal = useChartReveal(w);
  const PADL = 6, PADR = 6, PADT = 8, PADB = 8;
  const plotW = Math.max(0, w - PADL - PADR);
  const plotH = height - PADT - PADB;
  const y = (v) => PADT + (1 - v / 100) * plotH;
  const n = data.length;
  const x = (i) => PADL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);

  let content = null;
  if (n >= 2 && w > 0) {
    const rd = smoothPathD(data.map((d, i) => [x(i), y(d.raw)]));
    const sd = smoothPathD(data.map((d, i) => [x(i), y(d.smooth)]));
    content = (
      <Animated.View style={{ width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, w] }), height, overflow: 'hidden' }}>
        <Svg width={w} height={height}>
          {/* 평균선 */}
          {avg != null && (
            <Line x1={PADL} y1={y(avg)} x2={PADL + plotW} y2={y(avg)} stroke={REF_GRAY} strokeWidth={1} strokeDasharray="4 4"/>
          )}
          {/* raw 추세선 — 매 윈도우 원점수 */}
          <Path d={rd} fill="none" stroke={REF_GRAY} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round"/>
          {/* 평활 추세선 */}
          <Path d={sd} fill="none" stroke={T.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
          {/* 위험 신호 지점 — raw선 위에 빨간 점으로 표시 */}
          {dangerAt?.map((i) => (
            <Circle key={i} cx={x(i)} cy={y(data[i].raw)} r={4} fill={T.danger} stroke="#fff" strokeWidth={1.5}/>
          ))}
        </Svg>
      </Animated.View>
    );
  }
  return (
    <View
      onLayout={(e) => { const nw = e.nativeEvent.layout.width; if (nw && Math.abs(nw - w) > 1) setW(nw); }}
      style={{ width: '100%', height }}>
      {content}
    </View>
  );
}

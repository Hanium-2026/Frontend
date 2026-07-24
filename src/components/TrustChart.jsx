import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';
import T from '../tokens';

// 시연 신뢰 차트 — "평균이 얼마고 언제 흔들렸나"를 화면 공유로 보여주기 위한 차트.
//  · 평활선(파랑) = 전체 추세    · raw 점 = 매 윈도우 원점수(흔들린 순간이 튀는 점)
//  · 평균선(점선) · 70 기준선   · 위험도 배경 밴드(안정/주의/위험)
// data: [{ raw, smooth }] (0~100). 부모가 폭을 측정해 반응형으로 그린다.
export default function TrustChart({ data, avg, height = 200, threshold = 70 }) {
  const [w, setW] = useState(0);
  const PADL = 6, PADR = 6, PADT = 8, PADB = 8;
  const plotW = Math.max(0, w - PADL - PADR);
  const plotH = height - PADT - PADB;
  const y = (v) => PADT + (1 - v / 100) * plotH;
  const n = data.length;
  const x = (i) => PADL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);

  let content = null;
  if (n >= 2 && w > 0) {
    const pts = data.map((d, i) => [x(i), y(d.smooth)]);
    const sd = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const yOk = y(threshold), yCau = y(50), yBot = PADT + plotH;
    content = (
      <Svg width={w} height={height}>
        {/* 위험도 배경 밴드 */}
        <Rect x={PADL} y={PADT}  width={plotW} height={yOk - PADT}  fill={T.ok}     opacity={0.06}/>
        <Rect x={PADL} y={yOk}   width={plotW} height={yCau - yOk}  fill={T.caution} opacity={0.08}/>
        <Rect x={PADL} y={yCau}  width={plotW} height={yBot - yCau} fill={T.danger}  opacity={0.08}/>
        {/* 70 기준선 */}
        <Line x1={PADL} y1={yOk} x2={PADL + plotW} y2={yOk} stroke={T.ok} strokeWidth={1} strokeDasharray="5 4" opacity={0.7}/>
        {/* 평균선 */}
        {avg != null && (
          <Line x1={PADL} y1={y(avg)} x2={PADL + plotW} y2={y(avg)} stroke={T.blue} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.85}/>
        )}
        {/* 평활 추세선 */}
        <Path d={sd} fill="none" stroke={T.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {/* raw 점 — 흔들린 순간이 색/높이로 드러남 */}
        {data.map((d, i) => {
          const c = d.raw >= threshold ? T.ok : d.raw >= 50 ? T.caution : T.danger;
          return <Circle key={i} cx={x(i)} cy={y(d.raw)} r={2.6} fill={c} opacity={0.85}/>;
        })}
      </Svg>
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

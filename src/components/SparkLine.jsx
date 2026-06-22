import React from 'react';
import Svg, { Path } from 'react-native-svg';
import T from '../tokens';

export default function SparkLine({ data, width = 240, height = 60, color = T.blue, fill = true, min: minProp, max: maxProp }) {
  if (!data || data.length < 2) return null;
  // min/max 미지정 시 데이터 범위로 자동 스케일 (기존 동작). 지정 시 고정 축.
  const min = minProp != null ? minProp : Math.min(...data);
  const max = maxProp != null ? maxProp : Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <Svg width={width} height={height}>
      {fill && <Path d={area} fill={color} opacity={0.12}/>}
      <Path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

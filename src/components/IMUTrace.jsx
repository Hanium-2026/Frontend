import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import T from '../tokens';

export default function IMUTrace({ width = 320, height = 80, color = T.blue, seed = 0 }) {
  const N = 80;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const v = Math.sin(t * Math.PI * 6 + seed) * 0.35
            + Math.sin(t * Math.PI * 18 + seed * 1.7) * 0.18
            + Math.sin(t * Math.PI * 40 + seed * 2.3) * 0.07;
    pts.push(v);
  }
  const step = width / (N - 1);
  const d = pts.map((v, i) => (i === 0 ? 'M' : 'L') + (i * step).toFixed(1) + ' ' + (height / 2 + v * height * 0.4).toFixed(1)).join(' ');
  return (
    <Svg width={width} height={height}>
      <Line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={T.hair} strokeDasharray="2 3"/>
      <Path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

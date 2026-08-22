import React from 'react';
import Svg, { Circle } from 'react-native-svg';

// NEVO 마크 — 네 점(걸음 리듬). 확정 디자인 3a/3e 기준.
export default function Logo({ width = 76, color = '#1B4F9C' }) {
  const height = width * (40 / 76);
  return (
    <Svg width={width} height={height} viewBox="0 0 76 40">
      <Circle cx="8" cy="14" r="6" fill={color}/>
      <Circle cx="28" cy="26" r="6" fill={color}/>
      <Circle cx="48" cy="14" r="6" fill={color}/>
      <Circle cx="68" cy="26" r="6" fill={color}/>
    </Svg>
  );
}

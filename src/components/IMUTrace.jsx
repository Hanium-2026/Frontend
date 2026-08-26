import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import T from '../tokens';
import { smoothPathD, useChartReveal } from './chartPath';

// width 미지정 시 부모 폭을 측정해 꽉 차게 그린다(반응형). 지정 시 그 값 사용(하위호환).
export default function IMUTrace({ width: widthProp, height = 80, color = T.blue, seed = 0, data = null }) {
  const [measured, setMeasured] = useState(0);
  const width = widthProp ?? measured;
  const onLayout = widthProp ? undefined : (e) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - measured) > 1) setMeasured(w);
  };
  const reveal = useChartReveal(width);

  let content = null;
  if (width > 0) {
    let pts;
    if (data && data.length > 1) {
      // 실데이터: 평균(중력 등 DC) 제거 후 최대절대값으로 정규화 → -0.9~0.9
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      let maxAbs = 1e-6;
      for (const v of data) maxAbs = Math.max(maxAbs, Math.abs(v - mean));
      pts = data.map((v) => ((v - mean) / maxAbs) * 0.9);
    } else {
      const N = 80;
      pts = [];
      for (let i = 0; i < N; i++) {
        const t = i / N;
        const v = Math.sin(t * Math.PI * 6 + seed) * 0.35
                + Math.sin(t * Math.PI * 18 + seed * 1.7) * 0.18
                + Math.sin(t * Math.PI * 40 + seed * 2.3) * 0.07;
        pts.push(v);
      }
    }
    const step = width / (pts.length - 1);
    const d = smoothPathD(pts.map((v, i) => [i * step, height / 2 + v * height * 0.4]));
    content = (
      <Animated.View style={{ width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, width] }), height, overflow: 'hidden' }}>
        <Svg width={width} height={height}>
          <Line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={T.hair} strokeDasharray="2 3"/>
          <Path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        </Svg>
      </Animated.View>
    );
  }

  if (widthProp) return content;
  return <View onLayout={onLayout} style={{ width: '100%', height }}>{content}</View>;
}

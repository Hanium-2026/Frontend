import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import T from '../tokens';
import { smoothPathD, useChartReveal } from './chartPath';

// width 미지정 시 부모 폭을 측정해 꽉 차게 그린다(반응형). 지정 시 그 값 사용(하위호환).
export default function SparkLine({ data, width: widthProp, height = 60, color = T.blue, fill = true, min: minProp, max: maxProp }) {
  const [measured, setMeasured] = useState(0);
  const width = widthProp ?? measured;
  const onLayout = widthProp ? undefined : (e) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - measured) > 1) setMeasured(w);
  };
  const reveal = useChartReveal(width);

  let content = null;
  if (data && data.length >= 2 && width > 0) {
    const min = minProp != null ? minProp : Math.min(...data);
    const max = maxProp != null ? maxProp : Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4]);
    const d = smoothPathD(pts);
    const area = d + ` L ${width} ${height} L 0 ${height} Z`;
    content = (
      <Animated.View style={{ width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, width] }), height, overflow: 'hidden' }}>
        <Svg width={width} height={height}>
          {fill && <Path d={area} fill={color} opacity={0.12}/>}
          <Path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </Animated.View>
    );
  }

  if (widthProp) return content;
  return <View onLayout={onLayout} style={{ width: '100%', height }}>{content}</View>;
}

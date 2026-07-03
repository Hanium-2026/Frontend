import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import T from '../tokens';

// width 미지정 시 부모 폭을 측정해 꽉 차게 그린다(반응형). 지정 시 그 값 사용(하위호환).
export default function BarChart({ data, width: widthProp, height = 120, color = T.blue, max, labels }) {
  const [measured, setMeasured] = useState(0);
  const width = widthProp ?? measured;
  const onLayout = widthProp ? undefined : (e) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - measured) > 1) setMeasured(w);
  };

  let content = null;
  if (data && data.length && width > 0) {
    const m = max || Math.max(...data);
    const gap = 4;
    const bw = (width - gap * (data.length - 1)) / data.length;
    content = (
      <Svg width={width} height={height}>
        {data.map((v, i) => {
          const h = (v / m) * (height - 22);
          const x = i * (bw + gap);
          return (
            <React.Fragment key={i}>
              <Rect x={x} y={height - 22 - h} width={bw} height={h} rx={3}
                fill={color} opacity={v >= m * 0.85 ? 1 : 0.65}/>
              {labels && (
                <SvgText x={x + bw / 2} y={height - 6} fontSize={10}
                  fill={T.muted} textAnchor="middle">{labels[i]}</SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    );
  }

  if (widthProp) return content;
  return <View onLayout={onLayout} style={{ width: '100%', height }}>{content}</View>;
}

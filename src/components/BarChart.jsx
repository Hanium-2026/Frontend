import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import T from '../tokens';

export default function BarChart({ data, width = 280, height = 120, color = T.blue, max, labels }) {
  const m = max || Math.max(...data);
  const gap = 4;
  const bw = (width - gap * (data.length - 1)) / data.length;
  return (
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

import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Text from './Text';
import T from '../tokens';
import { smoothPathD, useChartReveal } from './chartPath';

// 일별 점수 추세.
//  · 점수는 «합산되는 양»이 아니라 0~100 척도 위의 위치라 막대가 아니라 선으로 그린다.
//  · y축은 0~100 고정. riskTone의 경계(70)가 의미를 가지므로 데이터에 맞춰 축을 조이지 않는다.
//  · 기록 없는 날은 선을 끊는다 — 높이 0 막대와 달리 0점과 혼동되지 않는다.
//  · band=true면 그날의 min~max를 옅은 띠로 함께 그려 «하루 안 변동»을 보여준다.
// data: [{ label, avg, min, max }] — avg가 null이면 기록 없는 날.
export default function DailyTrend({ data, height = 104, band = false, color = T.blue, threshold = 70 }) {
  const [w, setW] = useState(0);
  const reveal = useChartReveal(w);
  const PAD = 6;
  const INSET = 10;                     // 좌우 끝점이 잘리지 않도록
  const plotH = height - PAD * 2;
  const y = (v) => PAD + (1 - Math.max(0, Math.min(100, v)) / 100) * plotH;
  const n = data.length;
  const x = (i) => (n <= 1 ? w / 2 : INSET + (i / (n - 1)) * (w - INSET * 2));

  // 값이 있는 구간만 이어 그린다(빈 날에서 끊김).
  const runs = [];
  let cur = [];
  data.forEach((d, i) => {
    if (d.avg == null) { if (cur.length) { runs.push(cur); cur = []; } return; }
    cur.push(i);
  });
  if (cur.length) runs.push(cur);

  const line = (run) => smoothPathD(run.map((i) => [x(i), y(data[i].avg)]));

  // min~max 띠: 위쪽(max) 곡선을 그리고 오른쪽 끝에서 아래쪽(min) 곡선으로 되돌아온다.
  // 위·아래 곡선은 각각 부드럽게 잇되, 두 곡선을 잇는 좌우 끝 변만 직선으로 남긴다
  // (서로 다른 두 계열을 하나의 곡선으로 억지로 이으면 이음매가 부자연스럽게 부풀어 오른다).
  const bandPath = (run) => {
    const ok = run.filter((i) => data[i].min != null && data[i].max != null);
    if (ok.length < 2) return null;
    const upperD = smoothPathD(ok.map((i) => [x(i), y(data[i].max)]));
    const lowerD = smoothPathD([...ok].reverse().map((i) => [x(i), y(data[i].min)])).replace(/^M/, 'L');
    return `${upperD} ${lowerD} Z`;
  };

  return (
    <View>
      <View
        onLayout={(e) => {
          const nw = e.nativeEvent.layout.width;
          if (nw && Math.abs(nw - w) > 1) setW(nw);
        }}
        style={{ width: '100%', height }}>
        {w > 0 && (
          <Animated.View style={{ width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, w] }), height, overflow: 'hidden' }}>
            <Svg width={w} height={height}>
              {/* 주의 경계(70). 격자가 아니라 임계선이므로 의미색을 옅게 쓴다. */}
              <Line x1={0} y1={y(threshold)} x2={w} y2={y(threshold)}
                stroke={T.caution} strokeWidth={1} opacity={0.35}/>

              {band && runs.map((run, k) => {
                const d = bandPath(run);
                return d ? <Path key={`b${k}`} d={d} fill={color} opacity={0.12}/> : null;
              })}

              {runs.map((run, k) => (
                run.length >= 2
                  ? <Path key={`l${k}`} d={line(run)} fill="none" stroke={color}
                      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  : null
              ))}

              {data.map((d, i) => (
                d.avg == null ? null : (
                  <Circle key={`d${i}`} cx={x(i)} cy={y(d.avg)} r={4}
                    fill={color} stroke={T.surface} strokeWidth={2}/>
                )
              ))}
            </Svg>
          </Animated.View>
        )}
      </View>

      {/* 요일은 SVG 대신 Text로 — 전역 글씨 배율이 적용된다. */}
      <View style={{ flexDirection: 'row', marginTop: T.sp.xs }}>
        {data.map((d, i) => (
          <Text key={i} style={{
            flex: 1, textAlign: 'center',
            fontSize: T.fs.caption,
            color: d.avg == null ? T.line : T.muted,
            fontFamily: T.fontMedium,
          }}>{d.label}</Text>
        ))}
      </View>
    </View>
  );
}

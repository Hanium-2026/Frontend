import React from 'react';
import { View } from 'react-native';
import T from '../tokens';

// 오늘/이번 측정 점수가 0~100 척도 어디쯤인지 보여주는 바.
// 옅은 띠 = 그 기간의 최저~최고, 진한 마커 = 대표값(오늘 평균 등)의 위치.
export default function RangeBar({ min, max, value, height = 10 }) {
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const hasBand = min != null && max != null;
  const bandLeft = hasBand ? clamp(min) : 0;
  const bandWidth = hasBand ? clamp(max) - bandLeft : 0;
  const markerLeft = value != null ? clamp(value) : null;

  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: T.line, position: 'relative' }}>
      {hasBand && (
        <View style={{
          position: 'absolute', left: `${bandLeft}%`, width: `${bandWidth}%`, top: 0, bottom: 0,
          backgroundColor: T.muted, opacity: 0.35, borderRadius: height / 2,
        }}/>
      )}
      {markerLeft != null && (
        <View style={{
          position: 'absolute', left: `${markerLeft}%`, top: -4, width: 4, height: height + 8,
          borderRadius: 2, backgroundColor: T.ink, marginLeft: -2,
        }}/>
      )}
    </View>
  );
}

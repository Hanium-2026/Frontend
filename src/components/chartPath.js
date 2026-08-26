// SparkLine·DailyTrend·TrustChart 3곳에서 각자 구현하던 "선 그리기 + 진입 애니메이션"을 하나로 모은 것.
// 사용자 피드백: 그래프가 직선(L)으로 이어져 뚝뚝 끊겨 보이고, 화면 진입 시 정적으로 나타난다.
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Catmull-Rom → 3차 베지어 변환(표준 tension 1/6)으로 점들을 부드러운 곡선으로 잇는다.
// 점이 2개뿐이면 곡선을 만들 기준점이 없어 직선(M/L)으로 그린다.
export function smoothPathD(points) {
  if (!points || points.length < 2) return '';
  const f = (n) => n.toFixed(1);
  if (points.length === 2) {
    return `M${f(points[0][0])} ${f(points[0][1])} L${f(points[1][0])} ${f(points[1][1])}`;
  }
  const d = [`M${f(points[0][0])} ${f(points[0][1])}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`);
  }
  return d.join(' ');
}

// 차트가 처음 폭을 측정해 그려지는 시점에 왼쪽→오른쪽으로 그려지는 진입 애니메이션(0~1).
// width가 0→양수로 바뀌는 최초 1회만 실행 — 실시간으로 데이터가 늘어나는 차트(TrustChart)가
// 새 포인트마다 다시 진입 애니메이션을 타지 않도록 한다.
export function useChartReveal(width) {
  const reveal = useRef(new Animated.Value(0)).current;
  const started = useRef(false);
  useEffect(() => {
    if (width > 0 && !started.current) {
      started.current = true;
      Animated.timing(reveal, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [width, reveal]);
  return reveal;
}

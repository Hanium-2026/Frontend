import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';

const STEPS = [
  { label: '보행 가변성 분석 중', delay: 0 },
  { label: '좌우 균형 측정 중', delay: 400 },
  { label: '보행 패턴 평가 중', delay: 800 },
];

export default function AnalyzingScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
    const timer = setTimeout(() => router.replace('/elderly/result'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.iconRing}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>AI</Text>
          </View>
        </View>

        <Text style={styles.title}>AI 분석 중</Text>
        <Text style={styles.subtitle}>보행 데이터를 분석하고 있습니다</Text>

        <View style={styles.stepList}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.stepLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: barWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121B2F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  iconRing: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 32, fontWeight: '800', color: '#121B2F' },

  title: { fontSize: 28, fontWeight: '800', color: colors.surface, marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 36 },

  stepList: { width: '100%', gap: 12, marginBottom: 40 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  stepDot: { width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  stepLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
});

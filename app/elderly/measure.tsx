import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

export default function MeasurementScreen() {
  const [seconds, setSeconds] = useState(0);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
      if (Math.random() > 0.6) setSteps((prev) => prev + 1);
    }, 1000);
    const autoComplete = setTimeout(() => router.replace('/elderly/analyzing'), 15000);
    return () => {
      clearInterval(timer);
      clearTimeout(autoComplete);
    };
  }, []);

  const canStop = seconds >= 5;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.replace('/elderly/main')}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner}>
              <Text style={styles.mainText}>측정</Text>
            </View>
          </View>

          <Text style={styles.title}>측정 중</Text>
          <Text style={styles.subtitle}>평소처럼 편안하게 걸어주세요</Text>

          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>경과 시간</Text>
              <Text style={styles.statValue}>{seconds}<Text style={styles.statUnit}>초</Text></Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>걸음 수</Text>
              <Text style={styles.statValue}>{steps}<Text style={styles.statUnit}>보</Text></Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.stopBtn, !canStop && styles.stopBtnDisabled]}
            onPress={() => canStop && router.replace('/elderly/analyzing')}
            activeOpacity={canStop ? 0.85 : 1}
          >
            <Text style={[styles.stopBtnText, !canStop && styles.stopBtnTextDisabled]}>
              {canStop ? '측정 완료' : `${5 - seconds}초 후 완료 가능`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  safe: { flex: 1 },
  closeBtn: {
    marginTop: 8,
    marginLeft: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: { fontSize: 16, color: colors.surface, fontWeight: '600' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  pulseOuter: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseInner: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },

  title: { fontSize: 28, fontWeight: '800', color: colors.surface, marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 40 },

  stats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 40,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: '600' },
  statValue: { fontSize: 40, fontWeight: '800', color: colors.surface },
  statUnit: { fontSize: 16, fontWeight: '400' },

  stopBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 17,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  stopBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  stopBtnText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  stopBtnTextDisabled: { color: 'rgba(255,255,255,0.5)' },
});

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

const STEPS = [
  { title: '휴대폰을 주머니에 넣어주세요', desc: '바지 앞주머니나 뒷주머니에 단단히 고정해주세요' },
  { title: '평소처럼 걸어주세요', desc: '약 10m 정도 평소 걷던 방식 그대로 걸으시면 됩니다' },
  { title: '안전한 장소에서 측정하세요', desc: '평평하고 장애물이 없는 곳에서 측정해주세요' },
];

export default function MeasurementPrepScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.topCard}>
            <Text style={styles.topTitle}>측정 전 확인해주세요</Text>
            <Text style={styles.topDesc}>정확한 측정을 위해 아래 안내를 따라주세요</Text>
          </View>

          <View style={styles.steps}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.stepCard}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/elderly/measure')}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>측정 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  backBtn: { marginTop: 8, marginLeft: 20, width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.text },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  topCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    marginVertical: 20,
  },
  topTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -0.6 },
  topDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  steps: { gap: 12 },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNum: {
    width: 26,
    height: 26,
    backgroundColor: colors.primary,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { fontSize: 13, fontWeight: '700', color: colors.surface },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  bottomBar: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
  startBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  startBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },
});

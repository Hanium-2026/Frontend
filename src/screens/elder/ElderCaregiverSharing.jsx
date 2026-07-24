import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, Animated } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';

const LABELS = ['일일 걸음 점수', '상세 보행 지표', '위치 정보', '낙상 / 비상 알림'];
const INITIAL = [true, true, false, true];

// 누르면 노브가 미끄러지는 토글 (로컬 표시용 — 저장 API는 준비 중)
function Toggle({ value, onToggle }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value]);
  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [T.line, T.blue] });
  return (
    <Pressable onPress={onToggle} hitSlop={10}>
      <Animated.View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: bg }}>
        <Animated.View style={{ position: 'absolute', top: 2, left, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
      </Animated.View>
    </Pressable>
  );
}

export default function ElderCaregiverSharing() {
  const [states, setStates] = useState(INITIAL);
  const toggle = (i) => setStates((s) => s.map((v, k) => (k === i ? !v : v)));

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="공유하는 정보" sub="보호자에게 어떤 정보를 공유할지 선택해요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {LABELS.map((l, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < LABELS.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <Text style={{ flex: 1, fontSize: T.fs.sub, color: T.ink, fontFamily: T.fontMedium }}>{l}</Text>
                <Toggle value={states[i]} onToggle={() => toggle(i)}/>
              </View>
            ))}
          </Card>
          <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.font, marginTop: 12, lineHeight: 19, paddingHorizontal: 4 }}>
            설정 저장 기능은 준비 중이에요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

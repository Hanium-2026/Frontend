import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';

const STEPS = ['주머니에 넣습니다', '평소처럼 걷습니다', '점수를 확인합니다'];

export default function ElderGuide() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="이용 가이드" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: T.sp.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xs, gap: T.sp.lg }}>
          <Card pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>걸음은 이렇게 측정돼요</Text>
            {STEPS.map((s, i) => (
              <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg, marginTop: T.sp.xl }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  backgroundColor: i === 0 ? T.ink : T.line,
                }}>
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: i === 0 ? '#fff' : T.muted }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{s}</Text>
              </View>
            ))}
          </Card>

          <Card pad={T.sp.xl} style={{ backgroundColor: T.line }}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>분석은 휴대폰 안에서만</Text>
            <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm, lineHeight: T.fs.body * 1.4 }}>
              걸음 신호는 휴대폰에서 분석되고, 서버에는 결과 점수만 저장됩니다.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

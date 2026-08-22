import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';

const SENT_ITEMS = ['걸음 점수와 측정 시각', '이름 · 전화번호 · 신체 정보', '현재 위치'];

export default function ElderPrivacy() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="개인정보 보호" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: T.sp.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xs, gap: T.sp.lg }}>
          <Card pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>
              걸음 신호는{'\n'}휴대폰을 떠나지 않습니다
            </Text>
            <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm, lineHeight: T.fs.body * 1.4 }}>
              센서 값은 기기 안에서 분석되고 지워집니다. 서버로 보내는 것은 세 가지뿐이에요.
            </Text>
          </Card>

          <Card pad={0}>
            {SENT_ITEMS.map((label, i) => (
              <View key={label} style={{
                paddingVertical: T.sp.lg, paddingHorizontal: T.sp.xl,
                borderBottomWidth: i < SENT_ITEMS.length - 1 ? 1 : 0, borderBottomColor: T.line,
              }}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{label}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

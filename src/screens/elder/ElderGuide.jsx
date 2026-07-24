import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';

const STEPS = [
  ['측정 시작하기', '홈 화면에서 “지금 측정하기”를 누르고, 휴대폰을 주머니에 넣은 채 평소처럼 30초 이상 걸어요.'],
  ['점수 확인하기', '걸음 점수는 0~100점이에요. 70점이 넘으면 걸음이 안정적이라는 뜻이에요.'],
  ['기록 살펴보기', '“기록” 탭에서 하루·주간 걸음 점수 변화를 한눈에 볼 수 있어요.'],
  ['보호자 연결하기', '“보호자” 탭에서 연동 코드를 만들어 가족을 연결하면, 이상이 감지될 때 보호자에게 알림이 가요.'],
];

export default function ElderGuide() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="이용 가이드" sub="NEVO 사용법을 알려드려요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 4, gap: 12 }}>
          {STEPS.map(([title, body], i) => (
            <Card key={i} pad={18} style={{ borderRadius: 18, flexDirection: 'row', gap: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontExtraBold, color: T.blue }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: T.fs.h, fontFamily: T.fontBold, color: T.ink }}>{title}</Text>
                <Text style={{ fontSize: T.fs.sub, fontFamily: T.font, color: T.body, marginTop: 6, lineHeight: 24 }}>{body}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

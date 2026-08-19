import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import AppHeader from '../../components/AppHeader';

// 측정 방법 안내(구 ElderMeasureIntro)를 여기로 흡수했다.
// 측정할 때마다 거쳐 가는 화면이 아니라, 다시 보고 싶을 때 찾아오는 곳이다.
const MEASURE_STEPS = [
  { icon: 'phone', title: '휴대폰을 주머니에 넣어요', desc: '바지나 외투 주머니에 넣고 평소처럼 두세요.' },
  { icon: 'walk',  title: '평소처럼 걸어요',          desc: '20초 이상 자연스럽게 걸어주세요.' },
  { icon: 'spark', title: '걸음 점수를 확인해요',      desc: '처음 몇 초는 측정 준비 시간이에요. 곧 점수가 나타나요.' },
];

const APP_STEPS = [
  ['점수 확인하기', '걸음 점수는 0~100점이에요. 70점이 넘으면 걸음이 안정적이라는 뜻이에요.'],
  ['기록 살펴보기', '“기록” 탭에서 하루·주간 걸음 점수 변화를 한눈에 볼 수 있어요.'],
  ['보호자 연결하기', '“보호자” 탭에서 연동 코드를 만들어 가족을 연결하면, 이상이 감지될 때 보호자에게 알림이 가요.'],
];

export default function ElderGuide() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="이용 가이드" sub="NEVO 사용법을 알려드려요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: T.sp.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xs }}>
          <SectionLabel>측정은 이렇게 해요</SectionLabel>
          <View style={{ gap: T.sp.md }}>
            {MEASURE_STEPS.map((s, i) => {
              const Glyph = Icon[s.icon];
              return (
                <Card key={i} pad={T.sp.lg} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: T.radius.md, backgroundColor: T.blueSoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Glyph width={28} height={28} color={T.blue}/>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.sm }}>
                      <View style={{
                        width: 22, height: 22, borderRadius: 11, backgroundColor: T.blue,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontExtraBold, color: '#fff' }}>{i + 1}</Text>
                      </View>
                      <Text style={{ flex: 1, fontSize: T.fs.h, fontFamily: T.fontBold, color: T.ink }}>{s.title}</Text>
                    </View>
                    <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.font, marginTop: T.sp.sm, lineHeight: 24 }}>
                      {s.desc}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xl }}>
          <SectionLabel>앱 사용법</SectionLabel>
          <View style={{ gap: T.sp.md }}>
            {APP_STEPS.map(([title, body], i) => (
              <Card key={i} pad={T.sp.lg} style={{ flexDirection: 'row', gap: T.sp.md }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18, backgroundColor: T.blueSoft,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.fontExtraBold, color: T.blue }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: T.fs.h, fontFamily: T.fontBold, color: T.ink }}>{title}</Text>
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.font, color: T.body, marginTop: T.sp.xs, lineHeight: 24 }}>
                    {body}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xl }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: T.sp.md,
            backgroundColor: T.blueWash, borderRadius: T.radius.md, padding: T.sp.lg,
            borderWidth: 1, borderColor: T.blueSoft,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: T.radius.sm, backgroundColor: T.surface,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.shield width={20} height={20} color={T.blue}/>
            </View>
            <Text style={{ flex: 1, fontSize: T.fs.caption, color: T.body, fontFamily: T.font, lineHeight: 21 }}>
              측정 데이터는 <Text style={{ fontFamily: T.fontBold, color: T.ink }}>휴대폰 안에서만</Text> 분석돼요. 안심하고 걸어주세요.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

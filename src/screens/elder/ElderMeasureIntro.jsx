import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';

const STEPS = [
  { icon: 'phone', title: '휴대폰을 주머니에 넣어요', desc: '바지나 외투 주머니에 넣고 평소처럼 두세요.' },
  { icon: 'walk', title: '평소처럼 걸어요', desc: '30초에서 1분 정도 자연스럽게 걸어주세요.' },
  { icon: 'spark', title: '걸음 점수를 확인해요', desc: '처음 몇 초는 측정 준비 시간이에요. 곧 점수가 나타나요.' },
];

export default function ElderMeasureIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient
        colors={[T.blue, T.blueDark]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 34, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' }}/>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={20} height={20} color="#fff"/>
          </Pressable>
        </View>
        <View style={{ marginTop: 18 }}>
          <Text style={{ fontSize: 28, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -0.6 }}>걸음 측정 방법</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.92)', fontFamily: T.font, marginTop: 8, lineHeight: 23 }}>
            아래 3단계만 따라 하면 돼요.{'\n'}준비되면 측정을 시작해 주세요.
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {STEPS.map((s, i) => {
          const Glyph = Icon[s.icon];
          return (
            <Card key={i} pad={18} style={{ borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Glyph width={30} height={30} color={T.blue}/>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontFamily: T.fontExtraBold, color: '#fff' }}>{i + 1}</Text>
                  </View>
                  <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.3 }}>{s.title}</Text>
                </View>
                <Text style={{ fontSize: 15, color: T.body, marginTop: 7, fontFamily: T.font, lineHeight: 22 }}>{s.desc}</Text>
              </View>
            </Card>
          );
        })}

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: T.blueWash, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.blueSoft, marginTop: 4 }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.shield width={20} height={20} color={T.blue}/>
          </View>
          <Text style={{ flex: 1, fontSize: 14.5, color: T.body, fontFamily: T.fontMedium, lineHeight: 21 }}>
            측정 데이터는 <Text style={{ fontFamily: T.fontBold, color: T.ink }}>휴대폰 안에서만</Text> 분석돼요. 안심하고 걸어주세요.
          </Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16), paddingTop: 10, backgroundColor: T.bg }}>
        <Pressable
          onPress={() => router.replace('/(elder)/measure')}
          style={({ pressed }) => ({
            height: 62, borderRadius: 18, backgroundColor: pressed ? T.blueDark : T.blue,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            shadowColor: T.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 5,
          })}>
          <Icon.walk width={24} height={24} color="#fff"/>
          <Text style={{ fontSize: 19, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -0.3 }}>측정 시작</Text>
        </Pressable>
      </View>
    </View>
  );
}

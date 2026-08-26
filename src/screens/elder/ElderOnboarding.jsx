import React, { useRef, useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Card from '../../components/Card';
import Button from '../../components/Button';

// 최초 1회 온보딩. 3장 모두 같은 구조(일러스트+제목+설명) — 앱 소개 · 상시 측정 안내 · 기기 내 분석.
const PAGES = [
  { title: '걷기만 하면 됩니다', body: '휴대폰을 주머니에 넣고 평소처럼 걸으시면, 걸음의 변화를 앱이 알아서 살펴봅니다.' },
  { title: '하루 종일 지켜봐요', body: '따로 버튼을 누르지 않아도 괜찮아요. 평소 걸음에서 변화가 생기면 앱이 먼저 알아차려요.' },
  { title: '분석은 휴대폰 안에서만', body: '걸음 신호는 기기 안에서 분석되고, 서버에는 결과 점수만 저장돼요.' },
];

export default function ElderOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);

  const goTo = (i) => {
    setPage(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const handleNext = () => {
    if (page < PAGES.length - 1) goTo(page + 1);
    else router.push('/(auth)/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}>
        {PAGES.map((p) => (
          <View key={p.title} style={{ width, justifyContent: 'center', paddingHorizontal: T.sp.lg }}>
            <Card pad={T.sp.xl}>
              <View style={{ height: 200, borderRadius: T.radius.md, backgroundColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: T.fs.caption, color: T.muted }}>일러스트 자리</Text>
              </View>
              <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35, marginTop: T.sp.xl }}>
                {p.title}
              </Text>
              <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm, lineHeight: T.fs.body * 1.6 }}>
                {p.body}
              </Text>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.md, paddingBottom: Math.max(insets.bottom, T.sp.xl), gap: T.sp.lg }}>
        <View style={{ flexDirection: 'row', gap: T.sp.sm, justifyContent: 'center' }}>
          {PAGES.map((p, i) => (
            <View key={p.title} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i === page ? T.ink : T.line }}/>
          ))}
        </View>
        <Button onPress={handleNext}>{page < PAGES.length - 1 ? '다음' : '시작하기'}</Button>
      </View>
    </View>
  );
}

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Pressable, ScrollView, Animated, Easing, useWindowDimensions } from 'react-native';
import Text from '../../components/Text';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import TabBar from '../../components/TabBar';
import Avatar from '../../components/Avatar';
import BarChart from '../../components/BarChart';
import ElderTopBlock from '../../components/ElderTopBlock';
import { getMe } from '../../api/user';
import { getMyGuardians } from '../../api/links';
import { getDailyReport } from '../../api/reports';
import { riskTone } from '../../risk';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const roundN = (n) => (n == null ? 0 : Math.round(n));

const TONE_COLOR = { ok: T.ok, caution: T.caution, danger: T.danger };

// 점수 → 상태 라벨/색 (노인이 한눈에 알 수 있도록 색으로도 구분). 색 기준은 공통 riskTone.
const statusOf = (score) => {
  if (score == null) return { label: '측정해 주세요', dot: 'rgba(255,255,255,0.6)' };
  const tone = riskTone(score);
  return {
    label: tone === 'ok' ? '안정적이에요' : tone === 'caution' ? '주의가 필요해요' : '관리가 필요해요',
    dot: TONE_COLOR[tone],
  };
};

const ELDER_TABS = [
  { icon: 'home', label: '홈', path: '/(elder)/' },
  { icon: 'walk', label: '걷기', path: '/(elder)/measure-intro' },
  { icon: 'history', label: '기록', path: '/(elder)/history' },
  { icon: 'family', label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user', label: '내정보', path: '/(elder)/profile' },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ElderHome() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [guardians, setGuardians] = useState([]);
  const [daily, setDaily] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getMe().then((m) => { if (alive) setName(m?.name || ''); }).catch(() => {});
      getMyGuardians().then((list) => { if (alive) setGuardians(list ?? []); }).catch(() => {
        if (alive) setGuardians([]);
      });
      getDailyReport().then((d) => { if (alive) setDaily(d?.dailyScores ?? []); }).catch(() => {
        if (alive) setDaily([]);
      });
      return () => { alive = false; };
    }, [])
  );

  const trend = daily.map((d) => roundN(d.avgScore));
  const dayLabels = daily.map((d) => WEEKDAY[new Date(d.date).getDay()]);
  const weeklyAvg = trend.length ? roundN(trend.reduce((a, b) => a + b, 0) / trend.length) : null;
  const todayScore = trend.length ? trend[trend.length - 1] : null;
  const status = statusOf(todayScore);

  // 화면 높이에 맞춰 상단 블록·점수 링을 줄여, 작은 폰에서도 본문이 한 화면에 들어오도록 한다.
  // (작은 폰 = 컴팩트. 아래 숫자는 실기기에서 보고 미세조정하면 됨)
  const { height: winH } = useWindowDimensions();
  const compact = winH < 760;
  const topMinH = compact ? 208 : 248;   // 상단 파란 블록 최소 높이 (기존 296)
  const topPadB = compact ? 18 : 28;     // 블록 안쪽 하단 여백 (기존 44)
  const RING = compact ? 96 : 116;       // 점수 링 지름 (기존 120)
  const R = RING / 2 - 10;               // 링 반지름(획 두께 10 고려)
  const CIRC = 2 * Math.PI * R;
  const scoreFs = compact ? 38 : 44;     // 큰 점수 글자 (기존 44)
  const gap = compact ? 10 : 14;         // 본문 카드 간 간격 (기존 14~18)

  // 점수 카운트업 + 링 채우기 (데모 임팩트 + 변화 이해 도움)
  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (todayScore == null) { setDisplay(0); return; }
    progress.setValue(0);
    const id = progress.addListener(({ value }) => setDisplay(Math.round(value * todayScore)));
    Animated.timing(progress, {
      toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, [todayScore]);

  const clamped = Math.max(0, Math.min(100, todayScore ?? 0));
  const ringOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, CIRC * (1 - clamped / 100)],
  });

  const guardianCount = guardians.length;
  const guardianPreview = guardians.slice(0, 2);
  const guardianNames = guardianPreview.map((g) => g.name).filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ElderTopBlock minHeight={topMinH} padBottom={topPadB}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', fontFamily: T.font }}>오늘도 함께 걸어요</Text>
            <Text style={{ fontSize: 28, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 4, letterSpacing: -0.6 }}>
              {name ? `${name}님, 안녕하세요` : '반갑습니다'}
            </Text>
          </View>
          <Pressable style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.bell width={24} height={24} color="#fff"/>
            <View style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#FCD34D', borderWidth: 1.5, borderColor: T.blue }}/>
          </Pressable>
        </View>

        <View style={{ marginTop: compact ? 14 : 20, flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
              <Circle cx={RING / 2} cy={RING / 2} r={R} stroke="rgba(255,255,255,0.22)" strokeWidth="10" fill="none"/>
              <AnimatedCircle
                cx={RING / 2} cy={RING / 2} r={R} stroke="#fff" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset}
                transform={`rotate(-90 ${RING / 2} ${RING / 2})`}/>
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontSize: scoreFs, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -1 }}>
                {todayScore == null ? '--' : display}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: T.font, color: 'rgba(255,255,255,0.75)', marginTop: -2 }}>/ 100점</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: status.dot }}/>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontFamily: T.fontSemiBold }}>오늘의 걸음 건강</Text>
            </View>
            <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: '#fff', marginTop: 6, letterSpacing: -0.5 }}>{status.label}</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontFamily: T.font, lineHeight: 21 }}>
              7일 평균 <Text style={{ fontFamily: T.fontBold }}>{weeklyAvg ?? '--'}점</Text>
            </Text>
          </View>
        </View>
      </ElderTopBlock>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 주요 행동: 측정 시작 — 풀폭 큰 버튼 */}
        <View style={{ paddingHorizontal: 16, marginTop: compact ? 12 : 18 }}>
          <Pressable
            onPress={() => router.push('/(elder)/measure-intro')}
            style={({ pressed }) => ({
              borderRadius: 20, backgroundColor: pressed ? T.blueDark : T.blue,
              paddingVertical: 18, paddingHorizontal: 20,
              flexDirection: 'row', alignItems: 'center', gap: 16,
              shadowColor: T.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 5,
            })}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.walk width={34} height={34} color="#fff"/>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 21, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -0.3 }}>지금 측정하기</Text>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', marginTop: 3, fontFamily: T.font }}>30초 동안 평소처럼 걸어주세요</Text>
            </View>
            <Icon.chevron width={22} height={22} color="#fff"/>
          </Pressable>
        </View>

        {/* 보호자 연결 */}
        <View style={{ paddingHorizontal: 16, marginTop: gap }}>
          <Pressable onPress={() => router.push('/(elder)/caregiver')}>
            <Card pad={16} style={{ borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {guardianCount > 0 ? (
                <View style={{ flexDirection: 'row' }}>
                  {guardianPreview.map((g, i) => (
                    <View key={g.guardianUserId ?? i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                      <Avatar name={g.name || '보호자'} size={44}/>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.family width={26} height={26} color={T.blue}/>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: T.ink }}>
                  {guardianCount > 0 ? `연결된 보호자 ${guardianCount}명` : '보호자 연결하기'}
                </Text>
                <Text style={{ fontSize: 14, color: T.body, marginTop: 3, fontFamily: T.font, lineHeight: 19 }}>
                  {guardianCount > 0 ? `${guardianNames || '보호자'}님과 결과를 공유 중이에요` : '보호자 전화번호로 연동 코드를 만들 수 있어요'}
                </Text>
              </View>
              <Icon.chevron width={20} height={20} color={T.muted}/>
            </Card>
          </Pressable>
        </View>

        {/* 이번 주 추이 — 기록 있으면 차트, 없으면 측정 안내 */}
        <View style={{ paddingHorizontal: 16, marginTop: gap }}>
          {trend.length > 0 ? (
            <Pressable onPress={() => router.push('/(elder)/history')}>
              <Card pad={18} style={{ borderRadius: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ fontSize: 14, color: T.body, fontFamily: T.fontSemiBold }}>이번 주 평균</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: 4 }}>
                      <Text style={{ fontSize: 32, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>{weeklyAvg ?? '--'}</Text>
                      <Text style={{ fontSize: 15, color: T.muted, marginBottom: 5 }}>점</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.blueDark }}>자세히</Text>
                    <Icon.chevron width={15} height={15} color={T.blueDark}/>
                  </View>
                </View>
                <View style={{ marginTop: 14 }}>
                  <BarChart data={trend} height={104} color={T.blue} max={100} labels={dayLabels}/>
                </View>
              </Card>
            </Pressable>
          ) : (
            <Card pad={20} style={{ borderRadius: 20, alignItems: 'center' }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.walk width={28} height={28} color={T.blue}/>
              </View>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink, marginTop: 12 }}>아직 측정 기록이 없어요</Text>
              <Text style={{ fontSize: T.fs.label, color: T.body, marginTop: 4, textAlign: 'center', lineHeight: 21 }}>지금 측정하면 여기에 걸음 건강이 기록돼요</Text>
            </Card>
          )}
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={0}/>
    </View>
  );
}

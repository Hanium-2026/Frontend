import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import RangeBar from '../../components/RangeBar';
import TabBar from '../../components/TabBar';
import DailyTrend from '../../components/DailyTrend';
import { getMe } from '../../api/user';
import { getMyGuardians } from '../../api/links';
import { getDailyReport } from '../../api/reports';
import { riskTone, RISK_LABEL } from '../../risk';
import { fillDays } from '../../daily';

const ELDER_TABS = [
  { label: '홈', path: '/(elder)/' },
  { label: '기록', path: '/(elder)/history' },
  { label: '보호자', path: '/(elder)/caregiver' },
  { label: '내정보', path: '/(elder)/profile' },
];

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export default function ElderHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const days = useMemo(() => fillDays(daily), [daily]);
  const today = days[6].row;
  const filled = days.filter((d) => d.row);
  const weeklyAvg = filled.length
    ? Math.round(filled.reduce((a, d) => a + d.row.avgScore, 0) / filled.length)
    : null;

  const todayScore = today ? Math.round(today.avgScore) : null;
  const yesterday = days[5].row;
  const delta = todayScore != null && yesterday ? todayScore - Math.round(yesterday.avgScore) : null;
  const tone = today ? riskTone(todayScore) : 'ok';
  const subtitle = today == null
    ? '오늘은 아직 걸음이 모이지 않았어요'
    : delta == null ? '오늘 첫 기록이에요'
    : delta === 0 ? '어제와 같아요'
    : delta > 0 ? `어제보다 ${delta}점 높아요`
    : `어제보다 ${-delta}점 낮아요`;

  const now = new Date();
  const todayLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAY[now.getDay()]}요일`;

  const guardianCount = guardians.length;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{
        paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.xl, paddingBottom: T.sp.sm,
      }}>
        <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{todayLabel}</Text>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, marginTop: 2 }}>
          {name ? `${name}님, 안녕하세요` : '반갑습니다'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* 오늘 걸음 건강 점수 — 화면의 주인공. 색 운반체는 상태 칩 하나뿐. */}
        <View style={{ paddingHorizontal: T.sp.lg }}>
          <Card pad={T.sp.xl}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: T.sp.md }}>
              <View>
                <Text style={{ fontSize: T.fs.body, color: T.muted }}>오늘 걸음 건강 점수</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <Text style={{
                    fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink,
                    lineHeight: T.fs.display * 1.1,
                  }}>{todayScore ?? '--'}</Text>
                  <Text style={{ fontSize: T.fs.body, color: T.muted }}>점</Text>
                </View>
              </View>
              {today && <Pill tone={tone} size="lg">{RISK_LABEL[tone]}</Pill>}
            </View>

            <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>{subtitle}</Text>

            {today && (
              <View style={{ marginTop: T.sp.xl }}>
                <RangeBar min={today.minScore} max={today.maxScore} value={todayScore}/>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: T.sp.sm }}>
                  <Text style={{ fontSize: T.fs.body, color: T.muted }}>0</Text>
                  <Text style={{ fontSize: T.fs.body, color: T.muted }}>100</Text>
                </View>
                <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: T.sp.xs }}>
                  보행 {today.sessionCount ?? '--'}번 · 최저 {Math.round(today.minScore)} · 최고 {Math.round(today.maxScore)}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* 지난 7일 — 기록 없는 날도 자리를 비워 둔 채 보여준다(압축하지 않는다). */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
          {filled.length > 0 ? (
            <Pressable onPress={() => router.push('/(elder)/history')}>
              <Card pad={T.sp.xl}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>지난 7일</Text>
                  <Text style={{ fontSize: T.fs.body, color: T.muted }}>평균 {weeklyAvg}점</Text>
                </View>
                <View style={{ marginTop: T.sp.lg }}>
                  <DailyTrend
                    data={days.map((d) => ({
                      label: d.label,
                      avg: d.row ? Math.round(d.row.avgScore) : null,
                      min: d.row?.minScore,
                      max: d.row?.maxScore,
                    }))}
                    height={104}
                    band
                  />
                </View>
              </Card>
            </Pressable>
          ) : (
            <Card pad={T.sp.xl} style={{ alignItems: 'center' }}>
              <View style={{
                width: 52, height: 52, borderRadius: T.radius.md, backgroundColor: T.blueSoft,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.walk width={28} height={28} color={T.blue}/>
              </View>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink, marginTop: T.sp.md }}>
                아직 기록이 없어요
              </Text>
              <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: T.sp.xs, textAlign: 'center' }}>
                걸으시면 여기에 걸음 건강이 쌓여요
              </Text>
            </Card>
          )}
        </View>

        {/* 보호자 / 직접 측정 — 상시 측정이 목표라 측정 CTA는 작은 카드 하나로 충분하다. */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg, flexDirection: 'row', gap: T.sp.lg }}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(elder)/caregiver')}>
            <Card pad={T.sp.lg} style={{ minHeight: 56 }}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>보호자</Text>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink, marginTop: 2 }}>
                {guardianCount > 0 ? `${guardianCount}명 연결됨` : '연결하기 →'}
              </Text>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(elder)/measure')}>
            <Card pad={T.sp.lg} style={{ minHeight: 56 }}>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>직접 측정</Text>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink, marginTop: 2 }}>
                지금 걷기 →
              </Text>
            </Card>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={0}/>
    </View>
  );
}

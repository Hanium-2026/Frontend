import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import TabBar from '../../components/TabBar';
import Avatar from '../../components/Avatar';
import DailyTrend from '../../components/DailyTrend';
import { getMe } from '../../api/user';
import { getMyGuardians } from '../../api/links';
import { getDailyReport } from '../../api/reports';
import { riskTone, RISK_LABEL } from '../../risk';
import { fillDays } from '../../daily';

const ELDER_TABS = [
  { icon: 'home', label: '홈', path: '/(elder)/' },
  { icon: 'history', label: '기록', path: '/(elder)/history' },
  { icon: 'family', label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user', label: '내정보', path: '/(elder)/profile' },
];

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
  const yesterday = days[5].row;
  const todayScore = today ? Math.round(today.avgScore) : null;
  const delta = todayScore != null && yesterday ? todayScore - Math.round(yesterday.avgScore) : null;

  const filled = days.filter((d) => d.row);
  const weeklyAvg = filled.length
    ? Math.round(filled.reduce((a, d) => a + d.row.avgScore, 0) / filled.length)
    : null;

  const tone = today ? riskTone(todayScore) : 'neutral';
  const statusLabel = today ? RISK_LABEL[tone] : '기록 없음';

  const subtitle = today == null
    ? '오늘은 아직 걸음이 모이지 않았어요.'
    : delta == null ? '오늘 첫 기록이에요.'
    : delta === 0 ? '어제와 같아요.'
    : delta > 0 ? `어제보다 ${delta}점 높아요.`
    : `어제보다 ${-delta}점 낮아요.`;

  const guardianCount = guardians.length;
  const guardianPreview = guardians.slice(0, 2);
  const guardianNames = guardianPreview.map((g) => g.name).filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* 헤더 — 오늘 상태. 긴급은 스크롤 밖에 고정한다(위급할 때 찾아 내려갈 수 없다). */}
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.xl, paddingBottom: T.sp.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: T.fs.body, color: T.body, fontFamily: T.fontMedium }}>
            {name ? `${name}님, 안녕하세요` : '반갑습니다'}
          </Text>
          <Pressable
            onPress={() => router.push('/(elder)/sos')}
            hitSlop={10}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: T.sp.xs,
              height: 44, paddingHorizontal: T.sp.md,
              borderRadius: T.radius.pill,
              backgroundColor: pressed ? T.dangerSoft : T.surface,
              borderWidth: 1, borderColor: T.dangerSoft,
            })}>
            <Icon.sos width={20} height={20} color={T.danger}/>
            <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontBold, color: T.danger }}>긴급</Text>
          </Pressable>
        </View>

        {/* 점수는 크기로만 존재감을 만든다. 색 운반체는 아래 상태 칩 하나뿐. */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: T.sp.lg }}>
          <Text style={{
            fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink,
            letterSpacing: -1.5, lineHeight: T.fs.display * 1.05,
          }}>
            {todayScore ?? '--'}
          </Text>
          <Text style={{ fontSize: T.fs.body, color: T.muted, marginLeft: T.sp.xs, marginBottom: 6 }}>점</Text>
          <View style={{ flex: 1 }}/>
          <View style={{ marginBottom: 8 }}>
            <Pill tone={tone}>{statusLabel}</Pill>
          </View>
        </View>

        <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.font, marginTop: T.sp.sm }}>
          {subtitle}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* 오늘 — 평균 하나로는 «가끔 나쁨»이 보이지 않아 범위를 함께 둔다. */}
        {today && (
          <View style={{ paddingHorizontal: T.sp.lg }}>
            <Card pad={T.sp.xl}>
              <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>오늘</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: T.sp.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: T.fs.title, fontFamily: T.fontExtraBold, color: T.ink }}>
                    {today.sessionCount ?? '--'}
                    <Text style={{ fontSize: T.fs.body, color: T.muted, fontFamily: T.font }}>번</Text>
                  </Text>
                  <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: T.sp.xs }}>보행</Text>
                </View>
                <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: T.hair }}/>
                <View style={{ flex: 1, paddingLeft: T.sp.xl }}>
                  <Text style={{ fontSize: T.fs.title, fontFamily: T.fontExtraBold, color: T.ink }}>
                    {today.minScore == null || today.maxScore == null
                      ? '--'
                      : `${Math.round(today.minScore)}~${Math.round(today.maxScore)}`}
                  </Text>
                  <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: T.sp.xs }}>점수 범위</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* 지난 7일 — 기록 없는 날도 자리를 비워 둔 채 보여준다(압축하지 않는다). */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: today ? T.sp.lg : 0 }}>
          {filled.length > 0 ? (
            <Pressable onPress={() => router.push('/(elder)/history')}>
              <Card pad={T.sp.xl}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>지난 7일</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: T.sp.xs }}>
                      <Text style={{ fontSize: T.fs.title, fontFamily: T.fontExtraBold, color: T.ink }}>{weeklyAvg}</Text>
                      <Text style={{ fontSize: T.fs.body, color: T.muted, marginLeft: 3, marginBottom: 2 }}>점 평균</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.xs, marginBottom: 2 }}>
                    <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontBold, color: T.blue }}>자세히</Text>
                    <Icon.chevron width={15} height={15} color={T.blue}/>
                  </View>
                </View>
                <View style={{ marginTop: T.sp.lg }}>
                  <DailyTrend
                    data={days.map((d) => ({
                      label: d.label,
                      avg: d.row ? Math.round(d.row.avgScore) : null,
                    }))}
                    height={104}
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

        {/* 보호자 */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
          <Pressable onPress={() => router.push('/(elder)/caregiver')}>
            <Card pad={T.sp.lg} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
              {guardianCount > 0 ? (
                <View style={{ flexDirection: 'row' }}>
                  {guardianPreview.map((g, i) => (
                    <View key={g.guardianUserId ?? i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                      <Avatar name={g.name || '보호자'} size={44}/>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{
                  width: 48, height: 48, borderRadius: T.radius.md, backgroundColor: T.blueSoft,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon.family width={26} height={26} color={T.blue}/>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink }}>
                  {guardianCount > 0 ? `연결된 보호자 ${guardianCount}명` : '보호자 연결하기'}
                </Text>
                <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3 }}>
                  {guardianCount > 0
                    ? `${guardianNames || '보호자'}님과 결과를 공유 중이에요`
                    : '보호자 전화번호로 연동 코드를 만들 수 있어요'}
                </Text>
              </View>
              <Icon.chevron width={20} height={20} color={T.muted}/>
            </Card>
          </Pressable>
        </View>

        {/* 지금 상태 보기 — 상시 측정이 목표이므로 주요 행동이 아니다(카드 하나로 강등). */}
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
          <Pressable onPress={() => router.push('/(elder)/measure')}>
            <Card pad={T.sp.lg} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.lg }}>
              <View style={{
                width: 48, height: 48, borderRadius: T.radius.md, backgroundColor: T.blueSoft,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.walk width={26} height={26} color={T.blue}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink }}>지금 상태 보기</Text>
                <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3 }}>
                  걷는 동안 실시간으로 확인할 수 있어요
                </Text>
              </View>
              <Icon.chevron width={20} height={20} color={T.muted}/>
            </Card>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={0}/>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import DailyTrend from '../../components/DailyTrend';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getDailyReport } from '../../api/reports';
import { riskTone, RISK_LABEL } from '../../risk';
import { fillDays } from '../../daily';

const ELDER_TABS = [
  { label: '홈', path: '/(elder)/' },
  { label: '기록', path: '/(elder)/history' },
  { label: '보호자', path: '/(elder)/caregiver' },
  { label: '내정보', path: '/(elder)/profile' },
];

const round = (n) => (n == null ? 0 : Math.round(n));

// "오늘 14:14" / "어제 18:01" / "5/16 17:45"
function fmtWhen(iso) {
  const d = new Date(iso);
  const now = new Date();
  const dayDiff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (dayDiff === 0) return `오늘 ${hm}`;
  if (dayDiff === 1) return `어제 ${hm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

export default function ElderHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);   // { dailyScores, sessions }

  useEffect(() => {
    getDailyReport()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const daily = data?.dailyScores ?? [];
  const sessions = data?.sessions ?? [];
  const days = fillDays(daily);
  const recorded = days.filter((d) => d.row).map((d) => round(d.row.avgScore));
  const weeklyAvg = recorded.length ? Math.round(recorded.reduce((a, b) => a + b, 0) / recorded.length) : null;
  const delta = recorded.length >= 2 ? round(recorded[recorded.length - 1] - recorded[0]) : null;

  // 기간 요약 — 백엔드 dailyScores가 주는 일별 집계를 합산.
  const totalSessions = daily.reduce((a, d) => a + (d.sessionCount ?? 0), 0);
  const totalDanger = daily.reduce((a, d) => a + (d.dangerCount ?? 0), 0);
  const mins = daily.map((d) => d.minScore).filter((v) => v != null);
  const maxs = daily.map((d) => d.maxScore).filter((v) => v != null);
  const scoreRange = mins.length && maxs.length
    ? `${round(Math.min(...mins))}~${round(Math.max(...maxs))}`
    : '--';

  const records = sessions.map((s) => {
    const tone = riskTone(s.avgScore, s.riskLevel);
    return {
      key: s.sessionId,
      d: fmtWhen(s.createdAt),
      s: round(s.avgScore),
      t: tone,
      n: s.symmetryScore != null ? `좌우 대칭 ${round(s.symmetryScore)}%` : RISK_LABEL[tone],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="기록"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <ActivityIndicator color={T.blue}/>
          </View>
        ) : (sessions.length === 0 && daily.length === 0) ? (
          <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
            <Icon.history width={40} height={40} color={T.line}/>
            <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center', lineHeight: 24 }}>아직 측정 기록이 없어요.{'\n'}걷기 화면에서 측정을 시작해 보세요.</Text>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xs }}>
              <Card pad={T.sp.xl}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: T.fs.caption, color: T.muted }}>7일 평균</Text>
                  {delta != null && delta !== 0 && (
                    <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: delta > 0 ? T.ok : T.caution }}>
                      {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display * 1.1 }}>
                  {weeklyAvg ?? '--'}
                </Text>

                {recorded.length > 0 && (
                  <>
                    <View style={{ marginTop: T.sp.md }}>
                      <DailyTrend
                        data={days.map((d) => ({
                          label: d.label,
                          avg: d.row ? round(d.row.avgScore) : null,
                          min: d.row?.minScore,
                          max: d.row?.maxScore,
                        }))}
                        height={104}
                        band
                      />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.sm, marginTop: T.sp.xs }}>
                      <View style={{ width: 16, height: 10, borderRadius: 2, backgroundColor: T.line }}/>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted }}>띠는 그날의 최저~최고예요</Text>
                    </View>
                  </>
                )}
              </Card>
            </View>

            <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
              <Card pad={T.sp.lg} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[
                  ['측정', `${totalSessions}번`, T.ink],
                  ['범위', scoreRange, T.ink],
                  ['위험', `${totalDanger}회`, totalDanger > 0 ? T.danger : T.ink],
                ].map(([l, v, c]) => (
                  <View key={l}>
                    <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{l}</Text>
                    <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: c, marginTop: 2 }}>{v}</Text>
                  </View>
                ))}
              </Card>
            </View>

            <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
              <SectionLabel>측정 기록</SectionLabel>
              <Card pad={0}>
                {records.length === 0 && (
                  <View style={{ padding: T.sp.xl, alignItems: 'center' }}>
                    <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>표시할 세션이 없어요.</Text>
                  </View>
                )}
                {records.map((r, i) => (
                  <Pressable
                    key={r.key}
                    onPress={() => router.push({ pathname: '/(elder)/session-detail', params: { sessionId: String(r.key) } })}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      minHeight: 56, paddingVertical: T.sp.md, paddingHorizontal: T.sp.xl,
                      borderBottomWidth: i < records.length - 1 ? 1 : 0, borderBottomColor: T.line,
                    }}>
                    <View>
                      <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{r.d}</Text>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 2 }}>{r.n}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
                      <Pill tone={r.t} size="sm">{RISK_LABEL[r.t]}</Pill>
                      <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{r.s}</Text>
                    </View>
                  </Pressable>
                ))}
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={1}/>
    </View>
  );
}

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

// 세션 위험도 톤 → 아이콘 배경/글자 색
const TONE_BG = { ok: T.blueSoft, caution: T.cautionSoft, danger: T.dangerSoft };
const TONE_FG = { ok: T.blue, caution: '#8B5A06', danger: '#9B1B1B' };

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
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
  const weeklyAvg = recorded.length ? (recorded.reduce((a, b) => a + b, 0) / recorded.length) : null;
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
    const noteByTone = tone === 'danger' ? '위험 의심' : tone === 'caution' ? '이상 의심' : '안정';
    return {
      key: s.sessionId,
      d: fmtWhen(s.createdAt),
      s: round(s.avgScore),
      t: tone,
      n: s.symmetryScore != null ? `좌우대칭 ${round(s.symmetryScore)}%` : noteByTone,
      icon: 'walk',
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="기록" sub="지난 7일의 걸음 건강"/>

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
            <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
              <Card pad={16} style={{ borderRadius: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ fontSize: T.fs.caption, color: T.body, fontFamily: T.fontSemiBold, letterSpacing: 0.2 }}>최근 7일 평균</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 32, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>{weeklyAvg != null ? weeklyAvg.toFixed(1) : '--'}</Text>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted, marginBottom: 5 }}>점</Text>
                    </View>
                  </View>
                  {delta != null && delta !== 0 && (
                    <Pill tone={delta > 0 ? 'ok' : 'caution'}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)}</Pill>
                  )}
                </View>
                {recorded.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <DailyTrend
                      data={days.map((d) => ({
                        label: d.label,
                        avg: d.row ? round(d.row.avgScore) : null,
                        min: d.row?.minScore,
                        max: d.row?.maxScore,
                      }))}
                      height={92}
                      band
                    />
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                  {[
                    ['측정 횟수', `${totalSessions}회`, T.ink],
                    ['점수 범위', scoreRange, T.ink],
                    ['위험 신호', `${totalDanger}회`, totalDanger > 0 ? T.danger : T.ink],
                  ].map(([l, v, c], i) => (
                    <View key={i} style={{ flex: 1, backgroundColor: T.bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10 }}>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
                      <Text style={{ fontSize: T.fs.body, color: c, fontFamily: T.fontExtraBold, marginTop: 4 }}>{v}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>

            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <SectionLabel>측정 기록</SectionLabel>
              <Card pad={0} style={{ borderRadius: 18 }}>
                {records.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: T.fs.label, color: T.muted, fontFamily: T.fontSemiBold }}>표시할 세션이 없어요.</Text>
                  </View>
                )}
                {records.map((r, i) => {
                  const I = Icon[r.icon];
                  return (
                    <Pressable
                      key={r.key}
                      onPress={() => router.push({ pathname: '/(elder)/session-detail', params: { sessionId: String(r.key) } })}
                      style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
                      borderBottomWidth: i < records.length - 1 ? 1 : 0, borderBottomColor: T.line,
                    }}>
                      <View style={{
                        width: 38, height: 38, borderRadius: 12,
                        backgroundColor: TONE_BG[r.t],
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <I width={20} height={20} color={TONE_FG[r.t]}/>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontBold, color: T.ink }}>{r.d}</Text>
                        <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3 }}>{r.n}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink }}>{r.s}</Text>
                        <Pill tone={r.t} size="sm">{RISK_LABEL[r.t]}</Pill>
                      </View>
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={1}/>
    </View>
  );
}

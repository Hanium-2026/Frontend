import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import T from '../../tokens';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import AppHeader from '../../components/AppHeader';
import SectionLabel from '../../components/SectionLabel';
import DailyTrend from '../../components/DailyTrend';
import { getGuardianDailyReport } from '../../api/reports';
import { disconnectWard } from '../../api/links';
import { riskTone, RISK_LABEL } from '../../risk';
import { ApiError } from '../../api/client';

const round = (n) => (n == null ? 0 : Math.round(n));
const PERIODS = [['7일', 7], ['30일', 30], ['90일', 90]];
const MAX_SESSIONS = 20;

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

export default function CarePatientDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const wardId = params.wardId;
  const name = params.name || '노약자';

  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);  // { dailyScores, todayMetrics, sessions }

  useEffect(() => {
    if (!wardId) { setLoading(false); return; }
    setLoading(true);
    getGuardianDailyReport(wardId, days)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [wardId, days]);

  const handleDisconnect = () => {
    if (!wardId) return;
    Alert.alert('연결 해제', `${name}님과의 보호자 연결을 해제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '해제', style: 'destructive', onPress: async () => {
        try {
          await disconnectWard(wardId);
          router.replace('/(caregiver)/');
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : '연결 해제에 실패했어요.';
          Alert.alert('해제 실패', msg);
        }
      } },
    ]);
  };

  const daily = data?.dailyScores ?? [];
  const tm = data?.todayMetrics ?? null;
  // TodayMetrics엔 riskLevel이 없다(점수·범위만 옴) — 점수만으로 톤을 낸다.
  const tone = tm ? riskTone(tm.avgScore) : 'ok';

  // 선택 기간 내 세션 목록 — 백엔드가 createdAt desc로 주므로 최신 MAX_SESSIONS개만 자른다.
  const records = (data?.sessions ?? []).slice(0, MAX_SESSIONS).map((s) => {
    const t = riskTone(s.avgScore, s.riskLevel);
    return {
      key: s.sessionId,
      d: fmtWhen(s.createdAt),
      s: round(s.avgScore),
      t,
      n: s.symmetryScore != null ? `좌우 대칭 ${round(s.symmetryScore)}%` : RISK_LABEL[t],
    };
  });

  const H = 110;
  const n = daily.length;
  const fmtDate = (iso) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };
  // DailyTrend는 점마다 라벨을 그리므로(30·90일이면 다 채우면 안 읽힘) 처음·끝만 날짜를 채운다.
  const trendData = daily.map((d, i) => ({
    label: (i === 0 || i === n - 1) ? fmtDate(d.date) : '',
    avg: round(d.avgScore),
    min: d.minScore,
    max: d.maxScore,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title={`${name}님`} onBack/>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: T.sp.xxl }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: T.sp.lg, gap: T.sp.lg }}>
            <Card pad={T.sp.xl}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: T.fs.caption, color: T.muted }}>오늘</Text>
                {tm && <Pill tone={tone} size="sm">{RISK_LABEL[tone]}</Pill>}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: T.sp.sm, marginTop: 2 }}>
                <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display * 1.1 }}>
                  {tm ? round(tm.avgScore) : '--'}
                </Text>
                <Text style={{ fontSize: T.fs.body, color: T.muted }}>
                  {tm ? `평균 · ${round(tm.minScore)}~${round(tm.maxScore)}` : '기록 없음'}
                </Text>
              </View>
              {tm && (
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: T.line, marginTop: T.sp.lg, paddingTop: T.sp.lg }}>
                  {[
                    ['좌우 대칭', tm.symmetryScore != null ? `${round(tm.symmetryScore)}%` : '--'],
                    ['변동성', tm.variabilityScore != null ? `${round(tm.variabilityScore)}%` : '--'],
                    ['측정', `${tm.sessionCount ?? 0}회`],
                  ].map(([l, v]) => (
                    <View key={l} style={{ flex: 1 }}>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{l}</Text>
                      <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink, marginTop: 2 }}>{v}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <Card pad={T.sp.xl}>
              <View style={{ flexDirection: 'row', gap: T.sp.sm, backgroundColor: T.line, borderRadius: T.radius.md, padding: 4 }}>
                {PERIODS.map(([label, v]) => (
                  <Pressable key={v} onPress={() => setDays(v)} style={{
                    flex: 1, height: 48, borderRadius: T.radius.sm, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: days === v ? T.surface : 'transparent',
                  }}>
                    <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: days === v ? T.ink : T.muted }}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ marginTop: T.sp.lg }}>
                {n === 0 ? (
                  <View style={{ height: H, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: T.fs.body, color: T.muted }}>이 기간에 측정 기록이 없어요.</Text>
                  </View>
                ) : (
                  <DailyTrend data={trendData} height={H} band color={T.body}/>
                )}
              </View>
              {n > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.sm, marginTop: T.sp.sm }}>
                  <View style={{ width: 16, height: 10, borderRadius: 2, backgroundColor: T.line }}/>
                  <Text style={{ flex: 1, fontSize: T.fs.caption, color: T.muted }}>
                    띠는 그날의 최저~최고 — 평균이 떨어지기 전에 흔들림이 먼저 보인다
                  </Text>
                </View>
              )}
            </Card>

            <View>
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
                    onPress={() => router.push({ pathname: '/(caregiver)/session-detail', params: { sessionId: String(r.key) } })}
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

            <Pressable onPress={handleDisconnect} style={{ alignItems: 'center', paddingVertical: T.sp.sm }}>
              <Text style={{ fontSize: T.fs.caption, color: T.muted, textDecorationLine: 'underline' }}>연결 해제</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

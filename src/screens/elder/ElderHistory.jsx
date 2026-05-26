import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import BarChart from '../../components/BarChart';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getDailyReport } from '../../api/reports';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
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
  const trend = daily.map((d) => round(d.avgScore));
  const dayLabels = daily.map((d) => WEEKDAY[new Date(d.date).getDay()]);
  const weeklyAvg = trend.length ? (trend.reduce((a, b) => a + b, 0) / trend.length) : null;
  const delta = trend.length >= 2 ? round(trend[trend.length - 1] - trend[0]) : null;

  const records = sessions.map((s) => {
    const caution = s.riskLevel === 'SUSPECTED';
    return {
      key: s.sessionId,
      d: fmtWhen(s.createdAt),
      s: round(s.avgScore),
      t: caution ? 'caution' : 'ok',
      n: s.symmetryScore != null ? `좌우대칭 ${round(s.symmetryScore)}%` : (caution ? '이상 의심' : '안정'),
      icon: 'walk',
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader
        title="기록"
        sub="지난 30일의 걸음 건강"
        right={
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.filter width={18} height={18} color={T.muted}/>
          </View>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <ActivityIndicator color={T.blue}/>
          </View>
        ) : (sessions.length === 0 && daily.length === 0) ? (
          <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
            <Icon.history width={40} height={40} color={T.line}/>
            <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center' }}>아직 측정 기록이 없어요.{'\n'}걷기 화면에서 측정을 시작해 보세요.</Text>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
              <Card pad={16} style={{ borderRadius: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold, letterSpacing: 0.2 }}>최근 {trend.length}일 평균</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 30, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>{weeklyAvg != null ? weeklyAvg.toFixed(1) : '--'}</Text>
                      <Text style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>점</Text>
                    </View>
                  </View>
                  {delta != null && delta !== 0 && (
                    <Pill tone={delta > 0 ? 'ok' : 'caution'}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)}</Pill>
                  )}
                </View>
                {trend.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <BarChart data={trend} width={328} height={92} color={T.blue} max={100} labels={dayLabels}/>
                  </View>
                )}
              </Card>
            </View>

            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <SectionLabel>측정 기록</SectionLabel>
              <Card pad={0} style={{ borderRadius: 18 }}>
                {records.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>표시할 세션이 없어요.</Text>
                  </View>
                )}
                {records.map((r, i) => {
                  const I = Icon[r.icon];
                  return (
                    <View key={r.key} style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
                      borderBottomWidth: i < records.length - 1 ? 1 : 0, borderBottomColor: T.line,
                    }}>
                      <View style={{
                        width: 38, height: 38, borderRadius: 12,
                        backgroundColor: r.t === 'ok' ? T.blueSoft : T.cautionSoft,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <I width={20} height={20} color={r.t === 'ok' ? T.blue : '#8B5A06'}/>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>{r.d}</Text>
                        <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{r.n}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: T.ink }}>{r.s}</Text>
                        <Pill tone={r.t} size="sm">{r.t === 'ok' ? '안정' : '주의'}</Pill>
                      </View>
                    </View>
                  );
                })}
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={2}/>
    </View>
  );
}

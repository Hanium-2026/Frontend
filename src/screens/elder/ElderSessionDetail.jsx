import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import SectionLabel from '../../components/SectionLabel';
import { getSessionReport } from '../../api/reports';

const round = (n) => (n == null ? '--' : String(Math.round(n)));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ElderSessionDetail() {
  const { sessionId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    getSessionReport(sessionId)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const suspected = report?.riskLevel === 'SUSPECTED';
  const metrics = [
    ['평균 점수', round(report?.avgScore), '점'],
    ['최저 점수', round(report?.minScore), '점'],
    ['최고 점수', round(report?.maxScore), '점'],
    ['대칭 점수', round(report?.symmetryScore), report?.symmetryScore == null ? '' : '%'],
    ['변동성', report?.variabilityScore != null ? report.variabilityScore.toFixed(2) : '--', ''],
    ['위험 횟수', String(report?.dangerCount ?? 0), '회'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="측정 상세" sub={fmtDate(report?.startedAt || report?.createdAt)} onBack/>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : !report ? (
        <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
          <Icon.doc width={40} height={40} color={T.line}/>
          <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center' }}>상세 리포트를 불러오지 못했어요.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            <Card pad={18} style={{ borderRadius: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold }}>보행 점수</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: 2 }}>
                    <Text style={{ fontSize: 44, fontFamily: T.fontExtraBold, color: suspected ? T.caution : T.blue, letterSpacing: -1 }}>{round(report.avgScore)}</Text>
                    <Text style={{ fontSize: 13, color: T.muted, marginBottom: 9 }}>점</Text>
                  </View>
                </View>
                <Pill tone={suspected ? 'caution' : 'ok'}>{suspected ? '주의' : '안정'}</Pill>
              </View>
              <Text style={{ fontSize: 13, color: T.body, lineHeight: 21, marginTop: 10, fontFamily: T.fontMedium }}>
                {report.reportSummary || (suspected ? '측정 구간에서 이상 보행 의심 신호가 감지됐어요.' : '측정 구간의 보행 패턴이 안정적으로 기록됐어요.')}
              </Text>
            </Card>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <SectionLabel>상세 지표</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {metrics.map(([label, value, unit], i) => (
                <Card key={i} pad={12} style={{ borderRadius: 14, width: '47.5%' }}>
                  <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 5 }}>
                    <Text style={{ fontSize: 21, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{value}</Text>
                    {!!unit && <Text style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{unit}</Text>}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

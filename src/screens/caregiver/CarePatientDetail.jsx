import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Text from '../../components/Text';
import Svg, { G, Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import Avatar from '../../components/Avatar';
import { getGuardianDailyReport } from '../../api/reports';
import { disconnectWard } from '../../api/links';
import { ApiError } from '../../api/client';

const round = (n) => (n == null ? 0 : Math.round(n));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const PERIODS = [['7일', 7], ['30일', 30], ['3개월', 90]];

export default function CarePatientDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const wardId = params.wardId;
  const name = params.name || '노약자';

  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);  // { dailyScores, todayMetrics }

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
  const vals = daily.map((d) => round(d.avgScore));
  const n = vals.length;
  const periodAvg = n ? (vals.reduce((a, b) => a + b, 0) / n) : null;
  const delta = n >= 2 ? round(vals[n - 1] - vals[0]) : null;

  // 라인 차트 좌표 (점수 40~100 → y)
  const W = 344, H = 120;
  const xAt = (i) => (n <= 1 ? 22 : 22 + i * (322 / (n - 1)));
  const yAt = (v) => 108 - (clamp(v, 40, 100) - 40) * 1.5;
  const xs = vals.map((_, i) => xAt(i));
  const ys = vals.map((v) => yAt(v));
  const dPath = xs.map((x, i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
  const area = n ? dPath + ` L ${xs[n - 1].toFixed(1)} 108 L 22 108 Z` : '';

  const fmtDate = (iso) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };

  // 기간 요약 — dailyScores 일별 집계 합산 (오늘 지표와 별개)
  const totalSessions = daily.reduce((a, d) => a + (d.sessionCount ?? 0), 0);
  const totalDanger = daily.reduce((a, d) => a + (d.dangerCount ?? 0), 0);
  const mins = daily.map((d) => d.minScore).filter((v) => v != null);
  const maxs = daily.map((d) => d.maxScore).filter((v) => v != null);
  const scoreRange = mins.length && maxs.length
    ? `${round(Math.min(...mins))}~${round(Math.max(...maxs))}`
    : '--';

  const metrics = tm ? [
    { l: '평균 점수', v: String(round(tm.avgScore)), u: '점' },
    { l: '점수 범위', v: `${round(tm.minScore)}~${round(tm.maxScore)}`, u: '' },
    { l: '좌우 대칭', v: tm.symmetryScore != null ? String(round(tm.symmetryScore)) : '--', u: '%' },
    { l: '변동성', v: tm.variabilityScore != null ? String(round(tm.variabilityScore)) : '--', u: '%' },
    { l: '측정 횟수', v: String(tm.sessionCount ?? 0), u: '회' },
    { l: '위험 횟수', v: String(tm.dangerCount ?? 0), u: '회' },
  ] : [];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.body}/>
        </Pressable>
        <Avatar name={name} size={40}/>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.3 }}>{name}</Text>
          <Text style={{ fontSize: 11.5, color: T.muted, fontFamily: T.fontSemiBold, marginTop: 1 }}>최근 {days}일 보행 추이</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <Card pad={14} style={{ borderRadius: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{days}일 평균 점수</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 30, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6 }}>{periodAvg != null ? periodAvg.toFixed(1) : '--'}</Text>
                    {delta != null && delta !== 0 && <Pill tone={delta > 0 ? 'ok' : 'caution'} size="sm">{delta > 0 ? '▲' : '▼'} {Math.abs(delta)}</Pill>}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 4, backgroundColor: T.bg, borderRadius: 10, padding: 3 }}>
                  {PERIODS.map(([l, v]) => (
                    <Pressable key={v} onPress={() => setDays(v)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: days === v ? '#fff' : 'transparent' }}>
                      <Text style={{ fontSize: 11, fontFamily: T.fontSemiBold, color: days === v ? T.ink : T.muted }}>{l}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                {n === 0 ? (
                  <View style={{ height: H, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>이 기간에 측정 기록이 없어요.</Text>
                  </View>
                ) : (
                  <Svg width={W} height={H + 12} viewBox={`0 0 ${W} ${H + 12}`}>
                    {[40,60,80,100].map((y, i) => (
                      <G key={i}>
                        <Line x1="22" y1={108-(y-40)*1.5} x2={W} y2={108-(y-40)*1.5} stroke={T.line}/>
                        <SvgText x="0" y={112-(y-40)*1.5} fontSize="9" fill={T.muted}>{y}</SvgText>
                      </G>
                    ))}
                    <Path d={area} fill={T.blue} opacity="0.08"/>
                    <Path d={dPath} fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round"/>
                    <Circle cx={xs[n-1]} cy={ys[n-1]} r="4" fill={T.blue} stroke="#fff" strokeWidth="2"/>
                    <SvgText x="22" y={H+12} fontSize="9" fill={T.muted}>{fmtDate(daily[0].date)}</SvgText>
                    <SvgText x={W} y={H+12} fontSize="9" fill={T.muted} textAnchor="end">{fmtDate(daily[n-1].date)}</SvgText>
                  </Svg>
                )}
              </View>
            </Card>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Card pad={14} style={{ borderRadius: 16, backgroundColor: T.blueWash, borderWidth: 1, borderColor: T.blueChip }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.brain width={16} height={16} color="#fff"/>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: T.blueDarker, fontFamily: T.fontBold, letterSpacing: 0.4 }}>AI 리포트</Text>
                  <Text style={{ fontSize: 13, color: T.ink, marginTop: 2, lineHeight: 20, fontFamily: T.fontMedium }}>
                    {n === 0 ? '아직 분석할 측정 데이터가 없어요.'
                      : <>최근 {days}일 평균 <Text style={{ fontFamily: T.fontBold }}>{periodAvg.toFixed(1)}점</Text>{delta != null && delta !== 0 ? `, 기간 시작 대비 ${delta > 0 ? '+' : ''}${delta}점 변화했어요.` : '입니다.'}</>}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {n > 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <SectionLabel>기간 요약 ({days}일)</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  ['측정 횟수', `${totalSessions}회`, T.ink],
                  ['점수 범위', scoreRange, T.ink],
                  ['위험 신호', `${totalDanger}회`, totalDanger > 0 ? T.danger : T.ink],
                ].map(([l, v, c], i) => (
                  <Card key={i} pad={12} style={{ flex: 1, borderRadius: 14 }}>
                    <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
                    <Text style={{ fontSize: 17, color: c, fontFamily: T.fontExtraBold, marginTop: 4 }}>{v}</Text>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {metrics.length > 0 && (
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <SectionLabel>핵심 지표 (오늘)</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {metrics.map((m, i) => (
                  <Card key={i} pad={12} style={{ borderRadius: 14, width: '47.5%' }}>
                    <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{m.l}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 5 }}>
                      <Text style={{ fontSize: 20, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.4 }}>{m.v}</Text>
                      <Text style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>{m.u}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

          <View style={{ paddingHorizontal: 16, marginTop: 18, paddingBottom: 20 }}>
            <Pressable onPress={handleDisconnect} style={{ height: 48, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.danger }}>연결 해제</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

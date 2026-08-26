import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Share } from 'react-native';
import Text from '../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import T from '../tokens';
import Icon from '../icons';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Pill from '../components/Pill';
import RangeBar from '../components/RangeBar';
import Button from '../components/Button';
import { getSessionReport } from '../api/reports';
import { sessionStore } from '../store/sessionStore';
import { riskTone, RISK_LABEL } from '../risk';

// 측정 결과 = 측정 직후(로컬)와 기록 열람(서버)이 같은 화면이다. 차이는 데이터 출처뿐이라
// sessionId 유무로 갈라 한 모양으로 정규화해 쓴다.
//  · sessionId 없음 → 방금 측정한 sessionStore (WARD 측정 직후)
//  · sessionId 있음 → 서버 리포트 (WARD 기록 · GUARDIAN 알림에서 진입)
// ⚠️ 확정 디자인은 이 화면에 탭바를 두지 않는다(보호자도 보는 공용 화면).

const fromLocal = (s) => s && ({
  at: s.at,
  avgScore: s.avgScore,
  minScore: s.minScore,
  maxScore: s.maxScore,
  symmetry: s.symmetry,
  variability: s.variability,
  dangerCount: s.dangerCount,
  riskLevel: s.riskLevel,
  summary: null,
  lowConfidence: s.lowConfidence,
});

// 서버는 symmetryScore/variabilityScore로 내려준다(둘 다 0~100, 대칭은 100이 정상).
const fromReport = (r) => r && ({
  at: r.createdAt,
  avgScore: r.avgScore,
  minScore: r.minScore,
  maxScore: r.maxScore,
  symmetry: r.symmetryScore,
  variability: r.variabilityScore,
  dangerCount: r.dangerCount,
  riskLevel: r.riskLevel,
  summary: r.reportSummary,
  lowConfidence: false,
});

const round = (n) => (n == null ? '--' : String(Math.round(n)));

function fmtWhen(v) {
  if (!v) return '';
  const d = new Date(v);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SessionDetail() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  const local = !sessionId;
  const [loading, setLoading] = useState(!local);
  const [data, setData] = useState(() => (local ? fromLocal(sessionStore.get()) : null));

  useEffect(() => {
    if (local) return;
    getSessionReport(sessionId)
      .then((r) => setData(fromReport(r)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [sessionId, local]);

  const tone = data ? riskTone(data.avgScore, data.riskLevel) : 'ok';

  // reportSummary는 앱이 아직 보내지 않아 사실상 항상 null이다(폴백이 실제로 보이는 문구).
  const summaryText = !data ? '' : (data.summary || (
    tone === 'danger' ? '이번 측정에서 보행 점수가 낮게 기록됐어요. 보호자와 상담을 권해드려요.'
      : tone === 'caution' ? '이번 측정에서 이상 보행 의심 신호가 있었어요.'
        : '이번 측정의 보행이 안정적으로 기록됐어요.'
  ));

  // 함께 관찰된 보행 특성 — 점수의 근거가 아니라 참고 지표다.
  const traits = !data ? [] : [
    ['좌우 대칭', round(data.symmetry), data.symmetry == null ? '' : '%'],
    ['걸음 변동성', round(data.variability), data.variability == null ? '' : '%'],
    ['위험 신호', String(data.dangerCount ?? 0), '회'],
  ];

  const onShare = () => {
    if (!data) return;
    Share.share({
      message:
        '[NEVO 걸음 건강 리포트]\n' +
        `${fmtWhen(data.at)}\n` +
        `걸음 건강 점수 ${round(data.avgScore)}/100 · ${RISK_LABEL[tone]}\n\n` +
        summaryText,
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="측정 결과" onBack/>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : !data ? (
        <View style={{ paddingTop: 80, paddingHorizontal: T.sp.xxl, alignItems: 'center' }}>
          <Icon.doc width={40} height={40} color={T.line}/>
          <Text style={{
            fontSize: T.fs.body, color: T.body, fontFamily: T.fontSemiBold,
            marginTop: T.sp.md, textAlign: 'center',
          }}>
            {local ? '측정 데이터가 없어요.' : '상세 리포트를 불러오지 못했어요.'}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: T.sp.xxl }}
            showsVerticalScrollIndicator={false}>
            {/* 점수 — 색 운반체는 상태 칩 하나. 숫자는 크기로만 존재감을 만든다. */}
            <View style={{ paddingHorizontal: T.sp.lg }}>
              <Card pad={T.sp.xl}>
                <Text style={{ fontSize: T.fs.caption, color: T.muted, textAlign: 'center' }}>{fmtWhen(data.at)}</Text>
                <Text style={{
                  fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink,
                  lineHeight: T.fs.display * 1.1, marginTop: T.sp.sm, textAlign: 'center',
                }}>{round(data.avgScore)}</Text>
                <Text style={{ fontSize: T.fs.caption, color: T.muted, textAlign: 'center' }}>걸음 건강 점수</Text>
                <View style={{ alignItems: 'center', marginTop: T.sp.md }}>
                  <Pill tone={tone} size="lg">{RISK_LABEL[tone]}</Pill>
                </View>

                <Text style={{
                  fontSize: T.fs.body, color: T.body, fontFamily: T.font,
                  lineHeight: 25, marginTop: T.sp.lg,
                }}>{summaryText}</Text>

                {data.lowConfidence && (
                  <View style={{
                    flexDirection: 'row', gap: T.sp.sm, marginTop: T.sp.md,
                    padding: T.sp.md, borderRadius: T.radius.sm, backgroundColor: T.cautionSoft,
                  }}>
                    <Icon.spark width={18} height={18} color={T.caution}/>
                    <Text style={{ flex: 1, fontSize: T.fs.caption, color: T.caution, fontFamily: T.fontMedium, lineHeight: 20 }}>
                      걸음이 적어서 이번 측정은 기록에 남지 않았어요. 다음엔 20초 이상 걸어주세요.
                    </Text>
                  </View>
                )}

                {data.minScore != null && data.maxScore != null && (
                  <View style={{ marginTop: T.sp.xl }}>
                    <RangeBar min={data.minScore} max={data.maxScore} value={data.avgScore}/>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: T.sp.sm }}>
                      <Text style={{ fontSize: T.fs.body, color: T.muted }}>0</Text>
                      <Text style={{ fontSize: T.fs.body, color: T.muted }}>100</Text>
                    </View>
                    <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: T.sp.xs, textAlign: 'center' }}>
                      최저 {Math.round(data.minScore)} · 최고 {Math.round(data.maxScore)}
                    </Text>
                  </View>
                )}
              </Card>
            </View>

            {/* 함께 관찰된 보행 특성 — 점수의 근거가 아니라 참고 지표다. */}
            <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
              <Card pad={T.sp.xl}>
                <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>함께 관찰된 보행 특성</Text>
                {traits.map(([label, value, unit], i) => (
                  <View key={label} style={{
                    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
                    paddingVertical: T.sp.md,
                    borderBottomWidth: i < traits.length - 1 ? 1 : 0, borderBottomColor: T.line,
                  }}>
                    <Text style={{ fontSize: T.fs.body, color: T.body }}>{label}</Text>
                    <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{value}{unit}</Text>
                  </View>
                ))}
              </Card>
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.sm, paddingBottom: T.sp.xl, backgroundColor: T.bg, gap: T.sp.sm }}>
            <Button onPress={onShare}>결과 공유하기</Button>
            {/* 측정 직후(local)에만 — 뒤로가기가 방금 끝난 측정 화면으로 돌아가 막다른 길처럼 느껴지는 문제 보완 */}
            {local && (
              <Button variant="outline" onPress={() => router.replace('/(elder)/')}>홈으로 가기</Button>
            )}
          </View>
        </>
      )}
    </View>
  );
}

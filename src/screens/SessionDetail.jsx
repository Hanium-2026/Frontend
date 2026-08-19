import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, Share } from 'react-native';
import Text from '../components/Text';
import { useLocalSearchParams } from 'expo-router';
import T from '../tokens';
import Icon from '../icons';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import Pill from '../components/Pill';
import SectionLabel from '../components/SectionLabel';
import TabBar from '../components/TabBar';
import { getSessionReport } from '../api/reports';
import { sessionStore } from '../store/sessionStore';
import { riskTone, RISK_LABEL } from '../risk';

// 측정 결과 = 측정 직후(로컬)와 기록 열람(서버)이 같은 화면이다. 차이는 데이터 출처뿐이라
// sessionId 유무로 갈라 한 모양으로 정규화해 쓴다.
//  · sessionId 없음 → 방금 측정한 sessionStore (WARD 측정 직후)
//  · sessionId 있음 → 서버 리포트 (WARD 기록 · GUARDIAN 알림에서 진입)
const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

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

  // 평균 점수는 위에 크게 나오므로 타일에 다시 넣지 않는다.
  const metrics = !data ? [] : [
    ['점수 범위', data.minScore == null || data.maxScore == null
      ? '--' : `${Math.round(data.minScore)}~${Math.round(data.maxScore)}`, ''],
    ['좌우 대칭', round(data.symmetry), data.symmetry == null ? '' : '%'],
    ['변동성', round(data.variability), data.variability == null ? '' : '%'],
    ['위험 횟수', String(data.dangerCount ?? 0), '회'],
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

  const shareBtn = data ? (
    <Pressable
      onPress={onShare}
      hitSlop={10}
      style={{
        width: 36, height: 36, borderRadius: 18, marginTop: 2,
        backgroundColor: T.surface, borderWidth: 1, borderColor: T.line,
        alignItems: 'center', justifyContent: 'center',
      }}>
      <Icon.share width={18} height={18} color={T.ink}/>
    </Pressable>
  ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="측정 결과" sub={fmtWhen(data?.at)} onBack right={shareBtn}/>

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
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: local ? 110 : T.sp.xxl }}
          showsVerticalScrollIndicator={false}>
          {/* 점수 — 색 운반체는 상태 칩 하나. 숫자는 크기로만 존재감을 만든다. */}
          <View style={{ paddingHorizontal: T.sp.lg }}>
            <Card pad={T.sp.xl}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>걸음 건강 점수</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: T.sp.xs }}>
                    <Text style={{
                      fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink,
                      letterSpacing: -1.5, lineHeight: T.fs.display * 1.05,
                    }}>{round(data.avgScore)}</Text>
                    <Text style={{ fontSize: T.fs.body, color: T.muted, marginLeft: T.sp.xs, marginBottom: 6 }}>점</Text>
                  </View>
                </View>
                <View style={{ marginTop: T.sp.xs }}>
                  <Pill tone={tone}>{RISK_LABEL[tone]}</Pill>
                </View>
              </View>

              <Text style={{
                fontSize: T.fs.body, color: T.body, fontFamily: T.font,
                lineHeight: 25, marginTop: T.sp.md,
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
            </Card>
          </View>

          {/* 상세 지표 — 2열 그리드는 flex로(퍼센트 폭 금지) */}
          <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.lg }}>
            <SectionLabel>상세 지표</SectionLabel>
            <View style={{ gap: T.sp.md }}>
              {[metrics.slice(0, 2), metrics.slice(2, 4)].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: T.sp.md }}>
                  {row.map(([label, value, unit], j) => (
                    <Card key={j} pad={T.sp.lg} style={{ flex: 1 }}>
                      <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>{label}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: T.sp.sm }}>
                        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontExtraBold, color: T.ink }}>{value}</Text>
                        {!!unit && (
                          <Text style={{ fontSize: T.fs.caption, color: T.muted, marginLeft: 2, marginBottom: 3 }}>{unit}</Text>
                        )}
                      </View>
                    </Card>
                  ))}
                </View>
              ))}
            </View>

            {(data.symmetry != null || data.variability != null) && (
              <Text style={{
                fontSize: T.fs.caption, color: T.muted, fontFamily: T.font,
                marginTop: T.sp.md, lineHeight: 20,
              }}>
                좌우 대칭과 변동성은 걸음 신호로 추정한 값이에요.
                좌우 대칭은 100%에 가까울수록, 변동성은 낮을수록 안정적이에요.
              </Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* 측정 직후에만 탭바를 둔다 — 이 화면은 GUARDIAN도 쓰므로(알림 → 세션) 항상 두면 안 된다. */}
      {local && <TabBar tabs={ELDER_TABS} active={-1}/>}
    </View>
  );
}

import React from 'react';
import { View, Pressable, ScrollView, Share } from 'react-native';
import Text from '../../components/Text';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import TabBar from '../../components/TabBar';
import ElderTopBlock from '../../components/ElderTopBlock';
import { sessionStore } from '../../store/sessionStore';
import { riskTone } from '../../risk';

const TONE_COLOR = { ok: T.ok, caution: T.caution, danger: T.danger };

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure-intro' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

export default function ElderResult() {
  const router = useRouter();
  const s = sessionStore.get();
  const tone = s ? riskTone(s.avgScore, s.riskLevel) : null;
  const score = s ? s.avgScore : 0;
  const circ = 427;
  const offset = circ * (1 - score / 100);

  const pillText = !s ? '측정 데이터 없음'
    : tone === 'danger' ? '위험 · 보호자 상담 권장'
    : tone === 'caution' ? '이상 의심 · 관찰 권장'
    : '안정 · 위험도 낮음';
  const pillDot = !s ? '#9DB2D4'
    : tone === 'danger' ? '#FCA5A5'
    : tone === 'caution' ? '#FFB4A2'
    : '#86E3C1';

  const aiText = !s
    ? '측정 데이터가 없어요. 걷기 화면에서 먼저 측정해 주세요.'
    : tone === 'danger'
      ? `측정 구간의 ${s.suspectedRatio}%에서 이상 보행이 감지됐고 점수가 낮아요. 보호자와 상담을 권해드려요.`
      : tone === 'caution'
        ? `측정 구간의 ${s.suspectedRatio}%에서 이상 보행이 감지됐어요. 한 번 더 측정하거나 보호자와 상담을 권해드려요.`
        : `전반적으로 보행이 안정적이에요. 평균 ${s.avgScore}점, 케이던스 ${s.avgCadence}/분으로 정상 범위예요.`;

  const metrics = s ? [
    { label: '평균 점수',     v: `${s.avgScore} / 100`,        bar: s.avgScore,                    tone: TONE_COLOR[tone], note: tone === 'danger' ? '위험' : tone === 'caution' ? '관찰 권장' : '정상 범위' },
    { label: '점수 범위',     v: `${s.minScore}~${s.maxScore}`, bar: s.maxScore,                    tone: T.blue,    note: '최저~최고' },
    { label: '케이던스',      v: `${s.avgCadence} /분`,         bar: Math.min(100, Math.round(s.avgCadence / 1.3)), tone: T.blue, note: '평균 분당 걸음' },
    ...(s.symmetry != null ? [{ label: '좌우 대칭', v: `${s.symmetry}%`, bar: s.symmetry, tone: s.symmetry >= 90 ? T.ok : s.symmetry >= 80 ? T.caution : T.danger, note: s.symmetry >= 90 ? '균형 좋음' : s.symmetry >= 80 ? '약간 불균형' : '불균형' }] : []),
    ...(s.variability != null ? [{ label: '변동성', v: `${s.variability}%`, bar: Math.max(0, 100 - s.variability * 3), tone: s.variability <= 10 ? T.ok : s.variability <= 20 ? T.caution : T.danger, note: s.variability <= 10 ? '규칙적' : s.variability <= 20 ? '보통' : '불규칙' }] : []),
    { label: '이상 의심 비율', v: `${s.suspectedRatio}%`,        bar: 100 - s.suspectedRatio,        tone: s.suspectedRatio > 30 ? T.caution : T.ok, note: s.suspectedRatio > 30 ? '주의' : '낮음' },
    { label: '분석 구간',     v: `${s.windows} 회`,             bar: Math.min(100, s.windows * 5),  tone: T.blue,    note: '걷기 구간 수' },
  ] : [];

  const onShare = () => {
    if (!s) return;
    Share.share({
      message:
        `[NEVO 걸음 건강 리포트]\n` +
        `걸음 건강 점수 ${s.avgScore}/100 · ${pillText}\n` +
        `점수 범위 ${s.minScore}~${s.maxScore} · 케이던스 ${s.avgCadence}/분\n` +
        `측정 구간 ${s.windows}회 · 이상 의심 ${s.suspectedRatio}%\n\n` +
        aiText,
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ElderTopBlock minHeight={300}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color="#fff"/>
          </Pressable>
          <Text style={{ fontSize: T.fs.caption, color: 'rgba(255,255,255,0.9)', fontFamily: T.fontSemiBold }}>
            {s ? new Date(s.at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '측정 기록 없음'}
          </Text>
          <Pressable
            onPress={onShare}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.share width={18} height={18} color="#fff"/>
          </Pressable>
        </View>

        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={160} height={160} viewBox="0 0 160 160" style={{ position: 'absolute' }}>
              <Circle cx="80" cy="80" r="68" stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none"/>
              <Circle cx="80" cy="80" r="68" stroke="#fff" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray="427" strokeDashoffset={offset}
                transform="rotate(-90 80 80)"/>
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: T.fs.caption, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontSemiBold, letterSpacing: 0.5 }}>걸음 건강 점수</Text>
              <Text style={{ fontSize: 56, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -2, lineHeight: 60 }}>{s ? score : '--'}</Text>
              <Text style={{ fontSize: T.fs.caption, color: 'rgba(255,255,255,0.75)' }}>/ 100</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, marginTop: 14 }}>
            <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: pillDot }}/>
            <Text style={{ fontSize: T.fs.label, fontFamily: T.fontBold, color: '#fff', letterSpacing: -0.2 }}>{pillText}</Text>
          </View>
        </View>
      </ElderTopBlock>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* AI summary */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <Card pad={16} style={{ borderRadius: 18 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.brain width={18} height={18} color={T.blue}/>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: T.fs.caption, color: T.blue, fontFamily: T.fontBold, letterSpacing: 0.4 }}>AI 분석 요약</Text>
                <Text style={{ fontSize: T.fs.body, color: T.ink, fontFamily: T.fontSemiBold, lineHeight: 25, marginTop: 5 }}>
                  {aiText}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* metrics */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <SectionLabel>상세 지표</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {metrics.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: T.fs.label, color: T.muted, fontFamily: T.fontSemiBold }}>측정 데이터가 없어요. 걷기에서 측정해 주세요.</Text>
              </View>
            )}
            {metrics.map((m, i) => (
              <View key={i} style={{ padding: 16, borderBottomWidth: i < metrics.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontSemiBold, color: T.ink }}>{m.label}</Text>
                  <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontBold, color: T.ink }}>{m.v}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: T.line }}>
                    <View style={{ width: `${m.bar}%`, height: 8, backgroundColor: m.tone, borderRadius: 4 }}/>
                  </View>
                  <Text style={{ fontSize: T.fs.caption, color: m.tone, fontFamily: T.fontSemiBold, minWidth: 64, textAlign: 'right' }}>{m.note}</Text>
                </View>
              </View>
            ))}
          </Card>
          {s && (s.symmetry != null || s.variability != null) && (
            <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontMedium, marginTop: 8, lineHeight: 19 }}>
              좌우 대칭과 변동성은 걸음 신호로 추정한 값이에요. 좌우 대칭은 100%에 가까울수록, 변동성은 낮을수록 안정적이에요.
            </Text>
          )}
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={1}/>
    </View>
  );
}

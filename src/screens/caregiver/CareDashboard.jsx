import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import SparkLine from '../../components/SparkLine';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';
import { getDashboard } from '../../api/reports';
import { riskTone, RISK_LABEL } from '../../risk';

const CARE_TABS = [
  { label: '대시보드', path: '/(caregiver)/' },
  { label: '알림', path: '/(caregiver)/alerts' },
  { label: '위치', path: '/(caregiver)/location' },
  { label: '내정보', path: '/(caregiver)/profile' },
];

const TONE_RANK = { danger: 0, caution: 1, ok: 2 };
const NEUTRAL_AVATAR = [T.line, T.body];
const DANGER_AVATAR = [T.dangerSoft, T.danger];
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const STALE_DAYS = 3;  // 이만큼 측정이 없으면 그 자체를 위험 신호로 본다
const KOR_NUM = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const kor = (n) => KOR_NUM[n] ?? String(n);

// 위험도 톤은 공통 riskTone 기준 (점수<50 위험 / SUSPECTED·50~69 주의 / 그 외 안정)
const scoreToneOf = (w) => riskTone(w.latestScore, w.riskLevel);

function daysSince(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function fmtAgo(iso) {
  if (!iso) return '측정 기록 없음';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CareDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState([]);

  const goInvite = () => router.push({
    pathname: '/(caregiver)/invite',
    params: { returnTo: 'caregiver' },
  });

  useEffect(() => {
    getDashboard()
      .then((d) => setWards(d?.wards ?? []))
      .catch(() => setWards([]))
      .finally(() => setLoading(false));
  }, []);

  // 측정이 STALE_DAYS 이상 없으면 그 자체를 위험으로 다룬다(점수 톤을 덮어씀).
  const enriched = wards
    .map((w) => {
      const scoreTone = scoreToneOf(w);
      const days = daysSince(w.lastSessionAt);
      const stale = days >= STALE_DAYS;
      return {
        ...w,
        tone: stale ? 'danger' : scoreTone,
        sub: stale ? (w.lastSessionAt ? `${days}일째 측정 없음` : '측정 기록 없음') : fmtAgo(w.lastSessionAt),
      };
    })
    .sort((a, b) => TONE_RANK[a.tone] - TONE_RANK[b.tone]);

  const needAttention = enriched.filter((w) => w.tone !== 'ok').length;
  const now = new Date();
  const todayLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAY[now.getDay()]}요일`;
  const headline = enriched.length === 0 ? ''
    : needAttention === 0 ? `오늘 ${kor(enriched.length)} 분 모두 안정적이에요`
      : `오늘 ${kor(enriched.length)} 분 중 ${kor(needAttention)} 분이\n살펴볼 상태예요`;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.xl, paddingBottom: T.sp.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{todayLabel}</Text>
            {!!headline && (
              <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, marginTop: 2 }}>{headline}</Text>
            )}
          </View>
          <Pressable onPress={goInvite} hitSlop={8} style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: T.blueSoft,
            alignItems: 'center', justifyContent: 'center', marginLeft: T.sp.md,
          }}>
            <Icon.plus width={20} height={20} color={T.blue}/>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <ActivityIndicator color={T.blue}/>
          </View>
        ) : enriched.length === 0 ? (
          <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
            <Icon.family width={40} height={40} color={T.line}/>
            <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center' }}>연동된 가족이 없어요.{'\n'}노약자 앱에서 발급한 코드로 연결해 주세요.</Text>
            <Pressable onPress={goInvite} style={{ marginTop: 18, height: 48, paddingHorizontal: 20, borderRadius: T.radius.md, backgroundColor: T.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon.plus width={18} height={18} color="#fff"/>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>새 가족 추가</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.md, gap: T.sp.lg }}>
            {enriched.map((w) => {
              const spark = (w.trend ?? []).filter((v) => v != null).map((v) => Math.round(v));
              const score = w.latestScore != null ? Math.round(w.latestScore) : '--';
              const danger = w.tone === 'danger';
              return (
                <Pressable key={w.wardId} onPress={() => router.push({ pathname: '/(caregiver)/patient-detail', params: { wardId: String(w.wardId), name: w.name } })}>
                  <Card pad={T.sp.xl} style={danger ? { borderLeftWidth: 3, borderLeftColor: T.danger } : null}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
                        <Avatar name={w.name} size={40} tone={danger ? DANGER_AVATAR : NEUTRAL_AVATAR}/>
                        <View>
                          <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{w.name}님</Text>
                          <Text style={{ fontSize: T.fs.caption, color: danger ? T.danger : T.muted, marginTop: 2 }}>{w.sub}</Text>
                        </View>
                      </View>
                      <Pill tone={w.tone} size="sm">{RISK_LABEL[w.tone]}</Pill>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: T.sp.lg }}>
                      <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display * 1.1 }}>{score}</Text>
                      {spark.length >= 2 && (
                        <SparkLine data={spark} width={120} height={40} color={T.body} fill={false}/>
                      )}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={0}/>
    </View>
  );
}

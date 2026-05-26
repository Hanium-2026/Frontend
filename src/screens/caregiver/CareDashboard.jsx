import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Pill from '../../components/Pill';
import SparkLine from '../../components/SparkLine';
import Avatar from '../../components/Avatar';
import TabBar from '../../components/TabBar';
import { getDashboard } from '../../api/reports';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

const toneScore = { ok: T.ok, caution: T.caution, danger: T.danger };
const toneSub   = { ok: T.body, caution: '#8B5A06', danger: '#9B1B1B' };
const toneLabel = { ok: '안정', caution: '주의', danger: '위험' };

// 백엔드는 riskLevel(NORMAL/SUSPECTED)만 제공 → 점수까지 반영해 3단계 톤 산출
const toneOf = (w) => w.latestScore == null ? 'ok'
  : w.latestScore < 50 ? 'danger'
  : w.riskLevel === 'SUSPECTED' ? 'caution' : 'ok';

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

  const enriched = wards.map((w) => ({ ...w, tone: toneOf(w) }));
  const cautionCount = enriched.filter((w) => w.tone === 'caution').length;
  const dangerCount = enriched.filter((w) => w.tone === 'danger').length;
  const alertWard = enriched.find((w) => w.tone === 'danger') || enriched.find((w) => w.tone === 'caution');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* header */}
      <View style={{ paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: T.line }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontSemiBold }}>안녕하세요</Text>
            <Text style={{ fontSize: 22, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6, marginTop: 2 }}>가족 보행 상태</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={goInvite} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.plus width={19} height={19} color="#fff"/>
            </Pressable>
            <Pressable style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.bell width={18} height={18} color={T.body}/>
              <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: T.danger, borderWidth: 1.5, borderColor: '#fff' }}/>
            </Pressable>
            <Avatar name="민지" size={38} tone={[T.blueSoft, T.blueDark]}/>
          </View>
        </View>

        {/* summary tiles */}
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
          {[['전체', String(enriched.length), '명', T.ink], ['주의', String(cautionCount), '명', T.caution], ['위험', String(dangerCount), '명', T.danger]].map(([l,v,s,c], i) => (
            <View key={i} style={{ flex: 1, backgroundColor: T.bg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.line }}>
              <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontSemiBold }}>{l}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 2 }}>
                <Text style={{ fontSize: 24, fontFamily: T.fontExtraBold, color: c, letterSpacing: -0.5 }}>{v}</Text>
                <Text style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>{s}</Text>
              </View>
            </View>
          ))}
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
            <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center' }}>연동된 가족이 없어요.{'\n'}노약자 앱에서 발급한 코드로 연결해 주세요.</Text>
            <Pressable onPress={goInvite} style={{ marginTop: 18, height: 46, paddingHorizontal: 18, borderRadius: 14, backgroundColor: T.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon.plus width={17} height={17} color="#fff"/>
              <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: '#fff' }}>새 노약자 추가</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* alert banner (주의/위험 노약자가 있을 때만) */}
            {alertWard && (
              <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
                <Pressable onPress={() => router.push('/(caregiver)/alerts')} style={{ backgroundColor: T.dangerSoft, borderWidth: 1, borderColor: '#F8BFBF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.danger, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.bell width={20} height={20} color="#fff"/>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#9B1B1B' }}>{alertWard.name}님 · 보행 주의 신호</Text>
                    <Text style={{ fontSize: 11.5, color: '#9B1B1B', opacity: 0.8, marginTop: 1 }}>최근 점수 {alertWard.latestScore != null ? Math.round(alertWard.latestScore) : '--'}점 · 상태 확인을 권장해요</Text>
                  </View>
                  <Icon.chevron width={14} height={14} color="#9B1B1B"/>
                </Pressable>
              </View>
            )}

            {/* patient cards */}
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionLabel>돌보는 가족</SectionLabel>
                <Pressable onPress={goInvite} style={{ marginBottom: 8, paddingHorizontal: 10, height: 30, borderRadius: 10, backgroundColor: T.blueSoft, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon.plus width={14} height={14} color={T.blueDark}/>
                  <Text style={{ fontSize: 12, fontFamily: T.fontBold, color: T.blueDark }}>추가</Text>
                </Pressable>
              </View>
              <View style={{ gap: 10 }}>
                {enriched.map((w) => {
                  const spark = (w.trend ?? []).filter((v) => v != null).map((v) => Math.round(v));
                  const score = w.latestScore != null ? Math.round(w.latestScore) : '--';
                  return (
                    <Pressable key={w.wardId} onPress={() => router.push({ pathname: '/(caregiver)/patient-detail', params: { wardId: String(w.wardId), name: w.name } })}>
                      <Card pad={0} style={{ borderRadius: 16 }}>
                        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Avatar name={w.name} size={48}/>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontFamily: T.fontExtraBold, color: T.ink }}>{w.name}</Text>
                            <Text style={{ fontSize: 12, color: toneSub[w.tone], marginTop: 3, fontFamily: T.fontSemiBold }}>{toneLabel[w.tone]} · {fmtAgo(w.lastSessionAt)}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: toneScore[w.tone], letterSpacing: -0.6, lineHeight: 30 }}>{score}</Text>
                            <Pill tone={w.tone} size="sm">{toneLabel[w.tone]}</Pill>
                          </View>
                        </View>
                        {spark.length >= 2 && (
                          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                            <SparkLine data={spark} width={344} height={42} color={toneScore[w.tone]}/>
                          </View>
                        )}
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <TabBar tabs={CARE_TABS} active={0}/>
    </View>
  );
}

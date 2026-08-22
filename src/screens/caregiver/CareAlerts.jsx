import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMyWards, getWardAlerts } from '../../api/links';

const CARE_TABS = [
  { label: '대시보드', path: '/(caregiver)/' },
  { label: '알림', path: '/(caregiver)/alerts' },
  { label: '위치', path: '/(caregiver)/location' },
  { label: '내정보', path: '/(caregiver)/profile' },
];

// 현재 백엔드 AlertType은 STROKE_DANGER 한 종류.
function fmtAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `오늘 ${new Date(iso).getHours()}:${String(new Date(iso).getMinutes()).padStart(2, '0')}`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CareAlerts() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const wards = await getMyWards();
        const lists = await Promise.all(
          (wards ?? []).map((w) =>
            getWardAlerts(w.wardId)
              .then((arr) => (arr ?? []).map((a) => ({ ...a, who: w.name })))
              .catch(() => [])
          )
        );
        const merged = lists.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAlerts(merged);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="알림"/>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : alerts.length === 0 ? (
        <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
          <Icon.bell width={40} height={40} color={T.line}/>
          <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.fontSemiBold, marginTop: T.sp.md, textAlign: 'center' }}>아직 알림이 없어요</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.md, paddingBottom: 100, gap: T.sp.lg }} showsVerticalScrollIndicator={false}>
          {alerts.map((a) => (
            <Pressable
              key={a.alertId}
              disabled={a.sessionId == null}
              onPress={() => router.push({ pathname: '/(caregiver)/session-detail', params: { sessionId: String(a.sessionId) } })}>
              <Card pad={T.sp.xl} style={{ borderLeftWidth: 3, borderLeftColor: T.danger }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>{a.who}님</Text>
                  <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{fmtAgo(a.createdAt)}</Text>
                </View>
                <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm, lineHeight: T.fs.body * 1.6 }}>{a.message}</Text>
                {a.sessionId != null && (
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink, marginTop: T.sp.lg }}>측정 결과 보기 →</Text>
                )}
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <TabBar tabs={CARE_TABS} active={1}/>
    </View>
  );
}

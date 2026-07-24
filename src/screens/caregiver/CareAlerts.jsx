import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMyWards, getWardAlerts } from '../../api/links';

const CARE_TABS = [
  { icon: 'home',     label: '대시보드', path: '/(caregiver)/' },
  { icon: 'bell',     label: '알림',    path: '/(caregiver)/alerts' },
  { icon: 'pin',      label: '위치',    path: '/(caregiver)/location' },
  { icon: 'doc',      label: '리포트',  path: '/(caregiver)/report' },
  { icon: 'settings', label: '설정',    path: '/(caregiver)/settings' },
];

// 현재 백엔드 AlertType은 STROKE_DANGER 한 종류.
const TYPE_TITLE = { STROKE_DANGER: '뇌졸중 의심 신호' };

function fmtAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function CareAlerts() {
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
      <AppHeader title="알림 · AI 리포트" sub={loading ? '불러오는 중' : `총 ${alerts.length}건`}/>

      {loading ? (
        <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
      ) : alerts.length === 0 ? (
        <View style={{ paddingTop: 80, paddingHorizontal: 32, alignItems: 'center' }}>
          <Icon.bell width={40} height={40} color={T.line}/>
          <Text style={{ fontSize: 14, color: T.muted, fontFamily: T.fontSemiBold, marginTop: 12, textAlign: 'center' }}>받은 알림이 없어요.{'\n'}이상 보행이 감지되면 여기에 표시됩니다.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 10 }} showsVerticalScrollIndicator={false}>
          {alerts.map((a) => (
            <Card key={a.alertId} pad={14} style={{ borderRadius: 16, borderLeftWidth: 3, borderLeftColor: T.danger }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FCE0E0', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.brain width={20} height={20} color={T.danger}/>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <Text style={{ fontSize: 13.5, fontFamily: T.fontBold, color: T.ink, flex: 1 }}>{TYPE_TITLE[a.type] || a.type}</Text>
                    <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontMedium }}>{fmtAgo(a.createdAt)}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2, fontFamily: T.fontMedium }}>{a.who} · {a.message}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      <TabBar tabs={CARE_TABS} active={1}/>
    </View>
  );
}

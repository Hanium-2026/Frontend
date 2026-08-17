import React, { useCallback, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { useFocusEffect, useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { getMyGuardians } from '../../api/links';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure-intro' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} 연결됨`;
}

function MenuRow({ icon, title, sub, onPress }) {
  const IconCmp = Icon[icon];
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
        <IconCmp width={24} height={24} color={T.blue}/>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink }}>{title}</Text>
        <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3, lineHeight: 19 }}>{sub}</Text>
      </View>
      <Icon.chevron width={20} height={20} color={T.muted}/>
    </Pressable>
  );
}

export default function ElderCaregiver() {
  const router = useRouter();
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getMyGuardians()
        .then((list) => { if (alive) setGuardians(list ?? []); })
        .catch(() => { if (alive) setGuardians([]); })
        .finally(() => { if (alive) setLoading(false); });
      return () => { alive = false; };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="보호자" sub="가족과 결과를 함께 보세요"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 연결된 가족 — 상단 */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <SectionLabel>연결된 가족 ({guardians.length}명)</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
            ) : guardians.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: T.fs.label, color: T.muted, fontFamily: T.fontSemiBold }}>아직 연결된 보호자가 없어요.</Text>
              </View>
            ) : guardians.map((g, i) => (
              <View key={g.guardianUserId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < guardians.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <Avatar name={g.name} size={44}/>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink }}>{g.name}</Text>
                  <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3 }}>{fmtDate(g.linkedAt)}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* 관리 메뉴 */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Card pad={0} style={{ borderRadius: 18 }}>
            <MenuRow
              icon="plus"
              title="보호자와 연결하기"
              sub="연동 코드로 가족을 연결해요"
              onPress={() => router.push('/(elder)/caregiver-link')}
            />
          </Card>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={3}/>
    </View>
  );
}

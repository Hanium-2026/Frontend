import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import { generateLinkCode, getMyGuardians } from '../../api/links';
import { ApiError } from '../../api/client';

const ELDER_TABS = [
  { icon: 'home',    label: '홈',    path: '/(elder)/' },
  { icon: 'walk',    label: '걷기',  path: '/(elder)/measure' },
  { icon: 'history', label: '기록',  path: '/(elder)/history' },
  { icon: 'family',  label: '보호자', path: '/(elder)/caregiver' },
  { icon: 'user',    label: '내정보', path: '/(elder)/profile' },
];

const PHONE_RE = /^01[016789]\d{7,8}$/;

const sharing = [
  ['일일 걸음 점수', true],
  ['상세 보행 지표', true],
  ['위치 정보',      false],
  ['낙상 / 비상 알림', true],
];

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} 연결됨`;
}

export default function ElderCaregiver() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(null);     // { code, expiresAt }
  const [busy, setBusy] = useState(false);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGuardians = () => getMyGuardians().then(setGuardians).catch(() => setGuardians([]));

  useEffect(() => {
    loadGuardians().finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (busy) return;
    if (!PHONE_RE.test(phone)) {
      Alert.alert('전화번호 확인', '보호자 전화번호를 정확히 입력해주세요.');
      return;
    }
    setBusy(true);
    try {
      const res = await generateLinkCode(phone);
      setCode(res);
      loadGuardians();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '코드 생성에 실패했어요.';
      Alert.alert('실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="보호자" sub="가족과 결과를 함께 보세요"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* invite code — 보호자 전화번호로 연동 코드 생성 */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={18} style={{ borderRadius: 20, backgroundColor: T.blue, borderWidth: 0 }}>
            {code ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontSemiBold, letterSpacing: 0.4 }}>연동 코드</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>보호자에게 알려주세요</Text>
                </View>
                <Text style={{ fontSize: 38, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: 6, marginTop: 8 }}>{code.code}</Text>
                <Pressable onPress={() => setCode(null)} style={{ marginTop: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#fff' }}>다른 보호자 코드 만들기</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 14, color: '#fff', fontFamily: T.fontBold }}>보호자 연동 코드 만들기</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 18 }}>보호자 전화번호를 입력하면 연동 코드를 만들어드려요.</Text>
                <TextInput
                  style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder="보호자 전화번호 (01012345678)"
                  placeholderTextColor={T.muted}
                  keyboardType="number-pad"
                  maxLength={11}
                />
                <Pressable onPress={handleGenerate} disabled={busy} style={{ marginTop: 10, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                  {busy ? <ActivityIndicator color={T.blue}/> : <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.blue }}>코드 생성</Text>}
                </Pressable>
              </>
            )}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionLabel>연결된 가족 ({guardians.length}명)</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
            ) : guardians.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: T.muted, fontFamily: T.fontSemiBold }}>아직 연결된 보호자가 없어요.</Text>
              </View>
            ) : guardians.map((g, i) => (
              <View key={g.guardianUserId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < guardians.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <Avatar name={g.name} size={44}/>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: T.fontBold, color: T.ink }}>{g.name}</Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{fmtDate(g.linkedAt)}</Text>
                </View>
              </View>
            ))}
          </Card>

          <SectionLabel>공유하는 정보</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {sharing.map(([l, on], i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < sharing.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                <Text style={{ flex: 1, fontSize: 14, color: T.ink, fontFamily: T.fontMedium }}>{l}</Text>
                <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: on ? T.blue : T.line }}>
                  <View style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 }}/>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <TabBar tabs={ELDER_TABS} active={3}/>
    </View>
  );
}

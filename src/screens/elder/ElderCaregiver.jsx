import React, { useCallback, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Text from '../../components/Text';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import AppHeader from '../../components/AppHeader';
import TabBar from '../../components/TabBar';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import { getMe } from '../../api/user';
import { getMyGuardians, generateLinkCode } from '../../api/links';
import { ApiError } from '../../api/client';

const ELDER_TABS = [
  { label: '홈', path: '/(elder)/' },
  { label: '기록', path: '/(elder)/history' },
  { label: '보호자', path: '/(elder)/caregiver' },
  { label: '내정보', path: '/(elder)/profile' },
];

const PHONE_RE = /^01[016789]\d{7,8}$/;

const STEPS = [
  '보호자 전화번호로 연동 코드를 만들어요.',
  '보호자에게 코드를 알려주세요.',
  '보호자가 앱에서 코드를 입력하면 연결돼요.',
];

function fmtLinked(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 연결`;
}

// 만료 시각(백엔드 LocalDateTime) → "오후 3:24까지 사용할 수 있어요"
function fmtExpiry(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}까지 사용할 수 있어요`;
}

export default function ElderCaregiver() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);

  // 연동 코드 만들기 — 화면을 따로 두지 않고 이 화면의 하단 시트로 처리한다.
  const [sheet, setSheet] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(null);     // { code, expiresAt }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    let alive = true;
    getMe().then((m) => { if (alive) setName(m?.name || ''); }).catch(() => {});
    getMyGuardians()
      .then((list) => { if (alive) setGuardians(list ?? []); })
      .catch(() => { if (alive) setGuardians([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useFocusEffect(load);

  const handleGenerate = async () => {
    if (busy) return;
    if (!PHONE_RE.test(phone)) {
      Alert.alert('전화번호 확인', '보호자 전화번호를 정확히 입력해주세요.');
      return;
    }
    setBusy(true);
    try {
      setCode(await generateLinkCode(phone));
    } catch (e) {
      Alert.alert('실패', e instanceof ApiError ? e.message : '코드 생성에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  // 닫는 동안 보호자가 코드를 입력했을 수 있어 목록을 다시 불러온다.
  const closeSheet = () => { setSheet(false); load(); };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="보호자"/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, gap: T.sp.lg }}>
          <Text style={{ fontSize: T.fs.body, color: T.body }}>
            {guardians.length > 0
              ? `${guardians.length}명이 ${name ? `${name}님` : '회원님'}의 걸음을 함께 보고 있어요`
              : '아직 연결된 보호자가 없어요'}
          </Text>

          {loading ? (
            <View style={{ padding: T.sp.xl, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
          ) : guardians.length > 0 && (
            <Card pad={0}>
              {guardians.map((g, i) => (
                <View key={g.guardianUserId} style={{
                  flexDirection: 'row', alignItems: 'center', gap: T.sp.lg, minHeight: 56,
                  paddingVertical: T.sp.md, paddingHorizontal: T.sp.xl,
                  borderBottomWidth: i < guardians.length - 1 ? 1 : 0, borderBottomColor: T.line,
                }}>
                  <Avatar name={g.name} size={48} tone={[T.line, T.body]}/>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>{g.name}</Text>
                    <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 2 }}>{fmtLinked(g.linkedAt)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          <Card pad={T.sp.xl} style={{ backgroundColor: T.line }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, lineHeight: T.fs.caption * 1.6 }}>
              「보호자와 연결하기」를 누르면 전화번호를 입력해 6자리 코드를 만들 수 있어요. 이 코드를 보호자에게 알려주면 연결돼요.
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 64 + Math.max(insets.bottom, 10), paddingHorizontal: T.sp.lg, paddingVertical: T.sp.md, backgroundColor: T.bg }}>
        <Button onPress={() => setSheet(true)}>보호자와 연결하기</Button>
      </View>

      <TabBar tabs={ELDER_TABS} active={2}/>

      {/* 연동 코드 시트.
          ⚠️ Modal을 쓰지 않는다 — 안드로이드에서 Modal은 별도 윈도우라 useSafeAreaInsets가
          bottom: 0을 반환해 하단 내비게이션 바가 버튼을 덮는다(DemoMonitor에서 확인된 문제). */}
      {sheet && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
          <Pressable onPress={closeSheet} style={{ flex: 1, backgroundColor: 'rgba(16,22,29,0.45)' }}/>
          <View style={{
            backgroundColor: T.surface,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: T.sp.xl, paddingTop: T.sp.xl,
            paddingBottom: Math.max(insets.bottom, T.sp.md) + T.sp.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: T.sp.lg }}>
              <Text style={{ flex: 1, fontSize: T.fs.h, fontFamily: T.fontExtraBold, color: T.ink }}>
                보호자와 연결하기
              </Text>
              <Pressable
                onPress={closeSheet}
                hitSlop={12}
                style={{
                  width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Icon.plus width={18} height={18} color={T.body} style={{ transform: [{ rotate: '45deg' }] }}/>
              </Pressable>
            </View>

            {code ? (
              <View style={{ backgroundColor: T.blueWash, borderRadius: T.radius.md, padding: T.sp.xl, alignItems: 'center' }}>
                <Text style={{ fontSize: T.fs.caption, color: T.body, fontFamily: T.fontSemiBold }}>연동 코드</Text>
                <Text style={{
                  fontSize: 42, fontFamily: T.fontExtraBold, color: T.blue,
                  letterSpacing: 6, marginTop: T.sp.sm,
                }}>{code.code}</Text>
                {!!fmtExpiry(code.expiresAt) && (
                  <Text style={{ fontSize: T.fs.caption, color: T.body, fontFamily: T.fontMedium, marginTop: T.sp.xs }}>
                    {fmtExpiry(code.expiresAt)}
                  </Text>
                )}
                <Text style={{ fontSize: T.fs.body, color: T.ink, fontFamily: T.fontSemiBold, marginTop: T.sp.md, textAlign: 'center' }}>
                  이 번호를 보호자에게 알려주세요
                </Text>
                <Button variant="outline" onPress={() => { setCode(null); setPhone(''); }} style={{ marginTop: T.sp.lg, alignSelf: 'stretch' }}>
                  다른 보호자 코드 만들기
                </Button>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.font, lineHeight: 25 }}>
                  보호자 전화번호를 입력하면 연동 코드를 만들어드려요.
                </Text>
                <FormField
                  style={{ marginTop: T.sp.md }}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder="보호자 전화번호 (01012345678)"
                  keyboardType="number-pad"
                  maxLength={11}
                />
                <Button onPress={handleGenerate} loading={busy} style={{ marginTop: T.sp.md }}>코드 생성</Button>
              </>
            )}

            <View style={{ marginTop: T.sp.xl }}>
              <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontSemiBold, color: T.muted, marginBottom: T.sp.md }}>
                이렇게 연결돼요
              </Text>
              {STEPS.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: T.sp.md, marginTop: i === 0 ? 0 : T.sp.md }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14, backgroundColor: T.blueSoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontExtraBold, color: T.blue }}>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: T.fs.body, color: T.body, fontFamily: T.font, lineHeight: 24 }}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

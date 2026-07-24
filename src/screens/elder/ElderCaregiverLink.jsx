import React, { useState } from 'react';
import { View, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';
import { generateLinkCode } from '../../api/links';
import { ApiError } from '../../api/client';

const PHONE_RE = /^01[016789]\d{7,8}$/;

const STEPS = [
  '보호자 전화번호로 연동 코드를 만들어요.',
  '보호자에게 코드를 알려주세요.',
  '보호자가 앱에서 코드를 입력하면 연결돼요.',
];

export default function ElderCaregiverLink() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(null);     // { code, expiresAt }
  const [busy, setBusy] = useState(false);

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
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '코드 생성에 실패했어요.';
      Alert.alert('실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="보호자와 연결하기" sub="연동 코드를 만들어 가족을 연결해요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* invite code — 보호자 전화번호로 연동 코드 생성 */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Card pad={18} style={{ borderRadius: 20, backgroundColor: T.blue, borderWidth: 0 }}>
            {code ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: T.fs.caption, color: 'rgba(255,255,255,0.9)', fontFamily: T.fontSemiBold, letterSpacing: 0.4 }}>연동 코드</Text>
                  <Text style={{ fontSize: T.fs.caption, color: 'rgba(255,255,255,0.9)' }}>보호자에게 알려주세요</Text>
                </View>
                <Text style={{ fontSize: 42, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: 6, marginTop: 8 }}>{code.code}</Text>
                <Pressable onPress={() => setCode(null)} style={{ marginTop: 14, paddingVertical: 15, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center' }}>
                  <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontBold, color: '#fff' }}>다른 보호자 코드 만들기</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={{ fontSize: T.fs.body, color: '#fff', fontFamily: T.fontBold }}>보호자 연동 코드 만들기</Text>
                <Text style={{ fontSize: T.fs.label, color: 'rgba(255,255,255,0.9)', marginTop: 5, lineHeight: 21 }}>보호자 전화번호를 입력하면 연동 코드를 만들어드려요.</Text>
                <TextInput
                  style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 15, fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  placeholder="보호자 전화번호 (01012345678)"
                  placeholderTextColor={T.muted}
                  keyboardType="number-pad"
                  maxLength={11}
                />
                <Pressable onPress={handleGenerate} disabled={busy} style={{ marginTop: 12, height: T.tap, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                  {busy ? <ActivityIndicator color={T.blue}/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.blue }}>코드 생성</Text>}
                </Pressable>
              </>
            )}
          </Card>
        </View>

        {/* 연결 방법 안내 */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontBold, color: T.ink, marginBottom: 10 }}>이렇게 연결돼요</Text>
          <Card pad={18} style={{ borderRadius: 18 }}>
            {STEPS.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: i === 0 ? 0 : 14 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: T.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontExtraBold, color: T.blue }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: T.fs.sub, color: T.body, fontFamily: T.fontMedium, lineHeight: 22 }}>{s}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

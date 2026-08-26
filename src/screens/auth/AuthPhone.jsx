import React, { useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';
import { authStore } from '../../store/authStore';
import { sendSms } from '../../api/auth';
import { ApiError } from '../../api/client';

const PHONE_RE = /^01[016789]\d{7,8}$/;

const fmt = (d) => {
  const p = d.padEnd(11, '_');
  return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
};

export default function AuthPhone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState('');
  const [busy, setBusy] = useState(false);

  const handleKey = (k) => {
    if (k === '⌫') setDigits((d) => d.slice(0, -1));
    else if (digits.length < 11) setDigits((d) => d + k);
  };

  const handleNext = async () => {
    if (busy) return;
    if (!PHONE_RE.test(digits)) {
      Alert.alert('전화번호 확인', '올바른 전화번호를 입력해주세요.');
      return;
    }
    setBusy(true);
    try {
      await sendSms(digits, 'SIGNUP');
      authStore.set({ phone: digits });
      router.push('/(auth)/otp');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '인증번호 발송에 실패했어요. 다시 시도해주세요.';
      Alert.alert('발송 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <StepHeader step={1} total={5}/>

      <View style={{ flex: 1, paddingHorizontal: T.sp.lg }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: T.sp.xl }}>
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>전화번호를{'\n'}넣어주세요</Text>
          <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>문자로 인증번호를 보내드려요.</Text>

          <View style={{
            height: 72, borderRadius: T.radius.md, borderWidth: 2, borderColor: T.blue,
            backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.xxl,
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: T.fs.title, color: digits.length > 0 ? T.ink : T.muted }}>{fmt(digits)}</Text>
          </View>
        </ScrollView>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: T.sp.md }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
            <Pressable key={i} onPress={() => k && handleKey(k)} disabled={!k}
              style={{ width: '33.33%', height: 56, borderRadius: T.radius.sm, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: T.fs.title, fontFamily: T.fontSemiBold, color: T.ink }}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
        <Button onPress={handleNext} loading={busy}>인증번호 받기</Button>
      </View>
    </View>
  );
}

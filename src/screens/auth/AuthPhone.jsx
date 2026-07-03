import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';
import { sendSms } from '../../api/auth';
import { ApiError } from '../../api/client';

const PHONE_RE = /^01[016789]\d{7,8}$/;

function StepBar({ step, total = 6 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
    </View>
  );
}

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
    if (k === '⌫') {
      setDigits(d => d.slice(0, -1));
    } else if (digits.length < 11) {
      setDigits(d => d + k);
    }
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <StepBar step={1}/>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>전화번호를{'\n'}입력해주세요</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>본인 확인을 위해 인증번호를 보내드려요</Text>

        <View style={{ marginTop: 36 }}>
          <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.6 }}>전화번호</Text>
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: T.blue }}>
            <Text style={{ fontSize: 28, fontFamily: T.fontBold, color: T.muted }}>+82</Text>
            <Text style={{ fontSize: 28, fontFamily: T.fontBold, color: digits.length > 0 ? T.ink : T.muted }}>
              {fmt(digits)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 16, padding: 12, backgroundColor: T.blueWash, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Icon.spark width={14} height={14} color={T.blue}/>
          <Text style={{ fontSize: 12, color: T.body }}>대신 입력해드릴까요? <Text style={{ fontFamily: T.fontBold, color: T.blue }}>음성 안내</Text></Text>
        </View>

        <View style={{ flex: 1 }}/>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 16 }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            <Pressable key={i} onPress={() => k && handleKey(k)} disabled={!k}
              style={{ width: '33.33%', height: 52, borderRadius: 10, backgroundColor: k ? '#fff' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22, fontFamily: T.fontSemiBold, color: T.ink }}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable onPress={handleNext} disabled={busy} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>
          {busy
            ? <ActivityIndicator color="#fff"/>
            : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>인증번호 받기</Text>}
        </Pressable>
      </View>
    </View>
  );
}

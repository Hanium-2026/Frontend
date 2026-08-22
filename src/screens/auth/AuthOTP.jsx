import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Alert, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';
import { sendSms, verifySms } from '../../api/auth';
import { ApiError } from '../../api/client';

function ProgressBar({ ratio }) {
  return (
    <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: T.line }}>
      <View style={{ width: `${ratio * 100}%`, height: 6, borderRadius: 3, backgroundColor: T.ink }}/>
    </View>
  );
}

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const fmtPhone = (d) => {
  if (!d) return '';
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

export default function AuthOTP() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [secs, setSecs] = useState(180);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);
  const phone = authStore.get().phone;

  const verify = async (code) => {
    if (busy) return;
    setBusy(true);
    try {
      await verifySms(phone, code, 'SIGNUP');
      router.push('/(auth)/profile');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '인증에 실패했어요. 다시 시도해주세요.';
      Alert.alert('인증 실패', msg);
      setOtp('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await sendSms(phone, 'SIGNUP');
      setOtp('');
      startTimer();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '재발송에 실패했어요.';
      Alert.alert('재발송 실패', msg);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setSecs(180);
    timerRef.current = setInterval(() => {
      setSecs((s) => { if (s <= 1) { clearInterval(timerRef.current); return 0; } return s - 1; });
    }, 1000);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (otp.length === 6 && !busy) {
      const t = setTimeout(() => verify(otp), 250);
      return () => clearTimeout(t);
    }
  }, [otp]);

  const handleKey = (k) => {
    if (k === '⌫') setOtp((o) => o.slice(0, -1));
    else if (otp.length < 6) setOtp((o) => o + k);
  };

  const boxes = Array.from({ length: 6 }, (_, i) => otp[i] || '');

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.lg, paddingBottom: T.sp.md, flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <ProgressBar ratio={2 / 5}/>
      </View>

      <View style={{ flex: 1, paddingHorizontal: T.sp.lg, paddingTop: T.sp.xl }}>
        <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>문자로 받은{'\n'}숫자 6자리를 넣어주세요</Text>
        <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>{fmtPhone(phone) || '입력하신 번호'}로 보냈어요</Text>

        <View style={{ flexDirection: 'row', gap: T.sp.sm, marginTop: T.sp.xxl }}>
          {boxes.map((d, i) => {
            const isCurrent = i === otp.length;
            return (
              <View key={i} style={{
                flex: 1, height: 72, borderRadius: T.radius.md,
                backgroundColor: T.surface,
                borderWidth: isCurrent ? 2 : 1,
                borderColor: isCurrent ? T.blue : T.line,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink }}>{d}</Text>
              </View>
            );
          })}
        </View>

        <Text style={{ marginTop: T.sp.xl, fontSize: T.fs.body, color: T.body }}>
          남은 시간 <Text style={{ color: secs > 0 ? T.ink : T.danger, fontFamily: T.fontBold }}>{fmtTime(secs)}</Text>
        </Text>

        <Pressable onPress={resend} style={{ marginTop: T.sp.sm }}>
          <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink, textDecorationLine: 'underline' }}>다시 받기</Text>
        </Pressable>

        <View style={{ flex: 1 }}/>

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
        <Pressable onPress={() => verify(otp)} disabled={otp.length !== 6 || busy} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: otp.length === 6 ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
          {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: otp.length === 6 ? '#fff' : T.muted }}>확인</Text>}
        </Pressable>
      </View>
    </View>
  );
}

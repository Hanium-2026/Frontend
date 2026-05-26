import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import { authStore } from '../../store/authStore';
import { sendSms, verifySms } from '../../api/auth';
import { ApiError } from '../../api/client';

function StepBar({ step, total = 6 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? T.blue : T.line }}/>
      ))}
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
      setSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (otp.length === 6 && !busy) {
      const t = setTimeout(() => verify(otp), 250);
      return () => clearTimeout(t);
    }
  }, [otp]);

  const handleKey = (k) => {
    if (k === '⌫') {
      setOtp(o => o.slice(0, -1));
    } else if (otp.length < 6) {
      setOtp(o => o + k);
    }
  };

  const boxes = Array.from({ length: 6 }, (_, i) => otp[i] || '');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <StepBar step={2}/>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>인증번호를{'\n'}입력해주세요</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
          <Text style={{ fontFamily: T.fontBold, color: T.body }}>{fmtPhone(phone) || '입력하신 번호'}</Text>
          {' '}으로 6자리 코드를 보냈어요
        </Text>

        <View style={{ marginTop: 40, flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
          {boxes.map((d, i) => {
            const isCurrent = i === otp.length;
            const isFilled = i < otp.length;
            return (
              <View key={i} style={{
                width: 50, height: 60, borderRadius: 12,
                backgroundColor: isFilled ? T.blueSoft : T.bg,
                borderWidth: isCurrent ? 2 : 1.5,
                borderColor: isCurrent ? T.blue : (isFilled ? T.blueChip : T.line),
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 28, fontFamily: T.fontExtraBold, color: T.ink }}>{d}</Text>
              </View>
            );
          })}
        </View>

        <Text style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: T.muted }}>
          남은 시간{' '}
          <Text style={{ color: secs > 0 ? T.blue : '#FF453A', fontFamily: T.fontBold }}>
            {fmtTime(secs)}
          </Text>
        </Text>

        <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted }}>번호 변경</Text>
          </Pressable>
          <View style={{ width: 1, backgroundColor: T.line }}/>
          <Pressable onPress={resend} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.blue }}>다시 받기</Text>
          </Pressable>
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

      <View style={{ padding: 20, paddingBottom: 36 }}>
        <Pressable onPress={() => verify(otp)} disabled={otp.length !== 6 || busy} style={{ height: 58, borderRadius: 14, backgroundColor: otp.length === 6 ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
          {busy
            ? <ActivityIndicator color="#fff"/>
            : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: otp.length === 6 ? '#fff' : T.muted }}>확인</Text>}
        </Pressable>
      </View>
    </View>
  );
}

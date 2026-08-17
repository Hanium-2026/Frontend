import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import AppHeader from '../../components/AppHeader';
import { getMyGuardians } from '../../api/links';
import { uploadLocation } from '../../api/location';
import { ApiError } from '../../api/client';

export default function ElderSOS() {
  const router = useRouter();
  const [guardians, setGuardians] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getMyGuardians().then((list) => setGuardians(list ?? [])).catch(() => setGuardians([]));
  }, []);

  const contacts = guardians.map((g) => ({ i: 'family', t: g.name || '보호자', s: '연결된 보호자', on: true }));

  const sendEmergencyLocation = async () => {
    if (sending) return;
    setSending(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('위치 권한 필요', '비상 알림에 현재 위치를 포함하려면 위치 권한이 필요합니다.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await uploadLocation(current.coords.latitude, current.coords.longitude);
      Alert.alert('전송 완료', '현재 위치가 보호자 위치 화면으로 전송되었습니다.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '위치 전송에 실패했어요.';
      Alert.alert('전송 실패', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FCE0E0' }}>
      <AppHeader
        title="비상 알림"
        right={
          <Pressable
            onPress={() => router.back()}
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line }}>
            <Text style={{ fontSize: T.fs.caption, fontFamily: T.fontSemiBold, color: T.body }}>취소</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <View style={{ width: 232, height: 232, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, borderRadius: 136, backgroundColor: 'rgba(239,68,68,0.08)' }}/>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 116, backgroundColor: 'rgba(239,68,68,0.15)' }}/>
            <Pressable
              onLongPress={sendEmergencyLocation}
              delayLongPress={900}
              disabled={sending}
              style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 92, backgroundColor: T.danger, alignItems: 'center', justifyContent: 'center', shadowColor: T.danger, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.45, shadowRadius: 40, elevation: 20 }}>
              {sending ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: 52, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -2, lineHeight: 52 }}>SOS</Text>}
              <Text style={{ fontSize: T.fs.sub, fontFamily: T.fontBold, color: '#fff', marginTop: 6 }}>{sending ? '전송 중' : '꾹 눌러서 전송'}</Text>
            </Pressable>
            <Svg width={232} height={232} viewBox="0 0 232 232" style={{ position: 'absolute' }}>
              <Circle cx="116" cy="116" r="92" stroke={T.danger} strokeWidth="3" fill="none"
                strokeLinecap="round" strokeDasharray="578" strokeDashoffset="160"
                transform="rotate(-90 116 116)" opacity="0.9"/>
            </Svg>
          </View>
          <Text style={{ marginTop: 20, fontSize: T.fs.body, color: T.body, textAlign: 'center', lineHeight: 25, paddingHorizontal: 32 }}>
            <Text style={{ color: T.danger, fontFamily: T.fontBold }}>길게 누르면 위치가 전송</Text>됩니다.{'\n'}
            보호자 위치 화면에서 최신 위치를 확인할 수 있어요.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <SectionLabel>내 위치를 볼 수 있는 보호자</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {contacts.length === 0 && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: T.fs.body, color: T.body, lineHeight: 24 }}>
                  아직 연결된 보호자가 없어요.{'\n'}보호자를 연결해야 위치를 전달할 수 있어요.
                </Text>
              </View>
            )}
            {contacts.map((c, i) => {
              const I = Icon[c.i];
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < contacts.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.danger}/>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: T.ink }}>{c.t}</Text>
                    <Text style={{ fontSize: T.fs.caption, color: T.body, marginTop: 3 }}>{c.s}</Text>
                  </View>
                  <Icon.check width={20} height={20} color={T.danger}/>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

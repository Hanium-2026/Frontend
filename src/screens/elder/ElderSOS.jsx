import React, { useEffect, useState } from 'react';
import { View, Pressable, Alert, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import Svg, { Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';
import { getMyGuardians } from '../../api/links';
import { uploadLocation } from '../../api/location';
import { ApiError } from '../../api/client';

const RING = 260;
const CORE = 224;

export default function ElderSOS() {
  const [guardianCount, setGuardianCount] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getMyGuardians().then((list) => setGuardianCount((list ?? []).length)).catch(() => setGuardianCount(0));
  }, []);

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
      Alert.alert('전송 완료', '현재 위치가 보호자에게 전달되었습니다.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '위치 전송에 실패했어요.';
      Alert.alert('전송 실패', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="긴급 도움 요청" onBack/>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: T.sp.lg, gap: T.sp.xl }}>
        <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} style={{ position: 'absolute' }}>
            <Circle cx={RING / 2} cy={RING / 2} r={RING / 2 - 2} fill={T.dangerSoft}/>
          </Svg>
          <Pressable
            onLongPress={sendEmergencyLocation}
            delayLongPress={900}
            disabled={sending || guardianCount === 0}
            style={{
              width: CORE, height: CORE, borderRadius: CORE / 2, backgroundColor: T.danger,
              alignItems: 'center', justifyContent: 'center', gap: T.sp.sm,
              opacity: guardianCount === 0 ? 0.5 : 1,
            }}>
            {sending ? <ActivityIndicator color="#fff"/> : (
              <>
                <Text style={{ fontSize: 44, fontFamily: T.fontExtraBold, color: '#fff', lineHeight: 44 * 1.1 }}>SOS</Text>
                <Text style={{ fontSize: T.fs.body, color: 'rgba(255,255,255,0.9)' }}>계속 누르고 계세요</Text>
              </>
            )}
          </Pressable>
        </View>

        <Card pad={T.sp.xl} style={{ width: '100%' }}>
          <Text style={{ fontSize: T.fs.body, color: T.body, lineHeight: T.fs.body * 1.6 }}>
            버튼을 <Text style={{ fontFamily: T.fontBold, color: T.ink }}>약 1초간 누르고 있으면</Text> 연결된 보호자에게 현재 위치가 전달됩니다.
          </Text>
        </Card>

        {guardianCount === 0 && (
          <Card pad={T.sp.lg} style={{ width: '100%', backgroundColor: T.cautionSoft }}>
            <Text style={{ fontSize: T.fs.body, color: T.caution, lineHeight: T.fs.body * 1.5 }}>
              아직 연결된 보호자가 없어요. 보호자를 연결해야 위치를 전달할 수 있어요.
            </Text>
          </Card>
        )}
      </View>

      <Text style={{
        fontSize: T.fs.caption, color: T.muted, textAlign: 'center', lineHeight: T.fs.caption * 1.5,
        paddingHorizontal: T.sp.xl, paddingBottom: T.sp.xl,
      }}>
        보호자에게 위치를 보내는 기능입니다. 119에는 직접 전화해 주세요.
      </Text>
    </View>
  );
}

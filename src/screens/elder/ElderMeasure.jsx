import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import IMUTrace from '../../components/IMUTrace';

export default function ElderMeasure() {
  const router = useRouter();
  const stats = [
    ['이동 거리', '0.4', 'km'],
    ['케이던스', '108', '/분'],
    ['좌우차', '4', '%'],
  ];
  return (
    <View style={{ flex: 1, backgroundColor: '#0B1430' }}>
      <View style={{ position: 'absolute', top: -120, left: -80, width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(51,102,255,0.45)' }}/>
      <View style={{ position: 'absolute', bottom: 80, right: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(123,91,217,0.35)' }}/>

      <View style={{ flex: 1, paddingTop: 54, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color="#fff"/>
          </Pressable>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: T.fontSemiBold, letterSpacing: 1.5 }}>측정 중</Text>
          <View style={{ width: 36 }}/>
        </View>

        <View style={{ marginTop: 38, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold, fontSize: 14 }}>평소처럼 자연스럽게 걸어주세요</Text>
          <View style={{ marginTop: 18, width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
              <Circle cx="120" cy="120" r="106" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none"/>
              <Circle cx="120" cy="120" r="106" stroke="#fff" strokeWidth="4" fill="none"
                strokeLinecap="round" strokeDasharray="666" strokeDashoffset="222"
                transform="rotate(-90 120 120)"/>
              <Circle cx="120" cy="120" r="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
              <Circle cx="120" cy="120" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
            </Svg>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold, letterSpacing: 1 }}>남은 시간</Text>
              <Text style={{ fontSize: 64, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -3, lineHeight: 68, marginTop: 4 }}>18<Text style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>초</Text></Text>
              <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, marginTop: 8, color: '#7DA9FF' }}>걸음 41회 감지됨</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>가속도 (3축)</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>·  ·  · 안정적</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <IMUTrace width={324} height={36} color="#7DA9FF" seed={0.2}/>
            <IMUTrace width={324} height={36} color="#A78BFA" seed={1.4}/>
            <IMUTrace width={324} height={36} color="#5EEAD4" seed={2.7}/>
          </View>
        </View>

        <View style={{ marginTop: 22, flexDirection: 'row', gap: 10 }}>
          {stats.map(([l, v, s], k) => (
            <View key={k} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: T.fontSemiBold }}>{l}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4 }}>
                <Text style={{ fontSize: 20, fontFamily: T.fontExtraBold, color: '#fff' }}>{v}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{s}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          onPress={() => router.push('/(elder)/result')}
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#fff', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 16 }}>
          <View style={{ width: 28, height: 28, backgroundColor: T.blue, borderRadius: 6 }}/>
        </Pressable>
      </View>
    </View>
  );
}

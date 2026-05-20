import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import AppHeader from '../../components/AppHeader';

const contacts = [
  { i: 'family', t: '딸 민지',   s: '010-1234-5678',     on: true },
  { i: 'family', t: '아들 현우', s: '010-9876-5432',     on: true },
  { i: 'phone',  t: '119 응급 신고', s: '위치와 함께 전송', on: true },
];

export default function ElderSOS() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#FCE0E0' }}>
      <AppHeader
        title="비상 알림"
        right={
          <Pressable
            onPress={() => router.back()}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: T.line }}>
            <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.muted }}>취소</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <View style={{ width: 232, height: 232, alignItems: 'center', justifyContent: 'center' }}>
            {/* pulse rings */}
            <View style={{ position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, borderRadius: 136, backgroundColor: 'rgba(239,68,68,0.08)' }}/>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 116, backgroundColor: 'rgba(239,68,68,0.15)' }}/>
            <View style={{ position: 'absolute', top: 24, left: 24, right: 24, bottom: 24, borderRadius: 92, backgroundColor: T.danger, alignItems: 'center', justifyContent: 'center', shadowColor: T.danger, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.45, shadowRadius: 40, elevation: 20 }}>
              <Text style={{ fontSize: 52, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: -2, lineHeight: 52 }}>SOS</Text>
              <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: '#fff', marginTop: 6 }}>꾹 눌러서 전송</Text>
            </View>
            <Svg width={232} height={232} viewBox="0 0 232 232" style={{ position: 'absolute' }}>
              <Circle cx="116" cy="116" r="92" stroke={T.danger} strokeWidth="3" fill="none"
                strokeLinecap="round" strokeDasharray="578" strokeDashoffset="160"
                transform="rotate(-90 116 116)" opacity="0.9"/>
            </Svg>
          </View>
          <Text style={{ marginTop: 20, fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 32 }}>
            <Text style={{ color: T.danger, fontFamily: T.fontBold }}>5초 후 자동 전송</Text>됩니다.{'\n'}
            연결된 가족과 119에 알림이 전달돼요.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <SectionLabel>알림이 전달될 곳</SectionLabel>
          <Card pad={0} style={{ borderRadius: 18 }}>
            {contacts.map((c, i) => {
              const I = Icon[c.i];
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < contacts.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <I width={18} height={18} color={T.danger}/>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: T.fontBold, color: T.ink }}>{c.t}</Text>
                    <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{c.s}</Text>
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

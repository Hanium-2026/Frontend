import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';

export default function CareInvite() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft width={18} height={18} color={T.ink}/>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < 5 ? T.blue : T.line }}/>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>돌볼 가족을{'\n'}초대해주세요</Text>
        <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
          가족에게 이 4자리 코드를 알려주시면{'\n'}NEVO 앱에서 입력해 연결됩니다
        </Text>

        <View style={{ marginTop: 32, padding: 24, borderRadius: 20, backgroundColor: T.blue, overflow: 'hidden' }}>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: T.fontBold, letterSpacing: 1 }}>초대 코드</Text>
          <Text style={{ fontSize: 48, fontFamily: T.fontExtraBold, color: '#fff', letterSpacing: 12, marginTop: 12 }}>4827</Text>
          <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon.refresh width={13} height={13} color="rgba(255,255,255,0.85)"/>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>10:00 후 자동 갱신</Text>
          </View>
        </View>

        <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
          {[['message','문자'],['share','공유'],['phone','전화']].map(([i, l], k) => {
            const I = Icon[i];
            return (
              <Pressable key={k} style={{ flex: 1, borderRadius: 14, padding: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: T.line, alignItems: 'center', gap: 8 }}>
                <I width={22} height={22} color={T.blue}/>
                <Text style={{ fontSize: 12, fontFamily: T.fontSemiBold, color: T.ink }}>{l}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 20, padding: 14, backgroundColor: T.blueWash, borderRadius: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.blue }}/>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink }}>연결 대기 중...</Text>
            <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>가족이 코드를 입력하면 자동으로 진행돼요</Text>
          </View>
        </View>

        <Pressable onPress={() => router.push('/(auth)/welcome')} style={{ marginTop: 16, alignItems: 'center', padding: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>나중에 초대할게요</Text>
        </Pressable>
      </ScrollView>

      <View style={{ padding: 20, paddingBottom: 36 }}>
        <Pressable onPress={() => router.push('/(auth)/welcome')} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>완료</Text>
        </Pressable>
      </View>
    </View>
  );
}

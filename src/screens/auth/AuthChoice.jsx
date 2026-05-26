import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';

export default function AuthChoice() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{
        flex: 1,
        paddingTop: 100, paddingHorizontal: 32,
        alignItems: 'center',
      }}>
        <View style={{
          width: 84, height: 84, borderRadius: 24, backgroundColor: T.blue,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: T.blue, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.3, shadowRadius: 32,
          elevation: 8, marginBottom: 24,
        }}>
          <Icon.walk width={48} height={48} color="#fff"/>
        </View>
        <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32, textAlign: 'center' }}>
          NEVO를{'\n'}시작해볼까요?
        </Text>
        <Text style={{ fontSize: 14, color: T.muted, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
          간단한 등록 후 바로 사용하실 수 있어요
        </Text>

        <View style={{
          marginTop: 56, width: '100%', backgroundColor: T.blueWash,
          borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <Icon.shield width={22} height={22} color={T.blue}/>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontBold, color: T.ink }}>건강 정보 안전 보호</Text>
            <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>의료기기 수준 암호화로 저장됩니다</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 20, paddingBottom: 40 }}>
        <Pressable onPress={() => router.push('/(auth)/role')} style={{
          height: 58, borderRadius: 14, backgroundColor: T.blue,
          alignItems: 'center', justifyContent: 'center', marginBottom: 10,
        }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>처음이에요 · 시작하기</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/login')} style={{
          height: 58, borderRadius: 14, backgroundColor: '#fff',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1.5, borderColor: T.line,
        }}>
          <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: T.ink }}>이미 계정이 있어요</Text>
        </Pressable>
        <Text style={{ marginTop: 16, fontSize: 11.5, color: T.muted, textAlign: 'center', lineHeight: 18 }}>
          시작하시면 이용약관과 개인정보 처리방침에{'\n'}동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
}

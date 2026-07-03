import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../tokens';
import Icon from '../icons';
import { serverConfig, DEFAULT_BACKEND_BASE } from '../store/serverConfig';

// 백엔드 서버 주소 설정 화면. 로컬 테스트 시 노트북 LAN IP로 바꾸는 등
// APK 재빌드 없이 여기서 주소를 바꿔 저장한다.
export default function ServerConfig() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [backend, setBackend] = useState(serverConfig.getBackendBase());

  const handleSave = async () => {
    await serverConfig.save({ backendBase: backend });
    // 저장 시 normalize된 최종값으로 입력칸도 맞춰준다.
    setBackend(serverConfig.getBackendBase());
    Alert.alert('저장 완료', '서버 주소가 저장됐어요. 새 주소로 바로 연결됩니다.');
  };

  const handleReset = () => {
    Alert.alert('기본값으로 초기화', '백엔드 서버 주소를 기본값으로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: async () => {
        await serverConfig.reset();
        setBackend(serverConfig.getBackendBase());
      } },
    ]);
  };

  const field = (label, hint, value, onChange, defaultValue) => (
    <View style={{ marginTop: 22 }}>
      <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontSize: 11.5, color: T.muted, marginBottom: 8, lineHeight: 16 }}>{hint}</Text>
      <TextInput
        style={{ backgroundColor: T.bg, borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: value ? T.blue : T.line, fontSize: 14, fontFamily: T.fontSemiBold, color: T.ink }}
        value={value}
        onChangeText={onChange}
        placeholder={defaultValue}
        placeholderTextColor={T.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Text style={{ fontSize: 10.5, color: T.muted, marginTop: 6 }}>기본값: {defaultValue}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <Text style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBold, letterSpacing: 0.6 }}>서버 설정</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 12 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 24, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.6, lineHeight: 30 }}>서버 주소</Text>
          <Text style={{ fontSize: 13, color: T.muted, marginTop: 8, lineHeight: 20 }}>
            백엔드 서버 IP가 바뀌면 여기서 바꿔 저장하세요. 앱을 다시 설치할 필요 없어요.
          </Text>

          {field(
            '백엔드 서버',
            '로그인·세션·리포트 등. 로컬 테스트 시 노트북 LAN IP(http://192.168.x.x:8080)로 변경.',
            backend, setBackend, DEFAULT_BACKEND_BASE,
          )}

          <Pressable onPress={handleReset} style={{ marginTop: 24, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Icon.refresh width={15} height={15} color={T.muted}/>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted }}>기본값으로 초기화</Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20) }}>
          <Pressable onPress={handleSave} style={{ height: 58, borderRadius: 14, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: '#fff' }}>저장</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import T from '../../tokens';
import Icon from '../../icons';
import { connectWard } from '../../api/links';
import { ApiError } from '../../api/client';

export default function CareInvite() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = code.trim().length >= 4 && !busy;
  const donePath = returnTo === 'caregiver' ? '/(caregiver)/' : '/(auth)/welcome';

  const handleConnect = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await connectWard(code.trim().toUpperCase());
      router.replace(donePath);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '연결에 실패했어요. 코드를 확인해주세요.';
      Alert.alert('연결 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: T.blue }}/>
            ))}
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: -0.7, lineHeight: 32 }}>가족과{'\n'}연결해주세요</Text>
          <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 22 }}>
            노약자 앱에서 만든 연동 코드를{'\n'}입력하면 연결됩니다
          </Text>

          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBold, marginBottom: 8 }}>연동 코드</Text>
            <TextInput
              style={{ backgroundColor: T.bg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 18, borderWidth: 1.5, borderColor: code ? T.blue : T.line, fontSize: 26, fontFamily: T.fontExtraBold, color: T.ink, letterSpacing: 6, textAlign: 'center' }}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
              placeholder="------"
              placeholderTextColor={T.line}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
            />
          </View>

          <Pressable onPress={() => router.replace(donePath)} style={{ marginTop: 18, alignItems: 'center', padding: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>나중에 연결할게요</Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: 20, paddingBottom: 36 }}>
          <Pressable onPress={handleConnect} disabled={!canSubmit} style={{ height: 58, borderRadius: 14, backgroundColor: canSubmit ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: 17, fontFamily: T.fontBold, color: canSubmit ? '#fff' : T.muted }}>연결하기</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

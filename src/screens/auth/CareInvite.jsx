import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Icon from '../../icons';
import { connectWard } from '../../api/links';
import { ApiError } from '../../api/client';

export default function CareInvite() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = code.trim().length === 6 && !busy;
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
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={{ paddingTop: insets.top + T.sp.md, paddingHorizontal: T.sp.lg, paddingBottom: T.sp.md, flexDirection: 'row', alignItems: 'center', gap: T.sp.md }}>
          <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, borderWidth: 1, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.arrowLeft width={18} height={18} color={T.ink}/>
          </Pressable>
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink }}>어르신 연결</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.lg }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>6자리 코드를{'\n'}넣어주세요</Text>
          <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>어르신 앱의 «보호자» 화면에서 만들 수 있어요.</Text>

          <View style={{
            height: 72, borderRadius: T.radius.md, borderWidth: 2, borderColor: T.blue,
            backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.xxl,
            justifyContent: 'center',
          }}>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6))}
              placeholder="------"
              placeholderTextColor={T.line}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, letterSpacing: 6, textAlign: 'center' }}
            />
          </View>

          <Pressable onPress={() => router.replace(donePath)} style={{ marginTop: T.sp.lg, alignItems: 'center', padding: T.sp.sm }}>
            <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.muted, textDecorationLine: 'underline' }}>나중에 연결할게요</Text>
          </Pressable>
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Pressable onPress={handleConnect} disabled={!canSubmit} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: canSubmit ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
            {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: canSubmit ? '#fff' : T.muted }}>연결하기</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Text from '../../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import AppHeader from '../../components/AppHeader';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
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
        <AppHeader title="어르신 연결" onBack/>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.lg }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>6자리 코드를{'\n'}넣어주세요</Text>
          <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>어르신 앱의 «보호자» 화면에서 만들 수 있어요.</Text>

          <FormField
            style={{ marginTop: T.sp.xxl }}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6))}
            placeholder="------"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />

          <Button variant="text" onPress={() => router.replace(donePath)} style={{ marginTop: T.sp.lg, alignSelf: 'center' }}>
            나중에 연결할게요
          </Button>
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Button onPress={handleConnect} disabled={code.trim().length !== 6} loading={busy}>연결하기</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

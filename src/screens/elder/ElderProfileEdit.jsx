import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { getMe, updateMe } from '../../api/user';
import { getPhysicalInfo, updatePhysicalInfo } from '../../api/ward';
import { ApiError } from '../../api/client';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function Field({ label, value, onChangeText, keyboardType = 'default', placeholder }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: T.fs.caption, color: T.body, fontFamily: T.fontBold, marginBottom: 8 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={T.muted}
        style={{ backgroundColor: T.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 16, borderWidth: 1.5, borderColor: value ? T.blueChip : T.line, fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}
      />
    </View>
  );
}

export default function ElderProfileEdit() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    height: '',
    weight: '',
    birthDate: '',
    gender: 'FEMALE',
  });

  useEffect(() => {
    let alive = true;
    Promise.all([getMe(), getPhysicalInfo()])
      .then(([me, ward]) => {
        if (!alive) return;
        setForm({
          name: me?.name || '',
          height: ward?.height != null ? String(Math.round(ward.height)) : '',
          weight: ward?.weight != null ? String(Math.round(ward.weight)) : '',
          birthDate: ward?.birthDate || '',
          gender: ward?.gender || 'FEMALE',
        });
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (saving) return;
    const name = form.name.trim();
    const height = Number(form.height);
    const weight = Number(form.weight);
    if (!name) {
      Alert.alert('입력 확인', '이름을 입력해주세요.');
      return;
    }
    if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(weight) || weight <= 0) {
      Alert.alert('입력 확인', '키와 몸무게를 숫자로 입력해주세요.');
      return;
    }
    if (!DATE_RE.test(form.birthDate)) {
      Alert.alert('입력 확인', '생년월일은 YYYY-MM-DD 형식으로 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await updateMe(name);
      await updatePhysicalInfo({
        height,
        weight,
        birthDate: form.birthDate,
        gender: form.gender,
      });
      Alert.alert('저장 완료', '내 정보가 저장되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(elder)/profile') },
      ]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '저장에 실패했어요.';
      Alert.alert('저장 실패', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <AppHeader title="내 정보 수정" sub="프로필과 신체 정보를 관리해요" onBack/>

        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <SectionLabel>기본 정보</SectionLabel>
            <Card pad={16} style={{ borderRadius: 18 }}>
              <Field label="이름" value={form.name} onChangeText={(v) => setField('name', v)} placeholder="홍길동"/>
              <Text style={{ fontSize: T.fs.caption, color: T.body, fontFamily: T.fontBold, marginBottom: 8 }}>성별</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  ['FEMALE', '여성'],
                  ['MALE', '남성'],
                ].map(([value, label]) => (
                  <Pressable
                    key={value}
                    onPress={() => setField('gender', value)}
                    style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: form.gender === value ? T.blue : T.bg, borderWidth: 1, borderColor: form.gender === value ? T.blue : T.line, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: form.gender === value ? '#fff' : T.body }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <SectionLabel>신체 정보</SectionLabel>
            <Card pad={16} style={{ borderRadius: 18 }}>
              <Field label="키(cm)" value={form.height} onChangeText={(v) => setField('height', v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="165"/>
              <Field label="몸무게(kg)" value={form.weight} onChangeText={(v) => setField('weight', v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="60"/>
              <Field label="생년월일" value={form.birthDate} onChangeText={(v) => setField('birthDate', v.replace(/[^0-9-]/g, '').slice(0, 10))} keyboardType="numbers-and-punctuation" placeholder="1950-01-01"/>
            </Card>
          </ScrollView>
        )}

        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 28 }}>
          <Pressable onPress={save} disabled={saving || loading} style={{ height: T.tap, borderRadius: 16, backgroundColor: saving || loading ? T.line : T.blue, alignItems: 'center', justifyContent: 'center' }}>
            {saving ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: 18, fontFamily: T.fontExtraBold, color: '#fff' }}>저장하기</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import AppHeader from '../../components/AppHeader';
import FormField from '../../components/FormField';
import SelectableCard from '../../components/SelectableCard';
import Button from '../../components/Button';
import { getPhysicalInfo, updatePhysicalInfo } from '../../api/ward';
import { ApiError } from '../../api/client';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function ElderProfileEdit() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ height: '', weight: '', birthDate: '', gender: 'FEMALE' });

  useEffect(() => {
    let alive = true;
    getPhysicalInfo()
      .then((ward) => {
        if (!alive) return;
        setForm({
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
    const height = Number(form.height);
    const weight = Number(form.weight);
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
      await updatePhysicalInfo({ height, weight, birthDate: form.birthDate, gender: form.gender });
      router.replace('/(elder)/profile');
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
        <AppHeader title="내 정보 수정" onBack/>

        {loading ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}><ActivityIndicator color={T.blue}/></View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.md, paddingBottom: 120, gap: T.sp.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FormField label="키" unit="cm" value={form.height} onChangeText={(v) => setField('height', v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad"/>
            <FormField label="몸무게" unit="kg" value={form.weight} onChangeText={(v) => setField('weight', v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad"/>
            {/* 확정 디자인엔 없지만 생년월일은 백엔드 신체정보 필수값이라 폼에서 뺄 수 없다(키·몸무게·성별만 그린 목업의 누락으로 판단). */}
            <FormField
              label="생년월일"
              value={form.birthDate}
              onChangeText={(v) => setField('birthDate', v.replace(/[^0-9-]/g, '').slice(0, 10))}
              keyboardType="numbers-and-punctuation"
              placeholder="1950-01-01"
            />

            <View>
              <Text style={{ fontSize: T.fs.caption, color: T.muted }}>성별</Text>
              <View style={{ flexDirection: 'row', gap: T.sp.md, marginTop: T.sp.sm }}>
                {[['FEMALE', '여성'], ['MALE', '남성']].map(([value, label]) => (
                  <SelectableCard key={value} title={label} selected={form.gender === value} onPress={() => setField('gender', value)}/>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        <View style={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.sm, paddingBottom: T.sp.xl, backgroundColor: T.bg }}>
          <Button onPress={save} disabled={loading} loading={saving}>저장</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

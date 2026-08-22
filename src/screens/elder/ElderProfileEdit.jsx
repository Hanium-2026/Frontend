import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import T from '../../tokens';
import AppHeader from '../../components/AppHeader';
import { getPhysicalInfo, updatePhysicalInfo } from '../../api/ward';
import { ApiError } from '../../api/client';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function NumberField({ label, value, onChangeText, unit }) {
  return (
    <View>
      <Text style={{ fontSize: T.fs.caption, color: T.muted }}>{label}</Text>
      <View style={{
        height: 60, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.line,
        backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.sm,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          style={{ flex: 1, fontSize: T.fs.h, color: T.ink }}
        />
        <Text style={{ fontSize: T.fs.body, color: T.muted }}>{unit}</Text>
      </View>
    </View>
  );
}

// 확정 디자인엔 없지만 생년월일은 백엔드 신체정보 필수값이라 폼에서 뺄 수 없다(키·몸무게·성별만 그린 목업의 누락으로 판단).
function DateField({ value, onChangeText }) {
  return (
    <View>
      <Text style={{ fontSize: T.fs.caption, color: T.muted }}>생년월일</Text>
      <View style={{
        height: 60, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.line,
        backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.sm,
        justifyContent: 'center',
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numbers-and-punctuation"
          placeholder="1950-01-01"
          placeholderTextColor={T.muted}
          style={{ fontSize: T.fs.h, color: T.ink }}
        />
      </View>
    </View>
  );
}

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
            <NumberField label="키" value={form.height} onChangeText={(v) => setField('height', v.replace(/[^0-9.]/g, ''))} unit="cm"/>
            <NumberField label="몸무게" value={form.weight} onChangeText={(v) => setField('weight', v.replace(/[^0-9.]/g, ''))} unit="kg"/>
            <DateField value={form.birthDate} onChangeText={(v) => setField('birthDate', v.replace(/[^0-9-]/g, '').slice(0, 10))}/>

            <View>
              <Text style={{ fontSize: T.fs.caption, color: T.muted }}>성별</Text>
              <View style={{ flexDirection: 'row', gap: T.sp.md, marginTop: T.sp.sm }}>
                {[['FEMALE', '여성'], ['MALE', '남성']].map(([value, label]) => {
                  const on = form.gender === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setField('gender', value)}
                      style={{
                        flex: 1, height: 60, borderRadius: T.radius.md, backgroundColor: T.surface,
                        borderWidth: on ? 2 : 1, borderColor: on ? T.blue : T.line,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: on ? T.blue : T.muted }}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        )}

        <View style={{ paddingHorizontal: T.sp.lg, paddingTop: T.sp.sm, paddingBottom: T.sp.xl, backgroundColor: T.bg }}>
          <Pressable onPress={save} disabled={saving || loading} style={{ height: 60, borderRadius: T.radius.md, backgroundColor: saving || loading ? T.line : T.blue, alignItems: 'center', justifyContent: 'center' }}>
            {saving ? <ActivityIndicator color="#fff"/> : <Text style={{ fontSize: T.fs.body, fontFamily: T.fontBold, color: '#fff' }}>저장</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

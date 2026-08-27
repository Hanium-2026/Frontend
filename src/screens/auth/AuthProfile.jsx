import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from '../../tokens';
import Button from '../../components/Button';
import StepHeader from '../../components/StepHeader';
import SelectableCard from '../../components/SelectableCard';
import FormField from '../../components/FormField';
import { authStore } from '../../store/authStore';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function AuthProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWard = authStore.get().role !== 'caregiver';
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('이름 확인', '이름을 입력해주세요.');
      return;
    }
    if (!DATE_RE.test(birthDate)) {
      Alert.alert('생년월일 확인', '생년월일은 YYYY-MM-DD 형식으로 입력해주세요.');
      return;
    }
    if (isWard) {
      const h = parseFloat(height), w = parseFloat(weight);
      if (!(h > 0) || !(w > 0)) {
        Alert.alert('신체 정보 확인', '키와 몸무게를 입력해주세요.');
        return;
      }
      authStore.set({ height: h, weight: w });
    }
    authStore.set({ name: name.trim(), gender, birthDate });
    router.push('/(auth)/password');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <StepHeader step={3} total={5}/>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: T.sp.lg, paddingTop: T.sp.xl }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.ink, lineHeight: T.fs.title * 1.35 }}>이름을{'\n'}알려주세요</Text>
          <Text style={{ fontSize: T.fs.body, color: T.body, marginTop: T.sp.sm }}>보호자에게 이 이름으로 보입니다.</Text>

          <View style={{
            height: 72, borderRadius: T.radius.md, borderWidth: 2, borderColor: T.blue,
            backgroundColor: T.surface, paddingHorizontal: T.sp.lg, marginTop: T.sp.xxl,
            justifyContent: 'center',
          }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor={T.muted}
              returnKeyType="done"
              style={{ fontSize: T.fs.title, color: T.ink }}
            />
          </View>

          <View style={{ marginTop: T.sp.xl }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>성별</Text>
            <View style={{ flexDirection: 'row', gap: T.sp.md, marginTop: T.sp.sm }}>
              {[['female', '여성'], ['male', '남성']].map(([value, label]) => (
                <SelectableCard key={value} title={label} selected={gender === value} onPress={() => setGender(value)}/>
              ))}
            </View>
          </View>

          <View style={{ marginTop: T.sp.xl }}>
            <FormField
              label="생년월일"
              value={birthDate}
              onChangeText={(v) => setBirthDate(v.replace(/[^0-9-]/g, '').slice(0, 10))}
              keyboardType="numbers-and-punctuation"
              placeholder="1950-01-01"
            />
          </View>

          {isWard && (
            <View style={{ marginTop: T.sp.xl, flexDirection: 'row', gap: T.sp.md }}>
              {[['키', 'cm', height, setHeight, '160'], ['몸무게', 'kg', weight, setWeight, '58']].map(([label, unit, value, setter, placeholder]) => (
                <FormField
                  key={label}
                  style={{ flex: 1 }}
                  label={label}
                  unit={unit}
                  value={value}
                  onChangeText={(t) => setter(t.replace(/[^0-9.]/g, ''))}
                  placeholder={placeholder}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={{ padding: T.sp.lg, paddingBottom: Math.max(insets.bottom, T.sp.xl) }}>
          <Button onPress={handleNext}>다음</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

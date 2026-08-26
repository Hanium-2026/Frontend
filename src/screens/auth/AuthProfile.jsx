import React, { useState } from 'react';
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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

const CURRENT_YEAR = new Date().getFullYear();

export default function AuthProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWard = authStore.get().role !== 'caregiver';
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female');
  const [birthYear, setBirthYear] = useState(1960);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('이름 확인', '이름을 입력해주세요.');
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
    authStore.set({ name: name.trim(), gender, birthYear });
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
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>출생 연도</Text>
            <View style={{
              backgroundColor: T.surface, borderRadius: T.radius.md, paddingHorizontal: T.sp.lg, height: 60,
              borderWidth: 1, borderColor: T.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: T.sp.sm,
            }}>
              <Pressable onPress={() => setBirthYear((y) => Math.max(1920, y - 1))} hitSlop={8}>
                <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.blue }}>−</Text>
              </Pressable>
              <Text style={{ fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.ink }}>
                {birthYear}년 ({CURRENT_YEAR - birthYear}세)
              </Text>
              <Pressable onPress={() => setBirthYear((y) => Math.min(2010, y + 1))} hitSlop={8}>
                <Text style={{ fontSize: T.fs.title, fontFamily: T.fontBold, color: T.blue }}>+</Text>
              </Pressable>
            </View>
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

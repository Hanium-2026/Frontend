import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import AppHeader from '../../components/AppHeader';
import { FONT_SCALE_OPTIONS, fontScale, useFontScaleKey } from '../../store/fontScale';

export default function ElderAppSettings() {
  const selected = useFontScaleKey();

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="앱 설정" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: T.sp.xxl }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xs }}>
          <Card pad={T.sp.xl}>
            <Text style={{ fontSize: T.fs.h, fontFamily: T.fontSemiBold, color: T.ink }}>글씨 크기</Text>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 4 }}>기본값은 «크게»입니다</Text>
            <View style={{ flexDirection: 'row', gap: T.sp.sm, marginTop: T.sp.lg }}>
              {FONT_SCALE_OPTIONS.map((o) => {
                const on = o.key === selected;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => fontScale.set(o.key)}
                    style={{
                      flex: 1, height: 56, borderRadius: T.radius.md,
                      borderWidth: on ? 2 : 1, borderColor: on ? T.blue : T.line,
                      backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: Math.round(T.fs.body * o.scale), fontFamily: T.fontSemiBold, color: on ? T.blue : T.muted }}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: T.sp.lg, marginTop: T.sp.xl }}>
          <Text style={{ fontSize: T.fs.caption, color: T.muted, paddingHorizontal: 4 }}>미리보기</Text>
          <Card pad={T.sp.xl} style={{ marginTop: T.sp.sm }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted }}>오늘 걸음 건강 점수</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <Text style={{ fontSize: T.fs.display, fontFamily: T.fontExtraBold, color: T.ink, lineHeight: T.fs.display * 1.1 }}>78</Text>
              <Text style={{ fontSize: T.fs.body, color: T.muted }}>점</Text>
            </View>
            <View style={{ alignSelf: 'flex-start', marginTop: T.sp.sm }}>
              <Pill tone="ok" size="lg">안정</Pill>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

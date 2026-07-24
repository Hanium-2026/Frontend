import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Icon from '../../icons';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import AppHeader from '../../components/AppHeader';
import { FONT_SCALE_OPTIONS, fontScale, useFontScaleKey } from '../../store/fontScale';

export default function ElderAppSettings() {
  const selected = useFontScaleKey();

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="앱 설정" sub="글씨 크기 등 사용 환경을 설정해요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <SectionLabel>글씨 크기</SectionLabel>

          {/* 실시간 미리보기 — 선택하면 즉시 반영 */}
          <Card pad={16} style={{ borderRadius: 18, marginBottom: 12 }}>
            <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.fontSemiBold }}>미리보기</Text>
            <Text style={{ fontSize: T.fs.h, color: T.ink, fontFamily: T.fontBold, marginTop: 8 }}>오늘 보행 점수 82점</Text>
            <Text style={{ fontSize: T.fs.body, color: T.body, fontFamily: T.font, marginTop: 6, lineHeight: 24 }}>
              걸음이 안정적이에요. 이 정도 크기로 글씨가 보여요.
            </Text>
          </Card>

          <Card pad={0} style={{ borderRadius: 18 }}>
            {FONT_SCALE_OPTIONS.map((o, i) => {
              const on = o.key === selected;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => fontScale.set(o.key)}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < FONT_SCALE_OPTIONS.length - 1 ? 1 : 0, borderBottomColor: T.line }}>
                  <Text style={{ flex: 1, fontSize: T.fs.body, fontFamily: on ? T.fontBold : T.fontSemiBold, color: on ? T.blueDark : T.ink }}>{o.label}</Text>
                  {on ? (
                    <Icon.check width={22} height={22} color={T.blue}/>
                  ) : (
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: T.line }}/>
                  )}
                </Pressable>
              );
            })}
          </Card>
          <Text style={{ fontSize: T.fs.caption, color: T.muted, fontFamily: T.font, marginTop: 12, lineHeight: 20, paddingHorizontal: 4 }}>
            글씨 크기는 이 기기에 저장되며 앱 전체에 적용돼요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

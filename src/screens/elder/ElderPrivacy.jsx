import React from 'react';
import { View, ScrollView } from 'react-native';
import Text from '../../components/Text';
import T from '../../tokens';
import Card from '../../components/Card';
import AppHeader from '../../components/AppHeader';

const SECTIONS = [
  ['수집하는 정보', '걸음 센서 데이터(가속도·자이로), 보행 점수, 신체정보(키·몸무게·생년월일·성별), 전화번호를 수집해요.'],
  ['기기 안에서 분석', '보행 정상/이상 판정은 휴대폰 안에서 이뤄져요. 원시 센서 데이터는 서버로 보내지 않고, 분 단위 점수 요약만 저장돼요.'],
  ['정보 이용 목적', '보행 분석과 이상 조기 탐지, 연결된 보호자와의 결과 공유, 위험 상황 알림에만 사용해요.'],
  ['위치 정보', '보호자와 연결한 경우에 한해, 안전 확인을 위해 위치를 보호자에게 공유할 수 있어요.'],
  ['보관과 삭제', '회원 탈퇴 시 계정과 관련 데이터는 삭제돼요. 내 정보 화면에서 언제든 탈퇴할 수 있어요.'],
];

export default function ElderPrivacy() {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <AppHeader title="개인정보 보호" sub="어떤 정보를 어떻게 지키는지 알려드려요" onBack/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 4, gap: 12 }}>
          {SECTIONS.map(([title, body], i) => (
            <Card key={i} pad={18} style={{ borderRadius: 18 }}>
              <Text style={{ fontSize: T.fs.h, fontFamily: T.fontBold, color: T.ink }}>{title}</Text>
              <Text style={{ fontSize: T.fs.sub, fontFamily: T.font, color: T.body, marginTop: 8, lineHeight: 24 }}>{body}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import React from 'react';
import { View, Pressable } from 'react-native';
import Text from './Text';
import T from '../tokens';

// 라벨+값 한 줄 정보 행. ElderProfile·ElderHistory·ElderCaregiver 등에서 각자
// {minHeight:56, borderBottomWidth:1} 형태로 반복 구현돼 있던 것을 Figma의 List Row에 맞춰 통일한 것.
// onPress를 주면 탭 가능한 메뉴 행(Pressable), 없으면 정보 표시용(View)으로 렌더한다.
export default function ListRow({ label, value, onPress, last = false, style }) {
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={[{
      height: T.tap,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderBottomWidth: last ? 0 : 1, borderBottomColor: T.line,
    }, style]}>
      <Text style={{ fontSize: T.fs.body, color: T.body }}>{label}</Text>
      <Text style={{ fontSize: T.fs.body, fontFamily: T.fontMedium, color: T.ink }}>{value}</Text>
    </Wrap>
  );
}

import React from 'react';
import { Pressable } from 'react-native';
import Text from './Text';
import T from '../tokens';

// 역할 선택(AuthRolePick)·성별 선택(AuthProfile)에서 각자 동일한 스타일로 중복 구현돼 있던
// "선택형 카드"를 하나로 통일한 것. 선택 시 테두리가 1px→2px T.blue로 바뀐다.
export default function SelectableCard({ title, sub, selected, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[{
      flex: 1, borderRadius: T.radius.md, padding: T.sp.xl,
      backgroundColor: T.surface,
      borderWidth: selected ? 2 : 1, borderColor: selected ? T.blue : T.line,
    }, style]}>
      <Text style={{ fontSize: T.fs.body, fontFamily: T.fontMedium, color: T.ink }}>{title}</Text>
      {sub && <Text style={{ fontSize: T.fs.caption, color: T.muted, marginTop: 4 }}>{sub}</Text>}
    </Pressable>
  );
}

import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import T from '../tokens';

// 상태 칩. 색은 의미색 토큰만 쓰고, 글자는 최소 크기(14) 아래로 내리지 않는다.
// size='sm'은 캡션 크기로 여백만 좁히고, size='lg'는 화면 주인공 칩(홈·결과 점수 옆)이라 본문 크기로 키운다.
const TONE = {
  ok:      { bg: T.okSoft,      fg: T.ok },
  caution: { bg: T.cautionSoft, fg: T.caution },
  danger:  { bg: T.dangerSoft,  fg: T.danger },
  info:    { bg: T.blueSoft,    fg: T.blue },
  neutral: { bg: T.line,        fg: T.body },
};

export default function Pill({ tone = 'ok', children, size = 'md' }) {
  const c = TONE[tone] || TONE.neutral;
  const fontSize = size === 'lg' ? T.fs.body : T.fs.caption;
  const paddingHorizontal = size === 'sm' ? T.sp.sm : T.sp.md;
  const paddingVertical = size === 'lg' ? T.sp.sm : size === 'sm' ? 3 : 5;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bg,
      paddingHorizontal, paddingVertical,
      borderRadius: T.radius.sm,
    }}>
      <Text style={{ fontSize, color: c.fg, fontFamily: T.fontSemiBold }}>{children}</Text>
    </View>
  );
}

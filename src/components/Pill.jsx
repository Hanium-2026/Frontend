import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import T from '../tokens';

// 상태 칩. 색은 의미색 토큰만 쓰고, 글자는 최소 크기(14) 아래로 내리지 않는다.
// size='sm'은 글자를 줄이는 게 아니라 여백만 좁힌다.
const TONE = {
  ok:      { bg: T.okSoft,      fg: T.ok },
  caution: { bg: T.cautionSoft, fg: T.caution },
  danger:  { bg: T.dangerSoft,  fg: T.danger },
  info:    { bg: T.blueSoft,    fg: T.blue },
  neutral: { bg: T.line,        fg: T.body },
};

export default function Pill({ tone = 'ok', children, size = 'md' }) {
  const c = TONE[tone] || TONE.neutral;
  const isSmall = size === 'sm';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bg,
      paddingHorizontal: isSmall ? T.sp.sm : T.sp.md,
      paddingVertical: isSmall ? 3 : 5,
      borderRadius: T.radius.sm,
    }}>
      <Text style={{ fontSize: T.fs.caption, color: c.fg, fontFamily: T.fontBold }}>{children}</Text>
    </View>
  );
}

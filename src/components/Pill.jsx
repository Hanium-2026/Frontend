import React from 'react';
import { View, Text } from 'react-native';
import T from '../tokens';

export default function Pill({ tone = 'ok', children, size = 'md' }) {
  const map = {
    ok:      { bg: T.okSoft,      fg: '#06724D' },
    caution: { bg: T.cautionSoft, fg: '#8B5A06' },
    danger:  { bg: T.dangerSoft,  fg: '#9B1B1B' },
    info:    { bg: T.blueSoft,    fg: T.blueDarker },
    neutral: { bg: '#EEF0F4',     fg: '#3A4356' },
  };
  const c = map[tone] || map.neutral;
  const isSmall = size === 'sm';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.bg,
      paddingHorizontal: isSmall ? 7 : 10,
      paddingVertical: isSmall ? 2 : 4,
      borderRadius: isSmall ? 5 : 6,
    }}>
      <Text style={{
        fontSize: isSmall ? 11 : 12,
        color: c.fg,
        fontFamily: T.fontSemiBold,
      }}>{children}</Text>
    </View>
  );
}

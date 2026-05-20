import React from 'react';
import { View, Text } from 'react-native';
import T from '../tokens';

export default function Avatar({ name = '?', size = 40, tone }) {
  const palette = [
    ['#E8EEFF','#1F4ED8'], ['#FCEDC8','#8B5A06'],
    ['#D6F4E5','#06724D'], ['#F3DDFB','#6B2D8E'],
    ['#FCE0E0','#9B1B1B'], ['#DDEEF8','#0E4B73'],
  ];
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % palette.length;
  const [bg, fg] = tone || palette[idx];
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: bg,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Text style={{ fontFamily: T.fontBold, fontSize: size * 0.4, color: fg }}>
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import T from '../tokens';

// 카드는 그림자·테두리가 아니라 배경(T.surface)과 지면(T.bg)의 명도 차이로 구분한다.
export default function Card({ children, style, pad = 16 }) {
  return (
    <View style={[{
      backgroundColor: T.surface,
      borderRadius: 18,
      padding: pad,
    }, style]}>
      {children}
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import T from '../tokens';

export default function Card({ children, style, pad = 16 }) {
  return (
    <View style={[{
      backgroundColor: T.surface,
      borderRadius: 18,
      padding: pad,
      borderWidth: 1,
      borderColor: T.line,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    }, style]}>
      {children}
    </View>
  );
}

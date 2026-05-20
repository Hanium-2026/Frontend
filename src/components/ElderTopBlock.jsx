import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import T from '../tokens';

export default function ElderTopBlock({ children, minHeight = 200 }) {
  return (
    <View style={{ minHeight }}>
      <LinearGradient
        colors={[T.blue, T.blueDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 54, paddingBottom: 44, paddingHorizontal: 20, minHeight }}
      >
        {/* decorative blobs — clipped within gradient only */}
        <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' }}/>
        <View style={{ position: 'absolute', right: 30, bottom: -100, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' }}/>
        <View style={{ position: 'relative' }}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

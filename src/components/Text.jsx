import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useFontScale } from '../store/fontScale';

// 전역 글씨 배율을 fontSize/lineHeight에 곱하는 Text 래퍼.
// 화면들은 'react-native'의 Text 대신 이 컴포넌트를 import한다(JSX는 <Text> 그대로).
// allowFontScaling=false로 OS 배율 이중 적용을 막고, 인앱 설정만 단일 기준으로 쓴다.
const Text = React.forwardRef(function Text({ style, allowFontScaling = false, ...props }, ref) {
  const scale = useFontScale();
  let finalStyle = style;
  if (scale !== 1) {
    const flat = StyleSheet.flatten(style) || {};
    if (flat.fontSize != null || flat.lineHeight != null) {
      finalStyle = { ...flat };
      if (flat.fontSize != null) finalStyle.fontSize = Math.round(flat.fontSize * scale);
      if (flat.lineHeight != null) finalStyle.lineHeight = Math.round(flat.lineHeight * scale);
    }
  }
  return <RNText ref={ref} allowFontScaling={allowFontScaling} style={finalStyle} {...props} />;
});

export default Text;

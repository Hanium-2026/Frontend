import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { useFontScale } from '../store/fontScale';

// 전역 글씨 배율을 입력창 텍스트에도 적용하는 TextInput 래퍼(Text 래퍼와 동일 규칙).
// 화면들은 'react-native'의 TextInput 대신 이 컴포넌트를 import한다.
const TextInput = React.forwardRef(function TextInput({ style, allowFontScaling = false, ...props }, ref) {
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
  return <RNTextInput ref={ref} allowFontScaling={allowFontScaling} style={finalStyle} {...props} />;
});

export default TextInput;

import React, { useState } from 'react';
import { View } from 'react-native';
import Text from './Text';
import TextInput from './TextInput';
import T from '../tokens';

// 테두리+radius로 입력창을 감싸는 "폼 필드 박스"가 8개 화면에 조금씩 다르게 중복 구현돼 있던 것을
// Figma COMPONENTS 섹션의 Input Field(라벨+박스+선택적 단위)에 맞춰 하나로 통일한 것.
// 포커스 시 테두리가 1px→2px T.blue로 굵어지는 것도 기존 화면들의 공통 관행이라 그대로 가져온다.
export default function FormField({ label, unit, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      {label && <Text style={{ fontSize: T.fs.caption, fontFamily: T.font, color: T.muted, marginBottom: T.sp.xs }}>{label}</Text>}
      <View style={{
        height: 60, borderRadius: T.radius.md,
        borderWidth: focused ? 2 : 1, borderColor: focused ? T.blue : T.line,
        backgroundColor: T.surface,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: T.sp.lg,
      }}>
        <TextInput
          {...inputProps}
          onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
          style={{ flex: 1, fontSize: T.fs.body, fontFamily: T.font, color: T.ink, padding: 0 }}
          placeholderTextColor={T.muted}
        />
        {unit && <Text style={{ fontSize: T.fs.caption, fontFamily: T.font, color: T.muted, marginLeft: T.sp.sm }}>{unit}</Text>}
      </View>
    </View>
  );
}

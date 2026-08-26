import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Text from './Text';
import T from '../tokens';

// 앱 전체에 흩어져 있던 Pressable+인라인 style 버튼(높이 48~60, radius 12~14가 화면마다 제각각이었음)을
// Figma COMPONENTS 섹션의 Button(Primary/Outline/Disabled)에 맞춰 하나로 통일한 것.
// variant='text'는 Figma엔 없지만, "다시 받기"/"비밀번호 찾기" 같은 밑줄 텍스트 링크가
// 여러 화면에 동일한 모양으로 반복돼 있어 여기 포함한다.
// loading=true면 텍스트 대신 스피너를 보여준다(제출 중 상태) — disabled도 함께 적용된다.
export default function Button({ variant = 'primary', disabled = false, loading = false, onPress, children, style }) {
  disabled = disabled || loading;
  if (variant === 'text') {
    return (
      <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} style={style}>
        <Text style={{
          fontSize: T.fs.body, fontFamily: T.fontSemiBold, color: T.body,
          textDecorationLine: 'underline', opacity: disabled ? 0.5 : 1,
        }}>{children}</Text>
      </Pressable>
    );
  }

  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [{
        height: 60,
        borderRadius: T.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: disabled
          ? (outline ? T.surface : T.line)
          : outline ? (pressed ? T.bg : T.surface) : (pressed ? T.blueDark : T.blue),
        borderWidth: outline ? 1 : 0,
        borderColor: T.line,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? T.muted : '#fff'}/>
      ) : (
        <Text style={{
          fontSize: T.fs.body,
          fontFamily: outline ? T.fontMedium : T.fontBold,
          color: disabled ? T.muted : outline ? T.ink : '#fff',
        }}>{children}</Text>
      )}
    </Pressable>
  );
}

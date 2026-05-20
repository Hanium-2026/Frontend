import { useCallback, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function withSlide(WrappedComponent) {
  if (Platform.OS !== 'web') return WrappedComponent;

  function SlideScreen(props) {
    const translateX = useRef(new Animated.Value(390)).current;
    const hasEntered = useRef(false);

    useFocusEffect(
      useCallback(() => {
        const from = hasEntered.current ? -390 : 390;
        hasEntered.current = true;
        translateX.setValue(from);
        const anim = Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        });
        anim.start();
        return () => anim.stop();
      }, [])
    );

    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
        <WrappedComponent {...props} />
      </Animated.View>
    );
  }

  SlideScreen.displayName = `Slide(${WrappedComponent.name || 'Component'})`;
  return SlideScreen;
}

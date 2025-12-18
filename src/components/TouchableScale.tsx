// Кнопка с мгновенным тактильным откликом (как в Uber)

import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface TouchableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
  haptic?: boolean;
}

export const TouchableScale = React.memo(function TouchableScale({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 0.97,
  haptic = true,
}: TouchableScaleProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const handlePress = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress, haptic]);

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(activeScale, {
        damping: 15,
        stiffness: 400,
      });
      pressed.value = true;
    })
    .onFinalize(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
      if (pressed.value) {
        runOnJS(handlePress)();
      }
      pressed.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
});

// Простая кнопка с анимацией
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedButton = React.memo(function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: AnimatedButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, getButtonStyle(), style]}
    >
      {loading ? (
        <Animated.Text style={[styles.buttonText, getTextStyle()]}>...</Animated.Text>
      ) : (
        <Animated.Text style={[styles.buttonText, getTextStyle()]}>{title}</Animated.Text>
      )}
    </TouchableScale>
  );
});

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#131518',
  },
  buttonSecondary: {
    backgroundColor: '#f2f2f7',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#131518',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#131518',
  },
});

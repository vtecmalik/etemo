// Кнопка с тактильным откликом (упрощенная версия без анимации)

import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TouchableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  haptic?: boolean;
}

export const TouchableScale = React.memo(function TouchableScale({
  children,
  onPress,
  style,
  disabled = false,
  haptic = true,
}: TouchableScaleProps) {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        { opacity: pressed ? 0.7 : disabled ? 0.5 : 1 }
      ]}
    >
      {children}
    </Pressable>
  );
});

// Простая кнопка
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
      <Text style={[styles.buttonText, getTextStyle()]}>
        {loading ? '...' : title}
      </Text>
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

import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/theme';
import { LOADING_IMAGES } from '../constants/loadingImages';

interface LoadingAnimationProps {
  size?: number;
}

export function LoadingAnimation({ size = 200 }: LoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (LOADING_IMAGES.length === 0) {
      // Если нет картинок, показываем заглушку
      return;
    }

    // Быстрая смена картинок (каждые 100ms как в веб-версии: 10s / 100 images = 100ms)
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Меняем картинку
        setCurrentIndex((prev) => (prev + 1) % LOADING_IMAGES.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }, 100);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {LOADING_IMAGES.length > 0 ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Image
              source={LOADING_IMAGES[currentIndex] as any}
              style={{
                width: size * 0.7,
                height: size * 0.7,
              }}
              resizeMode="contain"
            />
          </Animated.View>
        ) : (
          // Заглушка - простой спиннер пока нет картинок
          <View style={styles.placeholder}>
            <View style={styles.spinner} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    // Изображение будет центрировано в круге
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.white,
    borderTopColor: 'transparent',
  },
});

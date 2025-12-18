// Оптимизированное изображение с кэшированием и placeholder

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Skeleton } from './Skeleton';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

interface OptimizedImageProps {
  uri: string | null;
  width: number;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  placeholder?: 'skeleton' | 'blur' | 'none';
}

// Blurhash placeholder для быстрой загрузки
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export const OptimizedImage = React.memo(function OptimizedImage({
  uri,
  width,
  height,
  borderRadius = 0,
  style,
  placeholder = 'skeleton',
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  if (!uri || error) {
    return (
      <View
        style={[
          styles.placeholder,
          { width, height, borderRadius },
          style,
        ]}
      >
        <View style={styles.placeholderContent}>
          {/* Пустой placeholder */}
        </View>
      </View>
    );
  }

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      {loading && placeholder === 'skeleton' && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width={width} height={height} borderRadius={borderRadius} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={{ width, height }}
        contentFit="contain"
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="none"
      />
    </View>
  );
});

// Аватар бренда (круглый/квадратный)
interface BrandLogoProps {
  uri: string | null;
  size?: number;
}

export const BrandLogo = React.memo(function BrandLogo({
  uri,
  size = 32,
}: BrandLogoProps) {
  if (!uri) {
    return (
      <View style={[styles.brandPlaceholder, { width: size, height: size }]}>
        {/* Empty brand placeholder */}
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      contentFit="contain"
      cachePolicy="none"
    />
  );
});

// Изображение продукта с оптимальными настройками
interface ProductImageProps {
  uri: string | null;
  size?: number;
}

export const ProductImage = React.memo(function ProductImage({
  uri,
  size = 200,
}: ProductImageProps) {
  return (
    <OptimizedImage
      uri={uri}
      width={size}
      height={size}
      borderRadius={BORDER_RADIUS.lg}
      placeholder="skeleton"
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContent: {
    opacity: 0.5,
  },
  brandPlaceholder: {
    backgroundColor: COLORS.greyLight,
    borderRadius: BORDER_RADIUS.sm,
  },
});

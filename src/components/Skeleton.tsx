import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = React.memo(function Skeleton({
  width,
  height,
  borderRadius = BORDER_RADIUS.sm,
  style,
}: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
});

// Готовые скелетоны для частых паттернов
export const ProductCardSkeleton = React.memo(function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <Skeleton width={80} height={80} borderRadius={BORDER_RADIUS.md} />
      <View style={styles.productCardContent}>
        <Skeleton width="60%" height={14} style={styles.mb8} />
        <Skeleton width="90%" height={18} style={styles.mb8} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
});

export const ProductDetailSkeleton = React.memo(function ProductDetailSkeleton() {
  return (
    <View style={styles.productDetail}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Skeleton width={200} height={200} borderRadius={BORDER_RADIUS.lg} />
      </View>

      {/* Brand */}
      <View style={styles.brandRow}>
        <Skeleton width={32} height={32} borderRadius={BORDER_RADIUS.sm} />
        <Skeleton width={100} height={14} style={styles.ml12} />
      </View>

      {/* Title */}
      <Skeleton width="90%" height={20} style={styles.mb12} />
      <Skeleton width="70%" height={20} style={styles.mb16} />

      {/* Info rows */}
      <Skeleton width="50%" height={14} style={styles.mb8} />
      <Skeleton width="60%" height={14} style={styles.mb8} />
      <Skeleton width="80%" height={14} style={styles.mb16} />

      {/* Button */}
      <Skeleton width="100%" height={56} borderRadius={BORDER_RADIUS.full} />
    </View>
  );
});

export const IngredientRowSkeleton = React.memo(function IngredientRowSkeleton() {
  return (
    <View style={styles.ingredientRow}>
      <Skeleton width={24} height={24} borderRadius={12} />
      <View style={styles.ingredientContent}>
        <Skeleton width="70%" height={14} style={styles.mb4} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.greyLight,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 12,
  },
  productCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productDetail: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ingredientContent: {
    flex: 1,
    marginLeft: 16,
  },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  ml12: { marginLeft: 12 },
});

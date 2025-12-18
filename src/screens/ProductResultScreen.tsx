import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { Product, IngredientsData } from '../types/product';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { TouchableScale } from '../components/TouchableScale';
import { ProductImage, BrandLogo } from '../components/OptimizedImage';
import { ProductDetailSkeleton } from '../components/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ProductResult'>;

export default function ProductResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { barcode, product: initialProduct } = route.params;

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState('');
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  // Загрузка продукта
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError('');

    const response = await apiService.searchByBarcode(barcode);

    if (response.found && response.result) {
      setProduct(response.result);
      await storageService.addToHistory(barcode, response.result);

      // Если нет ингредиентов - запускаем polling
      if (!response.result.ingredients) {
        setIngredientsLoading(true);
        stopPollingRef.current = apiService.pollIngredientsStatus(
          barcode,
          (data) => {
            if (data.ingredients) {
              setProduct(prev => prev ? { ...prev, ingredients: data.ingredients!, img_url: data.img_url || prev.img_url } : prev);
              setIngredientsLoading(false);
            }
          }
        );
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(response.error || 'Продукт не найден');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setLoading(false);
  }, [barcode]);

  useEffect(() => {
    if (!initialProduct) {
      loadProduct();
    } else if (!initialProduct.ingredients) {
      // Продукт из кэша, но без ингредиентов
      setIngredientsLoading(true);
      stopPollingRef.current = apiService.pollIngredientsStatus(
        barcode,
        (data) => {
          if (data.ingredients) {
            setProduct(prev => prev ? { ...prev, ingredients: data.ingredients!, img_url: data.img_url || prev.img_url } : prev);
            setIngredientsLoading(false);
          }
        }
      );
    }

    return () => {
      stopPollingRef.current?.();
    };
  }, [barcode, initialProduct, loadProduct]);

  const handleIngredientsPress = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Ingredients', { product });
  }, [product, navigation]);

  // Статистика ингредиентов
  const getIngredientsStats = useCallback((data: IngredientsData | null) => {
    if (!data) return { safe: 0, medium: 0, high: 0, total: 0 };

    let ingredients: any[] = [];
    if (data.type === 'regular' && data.ingredients) {
      ingredients = data.ingredients;
    } else if (data.type === 'set' && data.parts) {
      data.parts.forEach(p => ingredients.push(...p.ingredients));
    }

    const getMaxRisk = (score: string | null) => {
      if (!score) return null;
      const nums = score.match(/\d+/g);
      return nums ? Math.max(...nums.map(Number)) : null;
    };

    let safe = 0, medium = 0, high = 0;
    ingredients.forEach(ing => {
      const risk = getMaxRisk(ing.risk_score);
      if (risk === null) return;
      if (risk <= 2) safe++;
      else if (risk <= 6) medium++;
      else high++;
    });

    return { safe, medium, high, total: ingredients.length };
  }, []);

  // Loading state
  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ProductDetailSkeleton />
      </ScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Продукт не найден</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorBarcode}>{barcode}</Text>
      </View>
    );
  }

  if (!product) return null;

  const stats = getIngredientsStats(product.ingredients);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadProduct} tintColor={COLORS.primary} />
      }
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <ProductImage uri={product.img_url} size={320} />
      </View>

      {/* Product Info Card */}
      <View style={styles.card}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <BrandLogo uri={product.brand_logo} size={32} />
          <Text style={styles.brandName}>{product.brand_ko || product.brand}</Text>
        </View>

        {/* Title */}
        <Text style={styles.productTitle}>{product.name_ru || product.name_en}</Text>

        {/* Details */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Бренд:</Text>
          <Text style={styles.detailValue}>{product.brand}</Text>
        </View>

        {product.parent_brand && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Материнский бренд:</Text>
            <Text style={styles.detailValue}>{product.parent_brand.name_en}</Text>
          </View>
        )}

        {product.country && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Регистрация:</Text>
            <Text style={styles.detailValue}>{product.country}</Text>
          </View>
        )}

        {product.categories && product.categories.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Категория:</Text>
            <Text style={styles.detailValue}>{product.categories[0].path}</Text>
          </View>
        )}
      </View>

      {/* Ingredients Button */}
      <TouchableScale style={styles.ingredientsButton} onPress={handleIngredientsPress}>
        <View style={styles.ingredientsButtonContent}>
          <Text style={styles.ingredientsIcon}>💧</Text>
          <View style={styles.ingredientsInfo}>
            <Text style={styles.ingredientsTitle}>
              Безопасность ингредиентов
              {ingredientsLoading && <Text style={styles.loadingText}> (загрузка...)</Text>}
              {!ingredientsLoading && stats.total > 0 && ` (${stats.total})`}
            </Text>
            {!ingredientsLoading && stats.total > 0 && (stats.medium + stats.high) > 0 && (
              <Text style={styles.ingredientsWarning}>
                <Text style={styles.warningCount}>{stats.medium + stats.high}</Text>
                {' '}со средним риском или выше
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableScale>

      {/* Barcode */}
      <Text style={styles.barcodeText}>Штрих-код: {barcode}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  imageContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.md },
  brandName: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  productTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, lineHeight: 24, marginBottom: SPACING.lg },
  detailRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  detailLabel: { fontSize: 14, fontWeight: '500', color: COLORS.primary, marginRight: SPACING.xs },
  detailValue: { fontSize: 14, color: COLORS.gray4, flex: 1 },
  ingredientsButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  ingredientsButtonContent: { flexDirection: 'row', alignItems: 'center' },
  ingredientsIcon: { fontSize: 24, marginRight: SPACING.md },
  ingredientsInfo: { flex: 1 },
  ingredientsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  loadingText: { fontWeight: '400', color: COLORS.gray4 },
  ingredientsWarning: { fontSize: 12, color: COLORS.gray4, marginTop: 2 },
  warningCount: { color: COLORS.red, fontWeight: '600' },
  chevron: { fontSize: 24, color: COLORS.gray4 },
  barcodeText: { fontSize: 12, color: COLORS.gray4, textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  errorEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  errorTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.sm },
  errorText: { fontSize: 14, color: COLORS.gray4, textAlign: 'center', marginBottom: SPACING.md },
  errorBarcode: { fontSize: 12, color: COLORS.gray4 },
});

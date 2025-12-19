import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { Product, IngredientsData, Ingredient } from '../types/product';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { TouchableScale } from '../components/TouchableScale';
import { ProductImage, BrandLogo } from '../components/OptimizedImage';
import { ProductDetailSkeleton } from '../components/Skeleton';
import { LOADING_IMAGES } from '../constants/loadingImages';
import { IngredientsRingIndicator } from '../components/IngredientsRingIndicator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ProductResult'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Компонент для плавного перехода от анимации к картинке продукта
function AnimatedProductCircle({
  loading,
  imageUri,
  ingredientsStats,
  onImagePress,
  ringExpanded
}: {
  loading: boolean;
  imageUri: string | null;
  ingredientsStats?: { safe: number; medium: number; high: number; unknown: number };
  onImagePress?: () => void;
  ringExpanded?: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const productOpacity = useRef(new Animated.Value(0)).current;

  // Размеры круга - 64% от ширины экрана (уменьшено на 20% от 80%)
  const ringContainerSize = SCREEN_WIDTH * 0.64;
  // Белый круг = внутренний диаметр ободка
  // Внутренний диаметр = size - 2 * (отступ 12 + половина толщины 5) = size - 44
  const circleSize = ringContainerSize - 44;
  // Размер картинки - диагональ = диаметр круга, значит сторона = диаметр / √2
  const imageSize = circleSize * 0.707;

  // Анимация смены картинок в загрузке
  useEffect(() => {
    if (!loading || LOADING_IMAGES.length === 0) return;

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prev) => (prev + 1) % LOADING_IMAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }).start();
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loading, fadeAnim]);

  // Плавный переход от анимации к картинке продукта
  useEffect(() => {
    if (loading) {
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(productOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(productOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, loadingOpacity, productOpacity]);

  return (
    <View style={[styles.animatedCircleContainer, {
      width: ringContainerSize,
      height: ringContainerSize,
      justifyContent: 'center'
    }]}>
      {/* Цветное кольцо-индикатор ингредиентов */}
      {!loading && ingredientsStats && (
        <IngredientsRingIndicator
          safe={ingredientsStats.safe}
          medium={ingredientsStats.medium}
          high={ingredientsStats.high}
          unknown={ingredientsStats.unknown}
          size={ringContainerSize}
          expanded={ringExpanded}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onImagePress}
        style={[
          styles.animatedCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2
          }
        ]}
      >
        {/* Анимация загрузки */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: loadingOpacity,
              justifyContent: 'center',
              alignItems: 'center',
            }
          ]}
          pointerEvents={loading ? 'auto' : 'none'}
        >
          {LOADING_IMAGES.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Image
                source={LOADING_IMAGES[currentImageIndex] as any}
                style={{
                  width: imageSize,
                  height: imageSize,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Картинка продукта */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: productOpacity,
              justifyContent: 'center',
              alignItems: 'center',
            }
          ]}
          pointerEvents={loading ? 'none' : 'auto'}
        >
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: imageSize,
                height: imageSize,
              }}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Текст загрузки */}
      {loading && (
        <Animated.Text
          style={[
            styles.loadingText,
            { opacity: loadingOpacity }
          ]}
        >
          Идёт проверка базы данных, пожалуйста, подождите
        </Animated.Text>
      )}
    </View>
  );
}

export default function ProductResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { barcode, product: initialProduct } = route.params;

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState('');
  const [brandInfo, setBrandInfo] = useState<{ name_en: string; name_ko: string | null; logo_url: string | null } | null>(null);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [ringExpanded, setRingExpanded] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  // Загрузка продукта
  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError('');
    setBrandInfo(null);

    const startTime = Date.now();

    // API делает парсинг внешних сайтов (может занять 10-15 секунд)
    const response = await apiService.searchByBarcode(barcode);

    // Минимум 5 секунд показываем анимацию для UX
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 5000 - elapsedTime);
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

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
      // Сохраняем информацию о бренде из ответа API
      if (response.brand) {
        setBrandInfo(response.brand);
      }
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

  const handleImagePress = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRingExpanded(prev => !prev);
  }, [product]);

  const handleIngredientsButtonPress = useCallback(() => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowIngredientsModal(true);
  }, [product]);

  // Статистика ингредиентов
  const getIngredientsStats = useCallback((data: IngredientsData | null) => {
    if (!data) return { safe: 0, medium: 0, high: 0, unknown: 0, total: 0 };

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

    let safe = 0, medium = 0, high = 0, unknown = 0;
    ingredients.forEach(ing => {
      const risk = getMaxRisk(ing.risk_score);
      if (risk === null) {
        unknown++;
        return;
      }
      if (risk <= 2) safe++;
      else if (risk <= 6) medium++;
      else high++;
    });

    return { safe, medium, high, unknown, total: ingredients.length };
  }, []);

  const stats = product ? getIngredientsStats(product.ingredients) : { safe: 0, medium: 0, high: 0, unknown: 0, total: 0 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={loadProduct} tintColor={COLORS.primary} />
      }
    >
      {/* Animated Circle - плавный переход от загрузки к продукту */}
      <AnimatedProductCircle
        loading={loading}
        imageUri={product?.img_url || null}
        ingredientsStats={stats.total > 0 ? stats : undefined}
        onImagePress={handleImagePress}
        ringExpanded={ringExpanded}
      />

      {/* Error state */}
      {error && !loading && (
        <View style={styles.errorSection}>
          {brandInfo ? (
            <>
              <BrandLogo uri={brandInfo.logo_url} size={60} />
              <Text style={styles.errorBrandName}>{brandInfo.name_ko || brandInfo.name_en}</Text>
              <Text style={styles.errorTitle}>Продукт не найден в базе</Text>
              <Text style={styles.errorText}>
                Этот продукт от бренда {brandInfo.name_en} пока отсутствует в нашей базе данных
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.errorEmoji}>😕</Text>
              <Text style={styles.errorTitle}>Продукт не найден</Text>
              <Text style={styles.errorText}>{error}</Text>
            </>
          )}
          <Text style={styles.errorBarcode}>Штрих-код: {barcode}</Text>
        </View>
      )}

      {/* Product Info Card */}
      {product && !loading && (
      <>
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
      <TouchableScale style={styles.ingredientsButton} onPress={handleIngredientsButtonPress}>
        <View style={styles.ingredientsButtonContent}>
          <Text style={styles.ingredientsIcon}>💧</Text>
          <View style={styles.ingredientsInfo}>
            <Text style={styles.ingredientsTitle}>
              Безопасность ингредиентов
              {ingredientsLoading && <Text style={{ fontWeight: '400', color: COLORS.gray4 }}> (загрузка...)</Text>}
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

      </>
      )}

      {/* Ingredients Modal */}
      <Modal
        visible={showIngredientsModal && !!product}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowIngredientsModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowIngredientsModal(false);
            }}
          />
          <View style={styles.modalContent}>
            {product && (
              <IngredientsModalContent
                product={product}
                ingredientsLoading={ingredientsLoading}
                onClose={() => {
                  setShowIngredientsModal(false);
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Ingredients Modal Content Component
function IngredientsModalContent({
  product,
  ingredientsLoading,
  onClose
}: {
  product: Product | null;
  ingredientsLoading: boolean;
  onClose: () => void;
}) {
  const ingredientsData = product?.ingredients;

  // Собираем все ингредиенты
  const allIngredients = useMemo(() => {
    if (!ingredientsData) return [];

    if (ingredientsData.type === 'regular' && ingredientsData.ingredients) {
      return ingredientsData.ingredients;
    }

    if (ingredientsData.type === 'set' && ingredientsData.parts) {
      const all: Ingredient[] = [];
      ingredientsData.parts.slice(0, 3).forEach(part => {
        part.ingredients.slice(0, 30).forEach(ing => all.push(ing));
      });
      return all;
    }

    return [];
  }, [ingredientsData]);

  // Статистика
  const stats = useMemo(() => {
    const getMaxRisk = (score: string | null) => {
      if (!score) return null;
      const nums = score.match(/\d+/g);
      return nums ? Math.max(...nums.map(Number)) : null;
    };

    let safe = 0, medium = 0, high = 0, unknown = 0;
    allIngredients.forEach(ing => {
      const risk = getMaxRisk(ing.risk_score);
      if (risk === null) unknown++;
      else if (risk <= 2) safe++;
      else if (risk <= 6) medium++;
      else high++;
    });

    return { safe, medium, high, unknown };
  }, [allIngredients]);

  const renderItem = useCallback(({ item }: { item: Ingredient }) => (
    <IngredientRow item={item} />
  ), []);

  const keyExtractor = useCallback((item: Ingredient) => `${item.position}-${item.name_en}`, []);

  const ListHeader = useCallback(() => <StatsHeader stats={stats} />, [stats]);

  // Loading state
  if (ingredientsLoading) {
    return (
      <View style={styles.modalInner}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Безопасность ингредиентов</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка ингредиентов...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!ingredientsData || allIngredients.length === 0) {
    return (
      <View style={styles.modalInner}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Безопасность ингредиентов</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🧪</Text>
          <Text style={styles.emptyTitle}>Состав не найден</Text>
          <Text style={styles.emptyText}>
            Информация об ингредиентах для этого продукта недоступна
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.modalInner}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Безопасность ингредиентов</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={allIngredients}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={12}
      />
    </View>
  );
}

// Risk Badge Component
const RiskBadge = React.memo(function RiskBadge({ riskScore }: { riskScore: string | null }) {
  const getMaxRisk = (score: string | null) => {
    if (!score) return null;
    const nums = score.match(/\d+/g);
    return nums ? Math.max(...nums.map(Number)) : null;
  };

  const maxRisk = getMaxRisk(riskScore);

  let bgColor = COLORS.riskUnknown;
  if (maxRisk !== null) {
    if (maxRisk <= 2) bgColor = COLORS.riskSafe;
    else if (maxRisk <= 6) bgColor = COLORS.riskMedium;
    else bgColor = COLORS.riskHigh;
  }

  return (
    <View style={[styles.riskBadge, { backgroundColor: bgColor }]}>
      <Text style={styles.riskBadgeText}>{riskScore || '-'}</Text>
    </View>
  );
});

// Ingredient Row Component
const IngredientRow = React.memo(function IngredientRow({ item }: { item: Ingredient }) {
  return (
    <View style={styles.ingredientRow}>
      <RiskBadge riskScore={item.risk_score} />
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name_ru || item.name_en}</Text>
        {item.name_ru && <Text style={styles.ingredientNameEn}>{item.name_en}</Text>}
        {item.tags && item.tags.length > 0 && (
          <Text style={styles.ingredientTags}>{item.tags.join(', ')}</Text>
        )}
      </View>
    </View>
  );
});

// Stats Header Component
const StatsHeader = React.memo(function StatsHeader({ stats }: {
  stats: { safe: number; medium: number; high: number; unknown: number }
}) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.riskUnknown }]}>
            <Text style={styles.statBadgeText}>-</Text>
          </View>
          <Text style={styles.statLabel}>Не опред.{'\n'}({stats.unknown})</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.riskSafe }]}>
            <Text style={styles.statBadgeText}>1-2</Text>
          </View>
          <Text style={styles.statLabel}>Безопасный{'\n'}({stats.safe})</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.riskMedium }]}>
            <Text style={styles.statBadgeText}>3-6</Text>
          </View>
          <Text style={styles.statLabel}>Средний{'\n'}({stats.medium})</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, { backgroundColor: COLORS.riskHigh }]}>
            <Text style={styles.statBadgeText}>7-10</Text>
          </View>
          <Text style={styles.statLabel}>Высокий{'\n'}({stats.high})</Text>
        </View>
      </View>
      <Text style={styles.statsDescription}>
        Оценка риска основана на данных EWG (Environmental Working Group)
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  animatedCircleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  animatedCircle: {
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.xl,
  },
  errorSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
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
  productTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary, lineHeight: 24, marginBottom: SPACING.lg },
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
  ingredientsWarning: { fontSize: 12, color: COLORS.gray4, marginTop: 2 },
  warningCount: { color: COLORS.red, fontWeight: '600' },
  chevron: { fontSize: 24, color: COLORS.gray4 },
  barcodeText: { fontSize: 12, color: COLORS.gray4, textAlign: 'center' },
  errorEmoji: { fontSize: 48, marginBottom: SPACING.md },
  errorBrandName: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginTop: SPACING.sm, marginBottom: SPACING.xs, textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.xs, textAlign: 'center' },
  errorText: { fontSize: 14, color: COLORS.gray4, textAlign: 'center', marginBottom: SPACING.sm },
  errorBarcode: { fontSize: 12, color: COLORS.gray4, marginTop: SPACING.sm },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    height: '80%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalInner: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.gray4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },

  // Ingredients styles
  statsContainer: {
    backgroundColor: COLORS.awardGray,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md
  },
  statItem: { alignItems: 'center' },
  statBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs
  },
  statBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  statLabel: { fontSize: 11, color: COLORS.gray4, textAlign: 'center', lineHeight: 14 },
  statsDescription: { fontSize: 12, color: COLORS.gray4, textAlign: 'center', lineHeight: 16 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
    minHeight: 70,
  },
  riskBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  riskBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  ingredientInfo: { flex: 1, marginLeft: SPACING.md },
  ingredientName: { fontSize: 14, fontWeight: '500', color: COLORS.primary, marginBottom: 2 },
  ingredientNameEn: { fontSize: 12, color: COLORS.gray4, marginBottom: 2 },
  ingredientTags: { fontSize: 11, color: COLORS.gray4 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.gray4, textAlign: 'center' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, authService } from '../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { TouchableScale } from '../components/TouchableScale';
import { ProductCardSkeleton } from '../components/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'recommended';

interface Product {
  id: string;
  name_ru: string;
  img_url?: string;
  brand_id?: string;
  brand?: {
    name: string;
  };
  reviews_count?: number;
  average_rating?: number;
}

export default function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadProducts();
  }, [activeTab]);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Получаем продукты
      const { data: productsData, error: productsError } = await supabase
        .from('cosme_products')
        .select('id, name_ru, img_url, brand_id')
        .limit(20)
        .order('id', { ascending: false });

      if (productsError) throw productsError;

      if (!productsData || productsData.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Получаем уникальные brand_id
      const brandIds = [...new Set(productsData.map(p => p.brand_id).filter(Boolean))];

      // Загружаем бренды
      const { data: brandsData } = await supabase
        .from('glowpick_brands')
        .select('id, name')
        .in('id', brandIds);

      // Создаем Map брендов для быстрого доступа
      const brandsMap = new Map((brandsData || []).map(b => [b.id, b]));

      // Получаем все ID продуктов
      const productIds = productsData.map(p => p.id);

      // Загружаем ВСЕ отзывы для всех продуктов одним запросом
      const { data: allReviewsData } = await supabase
        .from('cosme_reviews')
        .select('product_id, rating')
        .in('product_id', productIds);

      // Группируем отзывы по product_id
      const reviewsByProduct = new Map();
      (allReviewsData || []).forEach(review => {
        if (!reviewsByProduct.has(review.product_id)) {
          reviewsByProduct.set(review.product_id, []);
        }
        reviewsByProduct.get(review.product_id).push(review.rating);
      });

      // Собираем продукты со статистикой
      const productsWithStats = productsData.map(product => {
        const reviews = reviewsByProduct.get(product.id) || [];
        const reviews_count = reviews.length;
        const average_rating =
          reviews_count > 0
            ? reviews.reduce((sum, r) => sum + (r || 0), 0) / reviews_count
            : 0;

        return {
          ...product,
          brand: product.brand_id ? brandsMap.get(product.brand_id) : null,
          reviews_count,
          average_rating,
        };
      });

      setProducts(productsWithStats);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableScale
      onPress={() =>
        navigation.navigate('ProductResult', {
          barcode: item.id,
          product: undefined,
        })
      }
    >
      <View style={styles.productCard}>
        <View style={styles.productImage}>
          {item.img_url ? (
            <Image source={{ uri: item.img_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.brandName} numberOfLines={1}>
            {item.brand?.name || 'Unknown Brand'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name_ru || 'Product'}
          </Text>
          {(item.average_rating && item.average_rating > 0) || (item.reviews_count && item.reviews_count > 0) ? (
            <View style={styles.statsContainer}>
              {item.average_rating && item.average_rating > 0 ? (
                <Text style={styles.ratingText}>⭐ {item.average_rating.toFixed(1)}</Text>
              ) : null}
              {item.reviews_count && item.reviews_count > 0 ? (
                <Text style={styles.reviewsText}>
                  {item.reviews_count} {item.reviews_count === 1 ? 'отзыв' : 'отзывов'}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableScale>
  );

  const renderAuthPrompt = () => (
    <View style={styles.authPrompt}>
      <Text style={styles.authPromptEmoji}>🔒</Text>
      <Text style={styles.authPromptTitle}>Персональные рекомендации</Text>
      <Text style={styles.authPromptText}>
        Войдите в систему и заполните анкету о вашей коже, чтобы получать индивидуальные рекомендации
      </Text>
      <TouchableOpacity style={styles.authButton}>
        <Text style={styles.authButtonText}>Войти или зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Все</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'recommended' && styles.tabActive]}
        onPress={() => setActiveTab('recommended')}
      >
        <Text style={[styles.tabText, activeTab === 'recommended' && styles.tabTextActive]}>
          Рекомендованные
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (activeTab === 'recommended' && !user) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderAuthPrompt()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.lightGray0,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray4,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  productInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 11,
    color: COLORS.gray4,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: 20,
  },
  statsContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 11,
    color: COLORS.gray4,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  authPromptEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  authPromptText: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.full,
  },
  authButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

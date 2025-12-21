import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, authService } from '../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { TouchableScale } from '../components/TouchableScale';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductCardSkeleton } from '../components/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'recommended';

interface Product {
  barcode: string;
  name_ru: string;
  name_en: string;
  brand_name_en: string;
  img_url?: string;
}

export default function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    checkAuth();
    setProducts([]);
    setPage(0);
    setHasMore(true);
    loadProducts(true);
  }, [activeTab]);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadProducts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 0 : page;
      const offset = currentPage * PAGE_SIZE;

      // Получаем продукты из oleigh_products
      const { data: productsData, error: productsError } = await supabase
        .from('oleigh_products')
        .select('barcode, name_ru, name_en, brand_name_en, img_url')
        .range(offset, offset + PAGE_SIZE - 1)
        .order('barcode', { ascending: false });

      if (productsError) throw productsError;

      if (!productsData || productsData.length === 0) {
        setHasMore(false);
        if (reset) setProducts([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (productsData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (reset) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }

      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading products:', error);
      if (reset) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setProducts([]);
    setPage(0);
    setHasMore(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadProducts(false);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
          Все
        </Text>
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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableScale
      onPress={() =>
        navigation.navigate('ProductResult', {
          barcode: item.barcode,
          product: {
            name_en: item.name_en,
            name_ru: item.name_ru,
            name_ko: null,
            brand: item.brand_name_en,
            brand_ko: null,
            brand_logo: null,
            img_url: item.img_url || null,
            source: 'oleigh_products',
            country: null,
            ingredients: null,
          },
        })
      }
      style={styles.card}
    >
      <OptimizedImage
        uri={item.img_url || null}
        width={72}
        height={72}
        borderRadius={BORDER_RADIUS.md}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardBrand} numberOfLines={1}>
          {item.brand_name_en}
        </Text>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name_ru || item.name_en}
        </Text>
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
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.authButtonText}>Войти или зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (activeTab === 'recommended' && !user) {
    return (
      <View style={styles.container}>
        {renderAuthPrompt()}
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.barcode}
        ListHeaderComponent={renderTabs}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  cardBrand: {
    fontSize: 12,
    color: COLORS.gray4,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardMeta: {
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
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray0,
    borderRadius: 24,
    padding: 4,
    marginBottom: SPACING.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
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
});

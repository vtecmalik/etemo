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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'recommended';

interface Product {
  id: string;
  barcode: string;
  product_name: string;
  brand_name: string;
  image_url?: string;
  rating?: number;
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

      // Получаем популярные продукты из Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(20)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
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
          barcode: item.barcode,
          product: undefined,
        })
      }
    >
      <View style={styles.productCard}>
        <View style={styles.productImage}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.brandName} numberOfLines={1}>
            {item.brand_name || 'Unknown Brand'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product_name || 'Product'}
          </Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
            </View>
          )}
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    width: '48%',
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
    width: '100%',
    aspectRatio: 1,
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
    padding: SPACING.sm,
  },
  brandName: {
    fontSize: 11,
    color: COLORS.gray4,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: 18,
    minHeight: 36,
  },
  ratingContainer: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
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

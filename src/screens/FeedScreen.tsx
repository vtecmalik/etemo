import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { TouchableScale } from '../components/TouchableScale';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductCardSkeleton } from '../components/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  image_url?: string;
}

export default function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    loadProducts(true);
  }, []);

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
        .select('id, barcode, name, brand, image_url')
        .range(offset, offset + PAGE_SIZE - 1)
        .order('id', { ascending: false });

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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableScale
      onPress={() =>
        navigation.navigate('ProductResult', {
          barcode: item.barcode,
          product: {
            id: item.barcode,
            name_ru: item.name,
            name_en: item.name,
            img_url: item.image_url,
            brand_name: item.brand,
            ingredients: null,
          },
        })
      }
      style={styles.card}
    >
      <OptimizedImage
        uri={item.image_url}
        width={72}
        height={72}
        borderRadius={BORDER_RADIUS.md}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardBrand} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cardMeta}>
          {item.barcode}
        </Text>
      </View>
    </TouchableScale>
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
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

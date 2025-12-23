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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { supabase, authService } from '../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { TouchableScale, AnimatedButton } from '../components/TouchableScale';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Favorites'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Product {
  id: string;
  name_ru: string;
  img_url?: string;
  brand?: {
    name: string;
  };
}

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndLoad();
    }, [])
  );

  const checkAuthAndLoad = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);

      // TODO: Implement favorites from database
      // For now, show empty state
      setProducts([]);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
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
        </View>

        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableScale>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emoji}>❤️</Text>
        <Text style={styles.title}>Избранное</Text>
        <Text style={styles.description}>
          Войдите, чтобы сохранять понравившиеся продукты
        </Text>
        <AnimatedButton
          title="Войти"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emoji}>💔</Text>
        <Text style={styles.title}>Пока пусто</Text>
        <Text style={styles.description}>
          Добавляйте продукты в избранное, нажимая на сердечко
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
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
    padding: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  listContent: {
    padding: SPACING.md,
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
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  heartIcon: {
    fontSize: 16,
  },
});

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { ScanHistoryItem } from '../types/product';
import { storageService } from '../services/storage';
import { TouchableScale } from '../components/TouchableScale';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductCardSkeleton } from '../components/Skeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Мемоизированный компонент карточки истории
const HistoryCard = React.memo(function HistoryCard({
  item,
  onPress,
}: {
  item: ScanHistoryItem;
  onPress: () => void;
}) {
  const formattedDate = useMemo(() => {
    const date = new Date(item.scannedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  }, [item.scannedAt]);

  return (
    <TouchableScale onPress={onPress} style={styles.card}>
      <OptimizedImage
        uri={item.product.img_url}
        width={72}
        height={72}
        borderRadius={BORDER_RADIUS.md}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardBrand} numberOfLines={1}>
          {item.product.brand}
        </Text>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.product.name_ru || item.product.name_en}
        </Text>
        <Text style={styles.cardMeta}>
          {item.barcode} · {formattedDate}
        </Text>
      </View>
    </TouchableScale>
  );
});

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await storageService.getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  // Загружаем историю при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleItemPress = useCallback((item: ScanHistoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ProductResult', {
      barcode: item.barcode,
      product: item.product,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: ScanHistoryItem }) => (
    <HistoryCard
      item={item}
      onPress={() => handleItemPress(item)}
    />
  ), [handleItemPress]);

  const keyExtractor = useCallback((item: ScanHistoryItem) => item.barcode, []);

  // Skeleton loading
  if (loading) {
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

  // Empty state
  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>История пуста</Text>
        <Text style={styles.emptyText}>
          Отсканируйте или найдите продукт, и он появится здесь
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        // Оптимизации FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={(_, index) => ({
          length: 104, // высота карточки + margin
          offset: 104 * index,
          index,
        })}
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
    // Shadow
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
  },
});

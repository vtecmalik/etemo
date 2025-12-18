import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { Ingredient, IngredientsData } from '../types/product';

type RouteProps = RouteProp<RootStackParamList, 'Ingredients'>;

// Risk badge component
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

// Ingredient row component
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

// Stats header
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

export default function IngredientsScreen() {
  const route = useRoute<RouteProps>();
  const { product } = route.params;
  const ingredientsData = product.ingredients;

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

  // Empty state
  if (!ingredientsData || allIngredients.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🧪</Text>
        <Text style={styles.emptyTitle}>Состав не найден</Text>
        <Text style={styles.emptyText}>
          Информация об ингредиентах для этого продукта недоступна
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={allIngredients}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      // Оптимизации
      removeClippedSubviews={true}
      maxToRenderPerBatch={15}
      windowSize={10}
      initialNumToRender={12}
      getItemLayout={(_, index) => ({
        length: 70,
        offset: 70 * index + 180, // header height
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxxl },
  statsContainer: {
    backgroundColor: COLORS.awardGray,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyLight,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  statItem: { alignItems: 'center' },
  statBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
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
  riskBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  riskBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600' },
  ingredientInfo: { flex: 1, marginLeft: SPACING.md },
  ingredientName: { fontSize: 14, fontWeight: '500', color: COLORS.primary, marginBottom: 2 },
  ingredientNameEn: { fontSize: 12, color: COLORS.gray4, marginBottom: 2 },
  ingredientTags: { fontSize: 11, color: COLORS.gray4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.gray4, textAlign: 'center' },
});

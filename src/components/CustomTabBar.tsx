import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import {
  HomeIcon,
  HeartIcon,
  ScannerIcon,
  PlusIcon,
} from './TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// ГЛАВНОЕ ПРАВИЛО: 5 РАВНЫХ КОЛОНОК
// ============================================
const TOTAL_COLUMNS = 5;
const COLUMN_WIDTH = SCREEN_WIDTH / TOTAL_COLUMNS;

// ============================================
// ЛОГИКА РАСПРЕДЕЛЕНИЯ ПОЗИЦИЙ
// ============================================
// 4 элемента на 5 колонках
// Активный занимает 2 колонки, остальные по 1

function getItemPosition(itemIndex: number, activeIndex: number) {
  /**
   * Возвращает { startColumn, columnSpan } для элемента
   *
   * startColumn - с какой колонки начинается (0-4)
   * columnSpan - сколько колонок занимает (1 или 2)
   */

  let startColumn: number;
  let columnSpan: number;

  if (itemIndex < activeIndex) {
    // До активного - позиция = index
    startColumn = itemIndex;
    columnSpan = 1;
  } else if (itemIndex === activeIndex) {
    // Активный - позиция = index, ширина = 2
    startColumn = itemIndex;
    columnSpan = 2;
  } else {
    // После активного - позиция = index + 1
    startColumn = itemIndex + 1;
    columnSpan = 1;
  }

  return { startColumn, columnSpan };
}

// ============================================
// КОМПОНЕНТ ОДНОГО ТАБА
// ============================================
interface TabItemProps {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  label: string;
  currentIndex: number;
}

function TabItem({ route, index, isFocused, onPress, label, currentIndex }: TabItemProps) {
  // 5 ПОЗИЦИЙ на панели, позиция 2 в центре экрана
  // Капсула занимает 2 позиции, маленькие иконки - 1 позицию

  const { startColumn, columnSpan } = getItemPosition(index, currentIndex);

  // Анимации
  const animatedLeft = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(56)).current;
  const animatedOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  const centerScreen = SCREEN_WIDTH / 2;
  // Позиция 2 должна быть в центре экрана
  const gridOffset = centerScreen - 2.5 * COLUMN_WIDTH;

  // Центр позиции startColumn на grid
  const gridPositionCenter = gridOffset + (startColumn + 0.5) * COLUMN_WIDTH;

  let leftPosition: number;
  let itemWidth: number | undefined;

  if (isFocused) {
    // Капсула: ИКОНКА должна быть точно на gridPositionCenter (центр экрана)
    // При justifyContent: flex-start иконка будет на: leftPosition + padding(16) + iconWidth/2(14) = leftPosition + 30
    // Нужно: leftPosition + 30 = gridPositionCenter
    leftPosition = gridPositionCenter - 30;
    // Ширина капсулы = 2 колонки (фиксированная)
    itemWidth = 2 * COLUMN_WIDTH;

    // Фиксированный отступ от краёв экрана (16px как padding)
    const EDGE_MARGIN = 16;

    // Проверка левого края
    if (leftPosition < EDGE_MARGIN) {
      leftPosition = EDGE_MARGIN;
    }

    // Проверка правого края
    const rightEdge = leftPosition + itemWidth;
    const maxRight = SCREEN_WIDTH - EDGE_MARGIN;
    if (rightEdge > maxRight) {
      leftPosition = maxRight - itemWidth;
    }
  } else {
    // Неактивная: центр иконки на grid-позиции
    const buttonWidth = 56;
    leftPosition = gridPositionCenter - buttonWidth / 2;
    itemWidth = buttonWidth;
  }

  const getIcon = (routeName: string) => {
    const color = isFocused ? COLORS.primary : COLORS.gray4;
    const size = 28;

    switch (routeName) {
      case 'Feed':
        return <HomeIcon size={size} color={color} />;
      case 'Scanner':
        return <ScannerIcon size={size} color={color} />;
      case 'ReviewWrite':
        return <PlusIcon size={size} color={color} />;
      case 'Favorites':
        return <HeartIcon size={size} color={color} />;
      default:
        return null;
    }
  };

  // Обновляем анимации при изменении активности
  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedLeft, {
        toValue: leftPosition,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }),
      Animated.spring(animatedWidth, {
        toValue: itemWidth || 56,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(animatedOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, leftPosition, itemWidth]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.tabItem,
        {
          position: 'absolute',
          left: animatedLeft,
          width: animatedWidth,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.tabButton,
          !isFocused && styles.tabButtonInactive,
          isFocused && styles.tabButtonActive,
        ]}
      >
        {/* ИКОНКА */}
        <View style={styles.iconContainer}>
          {getIcon(route.name)}
        </View>

        {/* ТЕКСТ - показывается только у активного, центрируется в оставшемся месте */}
        <Animated.View style={[styles.textContainer, { opacity: animatedOpacity }]}>
          <Text style={styles.tabLabel}>{label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ TAB BAR
// ============================================
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentIndex = state.index;

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Feed':
        return 'Смотрю';
      case 'Scanner':
        return 'Ищу';
      case 'ReviewWrite':
        return 'Пишу';
      case 'Favorites':
        return 'Люблю';
      default:
        return routeName;
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
      ]}
    >
      {/* КОНТЕЙНЕР С ОТНОСИТЕЛЬНОЙ ПОЗИЦИЕЙ */}
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              onPress={onPress}
              label={getLabel(route.name)}
              currentIndex={currentIndex}
            />
          );
        })}
      </View>
    </View>
  );
}

// ============================================
// СТИЛИ
// ============================================
const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },

  tabBarContent: {
    height: 64,
    position: 'relative', // ВАЖНО! Для absolute позиционирования детей
    width: SCREEN_WIDTH,
  },

  tabItem: {
    // position, left, width задаются динамически
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    minHeight: 48,
  },

  tabButtonInactive: {
    justifyContent: 'center', // Неактивная иконка центрируется
  },

  tabButtonActive: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'flex-start', // Активная: иконка слева, текст справа
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1, // Занимает оставшееся место
    alignItems: 'center', // Текст по центру
    justifyContent: 'center',
  },

  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

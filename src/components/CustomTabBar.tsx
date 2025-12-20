import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import {
  HomeIcon,
  HeartIcon,
  ScannerIcon,
  HistoryIcon,
  ProfileIcon,
} from './TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabButtonProps {
  route: any;
  index: number;
  focused: boolean;
  onPress: () => void;
  label: string;
}

function TabButton({ route, index, focused, onPress, label }: TabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: false, // Используем false для всех анимаций включая width
      tension: 50,
      friction: 7,
    }).start();
  }, [focused]);

  const getIcon = (routeName: string, focused: boolean) => {
    const color = focused ? COLORS.primary : COLORS.gray4;
    const size = 24;

    switch (routeName) {
      case 'Feed':
        return <HomeIcon size={size} color={color} />;
      case 'Favorites':
        return <HeartIcon size={size} color={color} />;
      case 'Scanner':
        return <ScannerIcon size={size} color={color} />;
      case 'History':
        return <HistoryIcon size={size} color={color} />;
      case 'Profile':
        return <ProfileIcon size={size} color={color} />;
      default:
        return null;
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Анимация фона
  const backgroundColor = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', COLORS.primaryLight],
  });

  // Анимация ширины
  const containerWidth = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 110], // Ширина: иконка только vs иконка + текст
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          {
            backgroundColor,
            width: containerWidth,
          },
        ]}
      >
        {/* Иконка */}
        <View style={styles.iconContainer}>{getIcon(route.name, focused)}</View>

        {/* Текст появляется при выборе */}
        {focused && (
          <Animated.View
            style={{
              opacity: scaleAnim,
            }}
          >
            <Text style={styles.tabLabel}>{label}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Feed':
        return 'Главная';
      case 'Favorites':
        return 'Избранное';
      case 'Scanner':
        return 'Сканер';
      case 'History':
        return 'История';
      case 'Profile':
        return 'Профиль';
      default:
        return routeName;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
      ]}
    >
      <View style={styles.tabsContainer}>
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
            <TabButton
              key={route.key}
              route={route}
              index={index}
              focused={isFocused}
              onPress={onPress}
              label={getLabel(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
  StyleSheet,
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
  ProfileIcon,
} from './TabBarIcons';

// Размер floating кнопки
const FLOATING_BUTTON_SIZE = 60;

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const getIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? COLORS.primary : COLORS.gray4;
    const size = 25;

    switch (routeName) {
      case 'Feed':
        return <HomeIcon size={size} color={color} filled={isFocused} />;
      case 'Favorites':
        return <HeartIcon size={size} color={color} filled={isFocused} />;
      case 'Scanner':
        return <ScannerIcon size={size} color={color} />;
      case 'ReviewWrite':
        return <PlusIcon size={size} color={color} filled={isFocused} />;
      case 'Profile':
        return <ProfileIcon size={size} color={color} filled={isFocused} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            const label = options.title || route.name;

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Scanner - скрываем иконку, но оставляем место
            if (route.name === 'Scanner') {
              return <View key={route.key} style={styles.tabItem} />;
            }

            // ProductResult - полностью скрываем (не показываем вообще)
            if (route.name === 'ProductResult') {
              return null;
            }

            const tabContent = (
              <View style={styles.iconContainer}>
                {getIcon(route.name, isFocused)}
              </View>
            );

            const tabLabel = (
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? COLORS.primary : COLORS.gray4 },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            );

            if (Platform.OS === 'android') {
              return (
                <TouchableNativeFeedback
                  key={route.key}
                  onPress={onPress}
                  background={TouchableNativeFeedback.Ripple(COLORS.greyLight, false)}
                >
                  <View style={styles.tabItem}>
                    {tabContent}
                    {tabLabel}
                  </View>
                </TouchableNativeFeedback>
              );
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {tabContent}
                {tabLabel}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Floating кнопка Scanner */}
      {Platform.OS === 'android' ? (
        <TouchableNativeFeedback
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Scanner');
          }}
          background={TouchableNativeFeedback.Ripple('rgba(255, 255, 255, 0.3)', true)}
        >
          <View style={styles.floatingButton}>
            <ScannerIcon size={28} color={COLORS.white} />
          </View>
        </TouchableNativeFeedback>
      ) : (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Scanner');
          }}
          style={styles.floatingButton}
          activeOpacity={0.8}
        >
          <ScannerIcon size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Менее прозрачный для читаемости
  },
  tabBarContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    top: -(FLOATING_BUTTON_SIZE * 0.382), // Золотое сечение (1 - φ)
    left: '50%',
    marginLeft: -FLOATING_BUTTON_SIZE / 2,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    borderRadius: FLOATING_BUTTON_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
});

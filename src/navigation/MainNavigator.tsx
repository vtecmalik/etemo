import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, MainTabParamList } from './types';
import { COLORS, SPACING } from '../constants/theme';

// Screens
import FeedScreen from '../screens/FeedScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ScannerScreen from '../screens/ScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductResultScreen from '../screens/ProductResultScreen';
import IngredientsScreen from '../screens/IngredientsScreen';
import LoginScreen from '../screens/LoginScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Иконки для табов
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Feed: '🏠',
    Favorites: '❤️',
    Scanner: '📷',
    History: '📋',
    Profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
    </View>
  );
};

// Кастомный хедер для Feed экрана с табами
function FeedHeader({ navigation, activeTab, onTabChange }: any) {
  return (
    <View style={styles.feedHeader}>
      {/* Logo */}
      <Text style={styles.logoText}>Etemo</Text>

      {/* Tabs */}
      <View style={styles.headerTabs}>
        <TouchableOpacity
          style={[styles.headerTab, activeTab === 'all' && styles.headerTabActive]}
          onPress={() => onTabChange('all')}
        >
          <Text style={[styles.headerTabText, activeTab === 'all' && styles.headerTabTextActive]}>
            Все
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerTab, activeTab === 'recommended' && styles.headerTabActive]}
          onPress={() => onTabChange('recommended')}
        >
          <Text style={[styles.headerTabText, activeTab === 'recommended' && styles.headerTabTextActive]}>
            Рек.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Search')}
        style={styles.headerSearchIcon}
      >
        <Text style={styles.searchIconText}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

// Кнопка поиска в хедере
function SearchButton({ navigation }: any) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Search')}
      style={styles.searchIcon}
    >
      <Text style={styles.searchIconText}>🔍</Text>
    </TouchableOpacity>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray4,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.greyLight,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.primary,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={({ navigation, route }) => ({
          title: 'Главная',
          headerTitle: () => (
            <FeedHeader
              navigation={navigation}
              activeTab={(route.params as any)?.activeTab || 'all'}
              onTabChange={(route.params as any)?.setActiveTab || (() => {})}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Избранное',
          headerTitle: 'Избранное',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Сканер',
          headerTitle: 'Сканировать',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'История',
          headerTitle: 'История',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          headerTitle: 'Мой профиль',
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.primary,
            fontWeight: '600',
          },
          headerTintColor: COLORS.primary,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductResult"
          component={ProductResultScreen}
          options={{
            title: 'Продукт',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Ingredients"
          component={IngredientsScreen}
          options={{
            title: 'Ингредиенты',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Вход',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Questionnaire"
          component={QuestionnaireScreen}
          options={{
            title: 'Анкета',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    width: '100%',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray0,
    borderRadius: 20,
    padding: 2,
    gap: 2,
  },
  headerTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  headerTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray4,
  },
  headerTabTextActive: {
    color: COLORS.primary,
  },
  headerSearchIcon: {
    padding: 4,
  },
  searchIcon: {
    marginRight: 16,
    padding: 4,
  },
  searchIconText: {
    fontSize: 20,
  },
});

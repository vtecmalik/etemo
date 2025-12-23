import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, MainTabParamList } from './types';
import { COLORS, SPACING } from '../constants/theme';
import { CustomTabBar } from '../components/CustomTabBar';

// Screens
import FeedScreen from '../screens/FeedScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ReviewWriteScreen from '../screens/ReviewWriteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductResultScreen from '../screens/ProductResultScreen';
import LoginScreen from '../screens/LoginScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.primary,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={({ navigation }) => ({
          title: 'Главная',
          headerTitle: 'Etemo',
          headerRight: () => <SearchButton navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Понравившиеся',
          headerTitle: 'Избранное',
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Сканер',
          headerTitle: 'Сканер',
        }}
      />
      <Tab.Screen
        name="ReviewWrite"
        component={ReviewWriteScreen}
        options={{
          title: 'Написать',
          headerTitle: 'Написать отзыв',
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
  const [error, setError] = useState<string | null>(null);

  // Обработчик ошибок навигации
  const onUnhandledAction = (action: any) => {
    const errorMessage = `Необработанное действие: ${action.type}`;
    console.error('Navigation error:', errorMessage, action);
    setError(errorMessage);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка навигации</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer onUnhandledAction={onUnhandledAction}>
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
  searchIcon: {
    marginRight: 16,
    padding: 4,
  },
  searchIconText: {
    fontSize: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
  },
});

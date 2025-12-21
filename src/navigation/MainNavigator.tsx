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

// Кнопка профиля в хедере (левый верхний угол в кружке)
function ProfileButton({ navigation }: any) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile')}
      style={styles.profileButton}
    >
      <View style={styles.profileCircle}>
        <Text style={styles.profileIcon}>👤</Text>
      </View>
    </TouchableOpacity>
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
          title: 'Смотрю',
          headerTitle: 'Etemo',
          headerLeft: () => <ProfileButton navigation={navigation} />,
          headerRight: () => <SearchButton navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={({ navigation }) => ({
          title: 'Ищу',
          headerTitle: 'Сканер',
          headerLeft: () => <ProfileButton navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="ReviewWrite"
        component={ReviewWriteScreen}
        options={({ navigation }) => ({
          title: 'Пишу',
          headerTitle: 'Написать отзыв',
          headerLeft: () => <ProfileButton navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={({ navigation }) => ({
          title: 'Люблю',
          headerTitle: 'Избранное',
          headerLeft: () => <ProfileButton navigation={navigation} />,
        })}
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
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Мой профиль',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    marginLeft: 16,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  searchIcon: {
    marginRight: 16,
    padding: 4,
  },
  searchIconText: {
    fontSize: 24,
  },
});

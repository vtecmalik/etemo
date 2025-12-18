import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

import { RootStackParamList, MainTabParamList } from './types';
import { COLORS } from '../constants/theme';

// Screens
import FeedScreen from '../screens/FeedScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductResultScreen from '../screens/ProductResultScreen';
import IngredientsScreen from '../screens/IngredientsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Иконки для табов
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Feed: '🏠',
    Scanner: '📷',
    Profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
    </View>
  );
};

// Компонент поиска в хедере
function SearchHeader({ navigation }: any) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (searchText.length === 13 && /^\d+$/.test(searchText)) {
      navigation.navigate('ProductResult', { barcode: searchText });
      setSearchText('');
      setIsSearchOpen(false);
    }
  };

  if (isSearchOpen) {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Введите штрих-код..."
          keyboardType="number-pad"
          maxLength={13}
          autoFocus
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={() => setIsSearchOpen(false)} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => setIsSearchOpen(true)} style={styles.searchIcon}>
      <Text style={styles.searchIconText}>🔍</Text>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray4,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.greyLight,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
        options={({ navigation }) => ({
          title: 'Главная',
          headerTitle: 'Etemo',
          headerRight: () => <SearchHeader navigation={navigation} />,
        })}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray0,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 16,
    height: 36,
    width: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    color: COLORS.gray4,
  },
  searchIcon: {
    marginRight: 16,
    padding: 4,
  },
  searchIconText: {
    fontSize: 20,
  },
});

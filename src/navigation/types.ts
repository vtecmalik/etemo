// Типы навигации

import { NavigatorScreenParams } from '@react-navigation/native';
import { Product } from '../types/product';

// Stack навигатор (для модальных окон и результатов)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductResult: {
    barcode: string;
    product?: Product; // Может быть передан из истории
  };
  Login: undefined;
  Questionnaire: {
    step: 'gender' | 'age' | 'skin_type' | 'skin_tone' | 'pregnancy';
  };
  Search: undefined;
};

// Tab навигатор
export type MainTabParamList = {
  Feed: undefined;
  Favorites: undefined;
  Scanner: undefined;
  ReviewWrite: undefined;
  Profile: undefined;
};

// Declare для useNavigation type safety
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

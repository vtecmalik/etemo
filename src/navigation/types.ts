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
  Ingredients: {
    product: Product;
  };
};

// Tab навигатор
export type MainTabParamList = {
  Feed: undefined;
  Scanner: undefined;
  Profile: undefined;
};

// Declare для useNavigation type safety
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

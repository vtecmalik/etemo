// Локальное хранилище для истории сканирований

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanHistoryItem, Product } from '../types/product';

const HISTORY_KEY = '@etemo_scan_history';
const MAX_HISTORY_ITEMS = 100;

class StorageService {
  // Получить историю сканирований
  async getHistory(): Promise<ScanHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  // Добавить в историю
  async addToHistory(barcode: string, product: Product): Promise<void> {
    try {
      const history = await this.getHistory();

      // Удаляем дубликат если есть
      const filteredHistory = history.filter((item) => item.barcode !== barcode);

      // Добавляем в начало
      const newItem: ScanHistoryItem = {
        barcode,
        product,
        scannedAt: new Date().toISOString(),
      };

      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  // Удалить из истории
  async removeFromHistory(barcode: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const newHistory = history.filter((item) => item.barcode !== barcode);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  }

  // Очистить историю
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // Задел под избранное (для будущего)
  private FAVORITES_KEY = '@etemo_favorites';

  async getFavorites(): Promise<ScanHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.FAVORITES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }

  async addToFavorites(barcode: string, product: Product): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some((item) => item.barcode === barcode);
      if (exists) return;

      const newItem: ScanHistoryItem = {
        barcode,
        product,
        scannedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        this.FAVORITES_KEY,
        JSON.stringify([newItem, ...favorites])
      );
    } catch (error) {
      console.error('Error saving to favorites:', error);
    }
  }

  async removeFromFavorites(barcode: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorites = favorites.filter((item) => item.barcode !== barcode);
      await AsyncStorage.setItem(this.FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  async isFavorite(barcode: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some((item) => item.barcode === barcode);
  }
}

export const storageService = new StorageService();

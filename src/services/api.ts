// API сервис - работает с тем же бэкендом что и веб-версия

import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { SearchResponse, IngredientsStatusResponse } from '../types/product';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async searchByBarcode(barcode: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${ENDPOINTS.search}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Search API error:', error);
      return {
        found: false,
        error: 'Ошибка подключения к серверу',
      };
    }
  }

  async checkIngredientsStatus(barcode: string): Promise<IngredientsStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${ENDPOINTS.ingredientsStatus}?barcode=${barcode}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: IngredientsStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Ingredients status API error:', error);
      return { ready: false };
    }
  }

  // Polling для ингредиентов (как на сайте)
  pollIngredientsStatus(
    barcode: string,
    onUpdate: (data: IngredientsStatusResponse) => void,
    maxWaitTime: number = 60000
  ): () => void {
    const startTime = Date.now();
    let intervalId: NodeJS.Timeout | null = null;
    let stopped = false;

    const check = async () => {
      if (stopped) return;

      const data = await this.checkIngredientsStatus(barcode);

      if (data.ready && data.ingredients) {
        onUpdate(data);
        if (intervalId) clearInterval(intervalId);
        return;
      }

      if (Date.now() - startTime > maxWaitTime) {
        console.log('Ingredients polling timeout');
        if (intervalId) clearInterval(intervalId);
        return;
      }
    };

    // Проверяем сразу
    check();

    // Затем каждые 2 секунды
    intervalId = setInterval(check, 2000);

    // Возвращаем функцию для остановки polling
    return () => {
      stopped = true;
      if (intervalId) clearInterval(intervalId);
    };
  }
}

export const apiService = new ApiService();

// Supabase клиент - задел под авторизацию и рекомендации

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/api';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Задел под авторизацию
export const authService = {
  // Регистрация
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Вход
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Выход
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Текущий пользователь
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Подписка на изменения авторизации
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Задел под рекомендации
export const recommendationsService = {
  // Получить рекомендации по типу кожи
  async getRecommendationsBySkinType(skinType: string) {
    // TODO: Реализовать когда будет готов алгоритм
    return [];
  },

  // Получить похожие продукты
  async getSimilarProducts(productId: string) {
    // TODO: Реализовать когда будет готов алгоритм
    return [];
  },

  // Сохранить предпочтения пользователя
  async saveUserPreferences(userId: string, preferences: any) {
    // TODO: Реализовать когда будет готова таблица
  },
};

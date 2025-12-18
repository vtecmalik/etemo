// API Configuration
// Используем тот же бэкенд что и веб-версия

export const API_BASE_URL = 'https://oleigh-barcode-checker.vercel.app';

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ssshmkcuxzondimckuut.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

// API Endpoints
export const ENDPOINTS = {
  search: '/api/search',
  ingredientsStatus: '/api/ingredients-status',
  popularProducts: '/api/popular-products',
  recommendedProducts: '/api/recommended-products',
};

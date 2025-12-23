// Типы данных - соответствуют API веб-версии

export interface Ingredient {
  position: number;
  name_en: string;
  name_ru: string | null;
  risk_score: string | null;
  tags: string[];
}

export interface SetPart {
  name?: string;
  name_en?: string | null;
  name_ru?: string | null;
  ingredients: Ingredient[];
}

export interface IngredientsData {
  type: 'regular' | 'set';
  count: number;
  ingredients?: Ingredient[];
  parts?: SetPart[];
}

export interface Category {
  id: number;
  name_ru: string | null;
  path: string;
}

export interface ParentBrand {
  name_en: string;
  name_ko: string | null;
  logo_url: string | null;
}

export interface Product {
  product_id?: number | null;
  name_en: string;
  name_ru: string | null;
  name_ko: string | null;
  brand: string;
  brand_ko: string | null;
  brand_logo: string | null;
  parent_brand?: ParentBrand | null;
  img_url: string | null;
  source: string;
  country: string | null;
  categories?: Category[];
  ingredients: IngredientsData | null;
}

export interface SearchResponse {
  found: boolean;
  result?: Product;
  error?: string;
  brand?: {
    name_en: string;
    name_ko: string | null;
    logo_url: string | null;
  };
}

export interface IngredientsStatusResponse {
  ready: boolean;
  ingredients?: IngredientsData;
  img_url?: string;
}

// История сканирований (локальное хранилище)
export interface ScanHistoryItem {
  barcode: string;
  product: Product;
  scannedAt: string; // ISO date string
}

// Задел под авторизацию
export interface User {
  id: string;
  email?: string;
  created_at: string;
  // Для будущих рекомендаций
  skin_type?: string;
  preferences?: {
    avoid_ingredients?: string[];
    favorite_brands?: string[];
  };
}

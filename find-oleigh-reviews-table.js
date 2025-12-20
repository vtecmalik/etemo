const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function findOleighReviewsTable() {
  console.log('🔍 Поиск таблицы с полными отзывами для oleigh_products...\n');

  const possibleTables = [
    'oleigh_reviews',
    'reviews_oleigh',
    'product_reviews_oleigh',
    'oleigh_product_reviews',
    'cosme_product_reviews',
    'koreannet_reviews',
    'glowpick_reviews'
  ];

  for (const tableName of possibleTables) {
    try {
      console.log(`  Проверка таблицы: ${tableName}...`);

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!error && data !== null) {
        console.log(`  ✅ НАЙДЕНА: ${tableName}\n`);
        console.log(`  📄 Структура:`, Object.keys(data[0] || {}).join(', '));
        console.log(`  📊 Пример данных:`, data[0]);

        // Попытка посчитать количество
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (count !== null) {
          console.log(`  📝 Всего записей: ${count.toLocaleString('ru-RU')}`);
        }

        return tableName;
      }
    } catch (e) {
      // Игнорируем, пробуем следующую
    }
  }

  console.log('\n❌ Таблица с полными отзывами для oleigh_products не найдена.');
  console.log('\n💡 Вывод:');
  console.log('   - oleigh_products содержит только review_count');
  console.log('   - Сами отзывы не сохраняются в базе');
  console.log('   - Количество уникальных пользователей посчитать невозможно');
}

findOleighReviewsTable();

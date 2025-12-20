const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countReviews() {
  console.log('🔍 Анализ отзывов в базе данных...\n');

  try {
    // 1. Загружаем все продукты с баркодами
    console.log('📦 Загрузка продуктов с баркодами...');

    let allProductsWithBarcodes = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_products')
        .select('id, barcode')
        .not('barcode', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        break;
      }

      if (data && data.length > 0) {
        allProductsWithBarcodes = allProductsWithBarcodes.concat(data);
        console.log(`  Загружено ${allProductsWithBarcodes.length} продуктов с баркодами...`);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Всего продуктов с баркодами: ${allProductsWithBarcodes.length.toLocaleString('ru-RU')}\n`);

    // Создаем Set из ID продуктов с баркодами
    const productIdsWithBarcodes = new Set(allProductsWithBarcodes.map(p => p.id));

    // 2. Загружаем ВСЕ отзывы постранично
    console.log('📝 Загрузка всех отзывов...');

    let allReviews = [];
    page = 0;
    hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_reviews')
        .select('product_id, user_id')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        break;
      }

      if (data && data.length > 0) {
        allReviews = allReviews.concat(data);
        console.log(`  Загружено ${allReviews.length.toLocaleString('ru-RU')} отзывов...`);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Всего отзывов загружено: ${allReviews.length.toLocaleString('ru-RU')}\n`);

    // 3. Анализируем отзывы
    console.log('🔍 Анализ данных...');

    const productsWithReviews = new Set();
    const usersWhoReviewed = new Set();
    let reviewsOnProductsWithBarcodes = 0;

    allReviews.forEach(review => {
      const productId = review.product_id;
      const userId = review.user_id;

      // Проверяем что это продукт с баркодом
      if (productIdsWithBarcodes.has(productId)) {
        productsWithReviews.add(productId);
        reviewsOnProductsWithBarcodes++;

        if (userId) {
          usersWhoReviewed.add(userId);
        }
      }
    });

    // 4. Выводим результаты
    console.log('\n' + '═'.repeat(70));
    console.log('📊 СТАТИСТИКА ПО ОТЗЫВАМ НА ПРОДУКТЫ С БАРКОДАМИ');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`📦 Продуктов с баркодами в базе: ${allProductsWithBarcodes.length.toLocaleString('ru-RU')}`);
    console.log(`✅ Продуктов с баркодами, имеющих отзывы: ${productsWithReviews.size.toLocaleString('ru-RU')}`);
    console.log(`📝 Всего отзывов на продукты с баркодами: ${reviewsOnProductsWithBarcodes.toLocaleString('ru-RU')}`);
    console.log(`👥 Уникальных пользователей написавших эти отзывы: ${usersWhoReviewed.size.toLocaleString('ru-RU')}`);
    console.log('');

    // Дополнительная статистика
    const percentProductsWithReviews = ((productsWithReviews.size / allProductsWithBarcodes.length) * 100).toFixed(2);
    const avgReviewsPerProduct = productsWithReviews.size > 0 ? (reviewsOnProductsWithBarcodes / productsWithReviews.size).toFixed(2) : 0;
    const avgReviewsPerUser = usersWhoReviewed.size > 0 ? (reviewsOnProductsWithBarcodes / usersWhoReviewed.size).toFixed(2) : 0;

    console.log('📈 Дополнительная статистика:');
    console.log('─'.repeat(70));
    console.log(`   Процент продуктов с баркодами имеющих отзывы: ${percentProductsWithReviews}%`);
    console.log(`   Среднее количество отзывов на продукт: ${avgReviewsPerProduct}`);
    console.log(`   Среднее количество отзывов от пользователя: ${avgReviewsPerUser}`);
    console.log('─'.repeat(70));
    console.log('');
    console.log('═'.repeat(70));

    // Общая статистика по ВСЕМ отзывам
    console.log('\n📊 ОБЩАЯ СТАТИСТИКА (все отзывы в базе):');
    console.log('─'.repeat(70));
    console.log(`   Всего отзывов в базе: ${allReviews.length.toLocaleString('ru-RU')}`);
    console.log(`   Отзывов на продукты БЕЗ баркодов: ${(allReviews.length - reviewsOnProductsWithBarcodes).toLocaleString('ru-RU')}`);
    console.log('─'.repeat(70));

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

countReviews();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countCosmeFull() {
  console.log('🔍 ПОЛНЫЙ подсчет ВСЕХ отзывов для cosme_products с баркодами...\n');

  try {
    // 1. Загружаем product_id продуктов с баркодами
    console.log('📦 Загрузка product_id продуктов с баркодами...');

    let allProductsWithBarcodes = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_products')
        .select('product_id, barcode')
        .not('barcode', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка:', error);
        break;
      }

      if (data && data.length > 0) {
        allProductsWithBarcodes = allProductsWithBarcodes.concat(data);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Продуктов с баркодами: ${allProductsWithBarcodes.length.toLocaleString('ru-RU')}\n`);

    const productIdsWithBarcodes = new Set(allProductsWithBarcodes.map(p => p.product_id));

    // 2. Загружаем ВСЕ отзывы без ограничения
    console.log('📝 Загрузка ВСЕХ отзывов (без лимита)...\n');

    let allReviews = [];
    page = 0;
    hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_reviews')
        .select('product_id, user_id')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.log(`⚠️  Остановка на странице ${page}: ${error.message || 'таймаут'}`);
        break;
      }

      if (data && data.length > 0) {
        allReviews = allReviews.concat(data);
        if (page % 20 === 0) {
          console.log(`  📊 ${allReviews.length.toLocaleString('ru-RU')} отзывов...`);
        }
        page++;
        hasMore = data.length === pageSize;

        // Небольшая пауза каждые 50 страниц чтобы не перегружать
        if (page % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`\n✅ Загружено ${allReviews.length.toLocaleString('ru-RU')} отзывов\n`);

    // 3. Анализ
    console.log('🔍 Анализ данных...\n');

    const productsWithReviews = new Set();
    const usersWhoReviewed = new Set();
    let reviewsOnProductsWithBarcodes = 0;

    allReviews.forEach(review => {
      if (productIdsWithBarcodes.has(review.product_id)) {
        productsWithReviews.add(review.product_id);
        reviewsOnProductsWithBarcodes++;
        if (review.user_id) {
          usersWhoReviewed.add(review.user_id);
        }
      }
    });

    // 4. Результаты
    console.log('═'.repeat(70));
    console.log('📊 ФИНАЛЬНАЯ СТАТИСТИКА (cosme_products С БАРКОДАМИ)');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`📦 Продуктов с баркодами: ${allProductsWithBarcodes.length.toLocaleString('ru-RU')}`);
    console.log(`✅ Из них имеющих отзывы: ${productsWithReviews.size.toLocaleString('ru-RU')}`);
    console.log(`📝 Всего отзывов на продукты с баркодами: ${reviewsOnProductsWithBarcodes.toLocaleString('ru-RU')}`);
    console.log(`👥 Уникальных пользователей: ${usersWhoReviewed.size.toLocaleString('ru-RU')}`);
    console.log('');

    const percent = ((productsWithReviews.size / allProductsWithBarcodes.length) * 100).toFixed(2);
    const avgPerProduct = (reviewsOnProductsWithBarcodes / productsWithReviews.size).toFixed(2);
    const avgPerUser = (reviewsOnProductsWithBarcodes / usersWhoReviewed.size).toFixed(2);

    console.log('📈 Метрики:');
    console.log('─'.repeat(70));
    console.log(`   Охват продуктов: ${percent}%`);
    console.log(`   Средних отзывов на продукт: ${avgPerProduct}`);
    console.log(`   Средних отзывов от пользователя: ${avgPerUser}`);
    console.log('─'.repeat(70));
    console.log('');
    console.log(`📊 Всего отзывов в базе: ${allReviews.length.toLocaleString('ru-RU')}`);
    console.log(`   На продукты БЕЗ баркодов: ${(allReviews.length - reviewsOnProductsWithBarcodes).toLocaleString('ru-RU')}`);
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

countCosmeFull();

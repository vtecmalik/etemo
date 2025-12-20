const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countCosmeActive() {
  console.log('🔍 Подсчет отзывов для АКТИВНЫХ продуктов (discontinued = false)...\n');

  try {
    // 1. Сначала посчитаем сколько всего продуктов с баркодами
    console.log('📊 Общая статистика продуктов с баркодами:\n');

    const { count: totalWithBarcodes } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true })
      .not('barcode', 'is', null);

    const { count: discontinuedCount } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true })
      .not('barcode', 'is', null)
      .eq('discontinued', true);

    const { count: activeCount } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true })
      .not('barcode', 'is', null)
      .eq('discontinued', false);

    console.log(`   Всего продуктов с баркодами: ${totalWithBarcodes?.toLocaleString('ru-RU')}`);
    console.log(`   ❌ Снято с производства: ${discontinuedCount?.toLocaleString('ru-RU')}`);
    console.log(`   ✅ Активных: ${activeCount?.toLocaleString('ru-RU')}`);
    console.log('');

    // 2. Загружаем только АКТИВНЫЕ продукты с баркодами
    console.log('📦 Загрузка АКТИВНЫХ продуктов с баркодами...');

    let activeProducts = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_products')
        .select('product_id, barcode, name_ru, name_en')
        .not('barcode', 'is', null)
        .eq('discontinued', false)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка:', error);
        break;
      }

      if (data && data.length > 0) {
        activeProducts = activeProducts.concat(data);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Загружено активных продуктов: ${activeProducts.length.toLocaleString('ru-RU')}\n`);

    const activeProductIds = new Set(activeProducts.map(p => p.product_id));

    // 3. Загружаем ВСЕ отзывы
    console.log('📝 Загрузка всех отзывов...\n');

    let allReviews = [];
    page = 0;
    hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('cosme_reviews')
        .select('product_id, user_id')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.log(`⚠️  Остановка: ${error.message || 'таймаут'}`);
        break;
      }

      if (data && data.length > 0) {
        allReviews = allReviews.concat(data);
        if (page % 20 === 0) {
          console.log(`  📊 ${allReviews.length.toLocaleString('ru-RU')} отзывов...`);
        }
        page++;
        hasMore = data.length === pageSize;

        if (page % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`\n✅ Загружено ${allReviews.length.toLocaleString('ru-RU')} отзывов\n`);

    // 4. Анализ
    console.log('🔍 Анализ данных...\n');

    const productsWithReviews = new Set();
    const usersWhoReviewed = new Set();
    let reviewsOnActiveProducts = 0;

    allReviews.forEach(review => {
      if (activeProductIds.has(review.product_id)) {
        productsWithReviews.add(review.product_id);
        reviewsOnActiveProducts++;
        if (review.user_id) {
          usersWhoReviewed.add(review.user_id);
        }
      }
    });

    // 5. Результаты
    console.log('═'.repeat(70));
    console.log('📊 СТАТИСТИКА ПО АКТИВНЫМ ПРОДУКТАМ С БАРКОДАМИ');
    console.log('   (discontinued = false)');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`📦 Активных продуктов с баркодами: ${activeProducts.length.toLocaleString('ru-RU')}`);
    console.log(`✅ Из них имеющих отзывы: ${productsWithReviews.size.toLocaleString('ru-RU')}`);
    console.log(`❌ Без отзывов: ${(activeProducts.length - productsWithReviews.size).toLocaleString('ru-RU')}`);
    console.log('');
    console.log(`📝 Всего отзывов на активные продукты: ${reviewsOnActiveProducts.toLocaleString('ru-RU')}`);
    console.log(`👥 Уникальных пользователей: ${usersWhoReviewed.size.toLocaleString('ru-RU')}`);
    console.log('');

    const percent = ((productsWithReviews.size / activeProducts.length) * 100).toFixed(2);
    const avgPerProduct = productsWithReviews.size > 0 ? (reviewsOnActiveProducts / productsWithReviews.size).toFixed(2) : 0;
    const avgPerUser = usersWhoReviewed.size > 0 ? (reviewsOnActiveProducts / usersWhoReviewed.size).toFixed(2) : 0;

    console.log('📈 Метрики:');
    console.log('─'.repeat(70));
    console.log(`   Охват продуктов с отзывами: ${percent}%`);
    console.log(`   Среднее отзывов на продукт: ${avgPerProduct}`);
    console.log(`   Среднее отзывов от пользователя: ${avgPerUser}`);
    console.log('─'.repeat(70));
    console.log('');

    // Сравнение с общей статистикой
    console.log('📊 СРАВНЕНИЕ:');
    console.log('─'.repeat(70));
    console.log(`   Всего продуктов с баркодами: ${totalWithBarcodes?.toLocaleString('ru-RU')}`);
    console.log(`   Снято с производства: ${discontinuedCount?.toLocaleString('ru-RU')} (${((discontinuedCount || 0) / (totalWithBarcodes || 1) * 100).toFixed(2)}%)`);
    console.log(`   Активных: ${activeProducts.length.toLocaleString('ru-RU')} (${((activeProducts.length) / (totalWithBarcodes || 1) * 100).toFixed(2)}%)`);
    console.log('─'.repeat(70));
    console.log('');
    console.log(`   Отзывов на активные продукты: ${reviewsOnActiveProducts.toLocaleString('ru-RU')}`);
    console.log(`   Отзывов на снятые с производства: ${(allReviews.length - reviewsOnActiveProducts - (allReviews.length - 196941)).toLocaleString('ru-RU')}`);
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

countCosmeActive();

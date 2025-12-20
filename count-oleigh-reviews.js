const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countOleighReviews() {
  console.log('🔍 Анализ отзывов в oleigh_products...\n');

  try {
    // 1. Загружаем ВСЕ продукты с баркодами из oleigh_products
    console.log('📦 Загрузка продуктов с баркодами из oleigh_products...');

    let allProducts = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('oleigh_products')
        .select('barcode, review_count, name_ru, name_en, brand_name_en')
        .not('barcode', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        break;
      }

      if (data && data.length > 0) {
        allProducts = allProducts.concat(data);
        console.log(`  Загружено ${allProducts.length} продуктов...`);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Всего продуктов с баркодами: ${allProducts.length.toLocaleString('ru-RU')}\n`);

    // 2. Анализируем данные
    console.log('🔍 Анализ review_count...');

    let productsWithReviews = 0;
    let totalReviews = 0;
    const reviewCounts = [];

    allProducts.forEach(product => {
      const reviewCount = product.review_count || 0;

      if (reviewCount > 0) {
        productsWithReviews++;
        totalReviews += reviewCount;
        reviewCounts.push(reviewCount);
      }
    });

    // Сортируем для нахождения топ продуктов
    reviewCounts.sort((a, b) => b - a);

    // Топ-10 продуктов по отзывам
    const topProducts = allProducts
      .filter(p => (p.review_count || 0) > 0)
      .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
      .slice(0, 10);

    // 3. Выводим результаты
    console.log('\n' + '═'.repeat(70));
    console.log('📊 СТАТИСТИКА ПО ОТЗЫВАМ (oleigh_products)');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`📦 Продуктов с баркодами в базе: ${allProducts.length.toLocaleString('ru-RU')}`);
    console.log(`✅ Продуктов с баркодами, имеющих отзывы: ${productsWithReviews.toLocaleString('ru-RU')}`);
    console.log(`📝 Всего отзывов на продукты с баркодами: ${totalReviews.toLocaleString('ru-RU')}`);
    console.log('');

    // Дополнительная статистика
    const percentProductsWithReviews = allProducts.length > 0 ? ((productsWithReviews / allProducts.length) * 100).toFixed(2) : 0;
    const avgReviewsPerProduct = productsWithReviews > 0 ? (totalReviews / productsWithReviews).toFixed(2) : 0;
    const maxReviews = reviewCounts.length > 0 ? reviewCounts[0] : 0;
    const minReviews = reviewCounts.length > 0 ? reviewCounts[reviewCounts.length - 1] : 0;

    console.log('📈 Дополнительная статистика:');
    console.log('─'.repeat(70));
    console.log(`   Процент продуктов с баркодами имеющих отзывы: ${percentProductsWithReviews}%`);
    console.log(`   Среднее количество отзывов на продукт (с отзывами): ${avgReviewsPerProduct}`);
    console.log(`   Максимум отзывов на один продукт: ${maxReviews.toLocaleString('ru-RU')}`);
    console.log(`   Минимум отзывов (среди продуктов с отзывами): ${minReviews.toLocaleString('ru-RU')}`);
    console.log('─'.repeat(70));
    console.log('');

    // Топ-10 продуктов
    if (topProducts.length > 0) {
      console.log('🏆 ТОП-10 ПРОДУКТОВ ПО КОЛИЧЕСТВУ ОТЗЫВОВ:');
      console.log('─'.repeat(70));
      topProducts.forEach((product, index) => {
        const name = product.name_ru || product.name_en;
        const brand = product.brand_name_en;
        console.log(`${index + 1}. ${brand} - ${name}`);
        console.log(`   Barcode: ${product.barcode} | Отзывов: ${product.review_count?.toLocaleString('ru-RU')}`);
        console.log('');
      });
      console.log('─'.repeat(70));
    }

    console.log('');
    console.log('═'.repeat(70));

    // ВАЖНОЕ ЗАМЕЧАНИЕ
    console.log('');
    console.log('⚠️  ВАЖНО:');
    console.log('   В oleigh_products хранится review_count (количество отзывов),');
    console.log('   но сами отзывы НЕ хранятся в этой базе.');
    console.log('   Отзывы парсятся с внешних сайтов и сохраняется только их количество.');
    console.log('');
    console.log('   Чтобы узнать количество УНИКАЛЬНЫХ пользователей, нужна');
    console.log('   отдельная таблица с полными данными отзывов.');

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

countOleighReviews();

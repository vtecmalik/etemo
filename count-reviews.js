const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countReviews() {
  console.log('🔍 Анализ отзывов в базе данных...\n');

  try {
    // Попробуем найти таблицу с отзывами
    console.log('📋 Поиск таблицы с отзывами...');

    // Пробуем разные возможные названия таблиц
    const possibleTables = ['reviews', 'cosme_reviews', 'product_reviews', 'user_reviews'];
    let reviewsTable = null;

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error && data !== null) {
          reviewsTable = tableName;
          console.log(`✅ Найдена таблица: ${tableName}`);
          console.log(`📄 Пример структуры:`, data[0] || 'Таблица пустая');
          break;
        }
      } catch (e) {
        // Игнорируем ошибки, пробуем следующую таблицу
      }
    }

    if (!reviewsTable) {
      console.log('⚠️  Таблица отзывов не найдена среди стандартных имен.');
      console.log('🔍 Попробуем посмотреть на структуру cosme_products...');

      // Проверим есть ли отзывы прямо в таблице продуктов
      const { data: sampleProduct } = await supabase
        .from('cosme_products')
        .select('*')
        .not('barcode', 'is', null)
        .limit(1);

      if (sampleProduct && sampleProduct[0]) {
        console.log('\n📄 Пример структуры cosme_products:');
        console.log(Object.keys(sampleProduct[0]).join(', '));
      }

      return;
    }

    console.log('\n📊 Подсчет статистики по отзывам...\n');

    // 1. Общее количество отзывов
    const { count: totalReviews, error: totalError } = await supabase
      .from(reviewsTable)
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ Ошибка при подсчете отзывов:', totalError);
      return;
    }

    console.log(`✅ Всего отзывов в базе: ${totalReviews?.toLocaleString('ru-RU')}`);

    // 2. Получим пример отзыва чтобы понять структуру
    const { data: sampleReview } = await supabase
      .from(reviewsTable)
      .select('*')
      .limit(1);

    console.log('\n📄 Структура отзыва:', sampleReview?.[0] ? Object.keys(sampleReview[0]).join(', ') : 'Нет данных');

    // 3. Определим поля для связи с продуктами
    const reviewFields = sampleReview?.[0] ? Object.keys(sampleReview[0]) : [];
    const productIdField = reviewFields.find(f => f.includes('product') || f.includes('barcode'));
    const userIdField = reviewFields.find(f => f.includes('user') || f.includes('author'));

    console.log(`\n🔗 Поле связи с продуктом: ${productIdField || 'не найдено'}`);
    console.log(`👤 Поле пользователя: ${userIdField || 'не найдено'}`);

    if (!productIdField) {
      console.log('\n⚠️  Не удалось определить поле связи с продуктами.');
      return;
    }

    // 4. Получаем все отзывы для анализа (постранично чтобы не упереться в лимиты)
    console.log('\n📊 Загрузка всех отзывов для анализа...');

    let allReviews = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(reviewsTable)
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Ошибка при загрузке страницы:', error);
        break;
      }

      if (data && data.length > 0) {
        allReviews = allReviews.concat(data);
        console.log(`  Загружено ${allReviews.length} отзывов...`);
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`\n✅ Загружено ${allReviews.length} отзывов`);

    // 5. Анализ отзывов
    const productBarcodes = new Set();
    const userIds = new Set();

    // Загрузим все продукты с баркодами
    console.log('\n📦 Загрузка продуктов с баркодами...');
    const { data: productsWithBarcodes } = await supabase
      .from('cosme_products')
      .select('barcode, id')
      .not('barcode', 'is', null);

    const barcodeToIdMap = new Map();
    const idToBarcodeMap = new Map();

    productsWithBarcodes?.forEach(p => {
      if (p.barcode) {
        barcodeToIdMap.set(p.barcode, p.id);
        idToBarcodeMap.set(p.id, p.barcode);
      }
    });

    console.log(`✅ Загружено ${barcodeToIdMap.size} продуктов с баркодами`);

    // Анализируем отзывы
    allReviews.forEach(review => {
      const productRef = review[productIdField];

      // Проверяем это баркод или ID
      if (productRef) {
        if (barcodeToIdMap.has(productRef) || idToBarcodeMap.has(productRef)) {
          productBarcodes.add(productRef);
        }
      }

      if (userIdField && review[userIdField]) {
        userIds.add(review[userIdField]);
      }
    });

    // Результаты
    console.log('\n' + '═'.repeat(60));
    console.log('📊 СТАТИСТИКА ПО ОТЗЫВАМ');
    console.log('═'.repeat(60));
    console.log(`\n📝 Всего отзывов: ${allReviews.length.toLocaleString('ru-RU')}`);
    console.log(`📦 Продуктов с баркодами, имеющих отзывы: ${productBarcodes.size.toLocaleString('ru-RU')}`);
    console.log(`👥 Уникальных пользователей написавших отзывы: ${userIds.size.toLocaleString('ru-RU')}`);

    const avgReviewsPerProduct = productBarcodes.size > 0 ? (allReviews.length / productBarcodes.size).toFixed(2) : 0;
    const avgReviewsPerUser = userIds.size > 0 ? (allReviews.length / userIds.size).toFixed(2) : 0;

    console.log(`\n📈 Средних отзывов на продукт: ${avgReviewsPerProduct}`);
    console.log(`📈 Средних отзывов от пользователя: ${avgReviewsPerUser}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

countReviews();

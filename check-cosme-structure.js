const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCosmeStructure() {
  console.log('🔍 Детальная проверка структуры таблиц...\n');

  // 1. Полная структура cosme_products с баркодом
  const { data: productSample } = await supabase
    .from('cosme_products')
    .select('*')
    .not('barcode', 'is', null)
    .limit(1);

  console.log('📦 ПОЛНАЯ СТРУКТУРА cosme_products (с баркодом):');
  console.log('─'.repeat(70));
  if (productSample && productSample[0]) {
    Object.entries(productSample[0]).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }
  console.log('─'.repeat(70));
  console.log('');

  // 2. Полная структура cosme_reviews
  const { data: reviewSample } = await supabase
    .from('cosme_reviews')
    .select('*')
    .limit(1);

  console.log('📝 ПОЛНАЯ СТРУКТУРА cosme_reviews:');
  console.log('─'.repeat(70));
  if (reviewSample && reviewSample[0]) {
    Object.entries(reviewSample[0]).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }
  console.log('─'.repeat(70));
  console.log('');

  // 3. Проверим возможные поля связи
  const productFields = productSample?.[0] ? Object.keys(productSample[0]) : [];
  const possibleLinkFields = productFields.filter(f =>
    f.includes('id') || f.includes('cosme') || f.includes('product')
  );

  console.log('🔗 Возможные поля для связи в cosme_products:');
  console.log('   ', possibleLinkFields.join(', '));
  console.log('');

  // 4. Проверим каждое поле на совпадение с product_id из отзывов
  if (reviewSample && reviewSample[0] && productSample && productSample[0]) {
    const reviewProductId = reviewSample[0].product_id;
    console.log(`📍 Ищем совпадения для product_id = ${reviewProductId} из отзывов:\n`);

    for (const field of possibleLinkFields) {
      const value = productSample[0][field];
      console.log(`   ${field}: ${value} ${value === reviewProductId ? '✅ СОВПАДЕНИЕ!' : ''}`);
    }
    console.log('');

    // Попробуем найти продукт с этим product_id по разным полям
    for (const field of possibleLinkFields) {
      const { data: match } = await supabase
        .from('cosme_products')
        .select('id, barcode, name_ru, name_en, ' + field)
        .eq(field, reviewProductId)
        .not('barcode', 'is', null)
        .limit(1);

      if (match && match.length > 0) {
        console.log(`✅ НАЙДЕНО СОВПАДЕНИЕ по полю "${field}"!`);
        console.log('   Продукт:', match[0].name_ru || match[0].name_en);
        console.log('   Barcode:', match[0].barcode);
        console.log('   Поле связи:', field, '=', match[0][field]);
        console.log('');
      }
    }
  }

  // 5. Проверим сколько продуктов с баркодами имеют значения в каждом поле
  console.log('📊 Статистика заполненности полей в cosme_products с баркодами:\n');

  for (const field of possibleLinkFields) {
    const { count } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true })
      .not('barcode', 'is', null)
      .not(field, 'is', null);

    console.log(`   ${field}: ${count} заполнено`);
  }
}

checkCosmeStructure();

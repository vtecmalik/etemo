const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProductIds() {
  console.log('🔍 Проверка связи между таблицами...\n');

  // 1. Примеры product_id из отзывов
  const { data: reviewSamples } = await supabase
    .from('cosme_reviews')
    .select('product_id')
    .limit(10);

  console.log('📝 Примеры product_id из cosme_reviews:');
  console.log(reviewSamples?.map(r => r.product_id).join(', '));
  console.log('');

  // 2. Примеры id из продуктов с баркодами
  const { data: productSamples } = await supabase
    .from('cosme_products')
    .select('id, barcode, name_ru, name_en')
    .not('barcode', 'is', null)
    .limit(10);

  console.log('📦 Примеры id из cosme_products с баркодами:');
  productSamples?.forEach(p => {
    console.log(`  ID: ${p.id}, Barcode: ${p.barcode}, Name: ${p.name_ru || p.name_en}`);
  });
  console.log('');

  // 3. Проверим есть ли хоть один product_id из отзывов в cosme_products
  if (reviewSamples && reviewSamples.length > 0) {
    const sampleProductId = reviewSamples[0].product_id;

    const { data: matchedProduct } = await supabase
      .from('cosme_products')
      .select('id, barcode, name_ru, name_en')
      .eq('id', sampleProductId)
      .single();

    console.log(`🔗 Проверка связи для product_id = ${sampleProductId}:`);
    if (matchedProduct) {
      console.log('  ✅ Найден в cosme_products:');
      console.log(`     Name: ${matchedProduct.name_ru || matchedProduct.name_en}`);
      console.log(`     Barcode: ${matchedProduct.barcode || 'НЕТ'}`);
    } else {
      console.log('  ❌ НЕ найден в cosme_products');
      console.log('  ⚠️  Возможно это другая таблица продуктов!');
    }
  }

  console.log('');

  // 4. Попробуем найти таблицу oleigh_products
  console.log('🔍 Проверка таблицы oleigh_products...');
  const { data: oleighSample, error: oleighError } = await supabase
    .from('oleigh_products')
    .select('*')
    .limit(1);

  if (!oleighError && oleighSample) {
    console.log('✅ Таблица oleigh_products найдена!');
    console.log('📄 Пример структуры:', Object.keys(oleighSample[0]).join(', '));
    console.log('');

    // Проверим есть ли отзывы на продукты из oleigh_products
    const { data: oleighProducts } = await supabase
      .from('oleigh_products')
      .select('id')
      .limit(100);

    if (oleighProducts && reviewSamples) {
      const oleighIds = new Set(oleighProducts.map(p => p.id));
      const reviewProductIds = reviewSamples.map(r => r.product_id);

      const hasMatch = reviewProductIds.some(id => oleighIds.has(id));
      console.log(`🔗 Проверка связи с oleigh_products: ${hasMatch ? '✅ НАЙДЕНА' : '❌ НЕ НАЙДЕНА'}`);
    }
  }
}

checkProductIds();

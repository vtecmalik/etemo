const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ssshmkcuxzondimckuut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc2hta2N1eHpvbmRpbWNrdXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODMwMTAsImV4cCI6MjA3NTY1OTAxMH0.yMpDu1XKkh3O8RxdNhRLLvC34OAAmprKTqzcI-7F50k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countProducts() {
  console.log('🔍 Подключаюсь к Supabase...\n');

  try {
    // Подсчет всех продуктов в таблице cosme_products
    console.log('📊 Подсчет всех продуктов в таблице cosme_products...');
    const { count: totalCount, error: totalError } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ Ошибка при подсчете всех продуктов:', totalError);
      return;
    }

    console.log(`✅ Всего продуктов в таблице: ${totalCount?.toLocaleString('ru-RU')}`);
    console.log('');

    // Подсчет продуктов с баркодами (не null)
    console.log('📊 Подсчет продуктов с баркодами (barcode IS NOT NULL)...');
    const { count: barcodeCount, error: barcodeError } = await supabase
      .from('cosme_products')
      .select('*', { count: 'exact', head: true })
      .not('barcode', 'is', null);

    if (barcodeError) {
      console.error('❌ Ошибка при подсчете продуктов с баркодами:', barcodeError);
      return;
    }

    console.log(`✅ Продуктов с баркодами: ${barcodeCount?.toLocaleString('ru-RU')}`);
    console.log('');

    // Подсчет продуктов без баркодов
    const productsWithoutBarcode = (totalCount || 0) - (barcodeCount || 0);
    console.log(`📦 Продуктов без баркодов: ${productsWithoutBarcode.toLocaleString('ru-RU')}`);
    console.log('');

    // Статистика
    console.log('📈 Статистика:');
    console.log('─'.repeat(50));
    const percentage = totalCount ? ((barcodeCount || 0) / totalCount * 100).toFixed(2) : 0;
    console.log(`Процент продуктов с баркодами: ${percentage}%`);
    console.log('─'.repeat(50));
    console.log('');

    // Дополнительная статистика - примеры баркодов
    console.log('📋 Примеры продуктов с баркодами (первые 5):');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('cosme_products')
      .select('barcode, name_ru, name_en, brand_name_en')
      .not('barcode', 'is', null)
      .limit(5);

    if (!sampleError && sampleProducts) {
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.barcode} - ${product.brand_name_en} - ${product.name_ru || product.name_en}`);
      });
    }

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
  }
}

countProducts();

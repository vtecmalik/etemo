# ETEMO - Проект React Native приложения для сканирования косметики

## О проекте
**Название:** etemo
**Тип:** React Native приложение (Expo)
**Платформа:** Android (edge-to-edge с прозрачной навигацией)
**Язык:** TypeScript + React Native

## Структура проекта

```
etemo/
├── src/
│   ├── components/
│   │   ├── Logo.tsx              # ETEMO логотип в хедере (40dp высота)
│   │   ├── CustomTabBar.tsx      # Кастомный таб-бар с floating кнопкой
│   │   └── TabBarIcons.tsx       # Иконки табов (YouTube-стиль)
│   ├── navigation/
│   │   ├── MainNavigator.tsx     # Главная навигация
│   │   └── types.ts
│   ├── screens/
│   │   ├── FeedScreen.tsx        # Главная лента
│   │   ├── FavoritesScreen.tsx   # Избранное
│   │   ├── ScannerScreen.tsx     # Сканер штрихкодов
│   │   ├── ReviewWriteScreen.tsx # Написать отзыв
│   │   ├── ProfileScreen.tsx     # Профиль
│   │   ├── ProductResultScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── QuestionnaireScreen.tsx
│   │   └── SearchScreen.tsx
│   └── constants/
│       └── theme.ts              # Цвета и стили
├── assets/
│   └── etemo-logo.svg
├── app.json                      # Expo конфигурация
└── package.json

Backend (oleigh-barcode-checker/):
├── translate-cosme-ingredients.mjs  # Переводчик ингредиентов (JP→EN)
└── .env.local                       # API ключи
```

## Текущий статус

### Последние изменения:
1. **Логотип** - обновлен viewBox (100 155 175 55) для правильного размера
2. **Иконки табов** - обновлены на YouTube-стиль с filled/outline состояниями
3. **Android Ripple** - добавлены эффекты для всех кнопок на Android
4. **Переводчик** - автоматический перевод японских ингредиентов в cosme_products

### Технические детали:
- **Navigation:** @react-navigation/native + bottom-tabs
- **Icons:** react-native-svg (YouTube-стиль)
- **Database:** Supabase (cosme_products таблица)
- **Translation:** Anthropic Claude API (Haiku model)
- **Haptics:** expo-haptics для тактильной обратной связи

## Билд и запуск

### Команды для разработки:
```bash
cd C:\Users\user\Desktop\oleigh-barcode-checker\etemo
npm start              # Запуск Expo Dev Server
npm run android        # Запуск на Android устройстве
```

### Переводчик ингредиентов:
```bash
cd C:\Users\user\Desktop\oleigh-barcode-checker\oleigh-barcode-checker
node translate-cosme-ingredients.mjs  # Непрерывный перевод JP→EN
```

## Важные файлы для редактирования

- **Навигация:** `src/navigation/MainNavigator.tsx`
- **Таб-бар:** `src/components/CustomTabBar.tsx`
- **Иконки:** `src/components/TabBarIcons.tsx`
- **Логотип:** `src/components/Logo.tsx`
- **Цвета:** `src/constants/theme.ts`

## База данных

**Таблица:** cosme_products
**Поля:**
- `id` - ID продукта
- `name_jp` - Название на японском
- `ingredients_raw` - Ингредиенты на японском
- `ingredients_raw_en` - Ингредиенты на английском (переводится)

**Статус перевода:** ~400/1576 переведено (продолжается)

## Дизайн система

**Основные цвета:**
- Primary: #2e2e2e (темно-серый)
- White: #ffffff
- Gray2-4: оттенки серого для UI

**Floating кнопка Scanner:**
- Размер: 60dp
- Позиция: центр таб-бара, поднята на golden ratio
- Ripple: белый на Android

## Платформа-специфичные детали

**Android:**
- Edge-to-edge режим
- Прозрачная навигационная панель
- TouchableNativeFeedback.Ripple для всех кнопок

**iOS:**
- TouchableOpacity с activeOpacity=0.7/0.8

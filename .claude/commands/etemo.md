Загружаю контекст проекта ETEMO...

## Путь к проекту
C:\Users\user\Desktop\oleigh-barcode-checker\etemo

## Проверка dev server

ВАЖНО: Сначала проверь запущен ли Expo Dev Server:
```bash
netstat -ano | findstr "8081"
```

Если dev server запущен (порт 8081 занят):
- ✅ Приложение УЖЕ работает на телефоне пользователя
- ✅ НЕ запускай `npm start` заново
- ✅ НЕ собирай APK
- ✅ Только редактируй код при необходимости

Если dev server НЕ запущен:
- Спроси пользователя нужно ли запустить dev server

## Структура проекта

Это React Native (Expo) приложение для сканирования косметики.

**Главные файлы:**
- `src/navigation/MainNavigator.tsx` - навигация
- `src/components/CustomTabBar.tsx` - таб-бар с floating кнопкой Scanner
- `src/components/TabBarIcons.tsx` - иконки (YouTube-стиль, filled/outline)
- `src/components/Logo.tsx` - логотип ETEMO (viewBox: 100 155 175 55)
- `src/constants/theme.ts` - цвета

**Экраны:**
- Feed, Favorites, Scanner, ReviewWrite, Profile
- ProductResult, Login, Questionnaire, Search

**Технологии:**
- React Native + Expo
- @react-navigation/native
- react-native-svg
- expo-haptics
- Android: TouchableNativeFeedback.Ripple

**Backend проект:**
- `C:\Users\user\Desktop\oleigh-barcode-checker\oleigh-barcode-checker\translate-cosme-ingredients.mjs`
- Переводит японские ингредиенты → английские (cosme_products таблица)

## Последние изменения

1. Логотип обновлен (viewBox cropped)
2. Иконки обновлены на YouTube-стиль
3. Добавлены Android Ripple эффекты
4. Переводчик работает в непрерывном режиме

Прочитай основные файлы если нужно понять текущее состояние кода.

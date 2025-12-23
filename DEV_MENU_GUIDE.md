# Dev Menu - Меню разработчика

## Как открыть Dev Menu встряхиванием

### Вариант 1: Expo Go (проще, но ограничено)

```bash
npm start
```

Затем:
- Отсканируйте QR-код в приложении Expo Go
- **Встряхните устройство** → откроется Dev Menu
- Выберите нужную опцию (Reload, Debug, etc.)

**Ограничения Expo Go:**
- Не работают кастомные нативные модули
- OAuth может не работать
- Некоторые плагины недоступны

### Вариант 2: Development Build (рекомендуется)

Нужно собрать development build один раз:

#### Android

```bash
# Соберите development build для Android
npx expo run:android

# Или через EAS Build
eas build --profile development --platform android
```

#### iOS

```bash
# Соберите development build для iOS
npx expo run:ios

# Или через EAS Build
eas build --profile development --platform ios
```

После сборки:
1. Установите APK/IPA на устройство
2. Запустите приложение
3. **Встряхните устройство** → откроется Dev Menu

### Что есть в Dev Menu?

- **Reload** - перезагрузка приложения
- **Go Home** - возврат на главный экран
- **Settings** - настройки разработки
- **Toggle Performance Monitor** - показать FPS
- **Toggle Element Inspector** - инспектор элементов
- **Debug Remote JS** - отладка через Chrome DevTools
- **Fast Refresh** - автообновление при сохранении

## Development Build vs Production Build

### Development Build
- **Встряхивание** → Dev Menu
- Fast Refresh включен
- Source maps включены
- Отладка доступна
- Больший размер приложения

### Production Build
- **Встряхивание** → Проверка обновлений (кастомная функция)
- Оптимизировано и минифицировано
- Source maps отключены
- Отладка недоступна
- Меньший размер

## Как собрать Production Build

```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

## Альтернативные способы открыть Dev Menu

Если встряхивание не работает:

### Android
- Нажмите кнопку меню (если есть)
- Используйте `adb shell input keyevent 82`
- Ctrl+M в эмуляторе

### iOS
- Cmd+D в симуляторе
- Cmd+Ctrl+Z на устройстве (через USB)

## Troubleshooting

### Dev Menu не открывается при встряхивании

1. **Проверьте режим сборки:**
   ```bash
   # Убедитесь что запущен dev server
   npm start
   ```

2. **Используете development build?**
   - Expo Go: должно работать из коробки
   - Custom build: нужен development build, не production

3. **Проверьте expo-dev-client:**
   ```bash
   npm list expo-dev-client
   # Должно быть установлено
   ```

4. **Пересоберите приложение:**
   ```bash
   # Очистите и пересоберите
   cd android && ./gradlew clean
   cd ..
   npx expo run:android
   ```

### Белый экран при запуске

- Теперь не будет! Добавлен ErrorBoundary
- Если всё равно есть - проверьте логи:
  ```bash
  # Android
  adb logcat | grep ReactNative

  # iOS
  npx react-native log-ios
  ```

## Полезные команды

```bash
# Запустить с очисткой кэша
npm start -- --clear

# Запустить на конкретном устройстве (Android)
npx expo run:android --device

# Посмотреть логи
npx expo start --dev-client
```

## Настройка EAS для Development Builds

Добавьте в `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "developmentClient": false
    }
  }
}
```

## Заключение

**В режиме разработки:**
- Встряхивание → **Dev Menu** (стандартное)
- Моя кастомная функция **отключена**

**В production:**
- Встряхивание → **Проверка обновлений** (кастомная)
- Dev Menu **недоступно**

Лучше всего для разработки использовать **Development Build**, а не Expo Go!

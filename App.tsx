import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as Updates from 'expo-updates';
import { Accelerometer } from 'expo-sensors';

import MainNavigator from './src/navigation/MainNavigator';
import { COLORS } from './src/constants/theme';

// ErrorBoundary для отловки ошибок
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Что-то пошло не так</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || 'Произошла ошибка'}
          </Text>
          <Text style={styles.errorHint}>
            Встряхните устройство для перезагрузки
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Инициализация приложения
    async function prepare() {
      try {
        // Здесь можно добавить предзагрузку данных, шрифтов и т.д.
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.error('Error during app initialization:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
        setIsReady(true); // Все равно показываем приложение
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Shake to reload - детектор встряхивания
    let subscription: any;
    let lastUpdate = 0;
    const SHAKE_THRESHOLD = 2.5; // Порог чувствительности
    const UPDATE_INTERVAL = 100; // Минимальный интервал между проверками

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);

    const handleShake = ({ x, y, z }: { x: number; y: number; z: number }) => {
      const now = Date.now();

      if (now - lastUpdate < UPDATE_INTERVAL) {
        return;
      }

      lastUpdate = now;

      const acceleration = Math.sqrt(x * x + y * y + z * z);

      if (acceleration > SHAKE_THRESHOLD) {
        handleReload();
      }
    };

    const handleReload = async () => {
      try {
        if (__DEV__) {
          // В режиме разработки - просто обновляем
          Alert.alert(
            'Обновление',
            'Перезагрузка приложения...',
            [],
            { cancelable: false }
          );

          setTimeout(() => {
            Updates.reloadAsync();
          }, 500);
        } else {
          // В продакшене - проверяем обновления
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            Alert.alert(
              'Обновление',
              'Найдено новое обновление. Загрузить?',
              [
                {
                  text: 'Отмена',
                  style: 'cancel',
                },
                {
                  text: 'Обновить',
                  onPress: async () => {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  },
                },
              ]
            );
          } else {
            Updates.reloadAsync();
          }
        }
      } catch (e) {
        console.error('Error reloading app:', e);
        Alert.alert('Ошибка', 'Не удалось перезагрузить приложение');
      }
    };

    subscription = Accelerometer.addListener(handleShake);

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('App initialization error:', error);
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <SystemBars style="dark" />
        <MainNavigator />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray4,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.gray4,
    fontStyle: 'italic',
  },
});

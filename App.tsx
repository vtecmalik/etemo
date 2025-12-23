import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import * as Updates from 'expo-updates';
import { Accelerometer } from 'expo-sensors';

import MainNavigator from './src/navigation/MainNavigator';

// Inline styles для ErrorBoundary (чтобы не зависели от порядка объявления)
const errorStyles = {
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F5F5F8',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#131518',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6f6f6f',
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  errorHint: {
    fontSize: 14,
    color: '#6f6f6f',
    fontStyle: 'italic' as const,
  },
};

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
    console.error('ErrorBoundary getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.errorContainer}>
          <Text style={errorStyles.errorTitle}>Что-то пошло не так</Text>
          <Text style={errorStyles.errorText}>
            {this.state.error?.message || 'Произошла ошибка'}
          </Text>
          <Text style={errorStyles.errorHint}>
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
        console.log('App: Starting initialization...');

        // Даем время на загрузку
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('App: Initialization complete');
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
    // Shake to reload - только в PRODUCTION режиме
    // В DEV режиме встряхивание открывает стандартное Dev Menu
    if (__DEV__) {
      console.log('Dev mode: shake to open Dev Menu');
      return; // Не перехватываем встряхивание в dev режиме
    }

    // Shake to reload - детектор встряхивания (только для production)
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

  // Loading screen
  if (!isReady) {
    console.log('App: Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#131518" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    console.warn('App initialization error:', error);
  }

  console.log('App: Rendering main app');

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
    backgroundColor: '#F5F5F8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#131518',
  },
});

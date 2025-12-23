import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING } from '../constants/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { AnimatedButton } from '../components/TouchableScale';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Scanner'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_WIDTH = SCREEN_WIDTH * 0.75;
const SCANNER_HEIGHT = SCANNER_WIDTH * 0.5;

export default function ScannerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  const lastScannedRef = useRef<string>('');

  // Сброс при возврате на экран
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setError('');
      lastScannedRef.current = '';
    }
  }, [isFocused]);

  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    // Предотвращаем повторные сканирования того же кода
    if (scanned || data === lastScannedRef.current) return;

    // Проверяем формат EAN-13
    if (data.length !== 13 || !/^\d+$/.test(data)) {
      return; // Тихо игнорируем неподходящие коды
    }

    lastScannedRef.current = data;
    setScanned(true);

    // Мощная тактильная обратная связь при успешном скане
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // ОПТИМИСТИЧНЫЙ UI: мгновенный переход
    navigation.navigate('ProductResult', {
      barcode: data,
      product: undefined,
    });
  }, [scanned, navigation]);

  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanned(false);
    setError('');
    lastScannedRef.current = '';
  }, []);

  // Запрос разрешений
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emoji}>📷</Text>
        <Text style={styles.title}>Нужен доступ к камере</Text>
        <Text style={styles.description}>
          Для сканирования штрих-кодов разрешите доступ к камере
        </Text>
        <AnimatedButton
          title="Разрешить доступ"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={styles.overlaySection} />

        {/* Middle with scanner frame */}
        <View style={styles.middleSection}>
          <View style={styles.sideOverlay} />

          {/* Scanner frame */}
          <View style={styles.scannerFrame}>
            {/* Corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Scan line (static) */}
            <View style={styles.scanLine} />
          </View>

          <View style={styles.sideOverlay} />
        </View>

        {/* Bottom overlay with instructions */}
        <View style={[styles.overlaySection, styles.bottomOverlay]}>
          <View style={styles.instructionsContainer}>
            {error ? (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <AnimatedButton
                  title="Попробовать снова"
                  onPress={handleRetry}
                  variant="outline"
                  style={styles.retryButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.instructionTitle}>
                  Наведите на штрих-код
                </Text>
                <Text style={styles.instructionSubtitle}>
                  EAN-13 (начинается с 880)
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  permissionButton: {
    paddingHorizontal: SPACING.xxxl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  middleSection: {
    flexDirection: 'row',
    height: SCANNER_HEIGHT,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  scannerFrame: {
    width: SCANNER_WIDTH,
    height: SCANNER_HEIGHT,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: SCANNER_HEIGHT / 2,
    height: 2,
    backgroundColor: COLORS.red,
    borderRadius: 1,
  },
  bottomOverlay: {
    flex: 1.5,
    justifyContent: 'flex-start',
    paddingTop: SPACING.xxxl,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  instructionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  instructionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.red,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    borderColor: COLORS.white,
  },
});

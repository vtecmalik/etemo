import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { TouchableScale, AnimatedButton } from '../components/TouchableScale';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = useCallback(() => {
    if (barcode.length !== 13) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Штрих-код должен содержать 13 цифр');
      return;
    }

    // Мгновенный тактильный отклик
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // МГНОВЕННЫЙ переход - данные загрузятся на следующем экране
    navigation.navigate('ProductResult', { barcode });
  }, [barcode, navigation]);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBarcode('');
    setError('');
    inputRef.current?.focus();
  }, []);

  const handleChangeText = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setBarcode(cleaned);
    if (error) setError('');

    if (cleaned.length === 13) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [error]);

  const isValidLength = barcode.length === 0 || barcode.length === 13;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Etemo</Text>
          <Text style={styles.subtitle}>Проверка корейской косметики</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Введите штрих-код</Text>
          <Text style={styles.hint}>13 цифр с упаковки (880...)</Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, !isValidLength && styles.inputError]}
              value={barcode}
              onChangeText={handleChangeText}
              placeholder="8809432018285"
              placeholderTextColor={COLORS.gray4}
              keyboardType="number-pad"
              maxLength={13}
            />
            {barcode.length > 0 && (
              <TouchableScale style={styles.clearButton} onPress={handleClear} activeScale={0.9}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableScale>
            )}
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(barcode.length / 13) * 100}%` }]} />
          </View>
          <Text style={styles.charCount}>{barcode.length}/13</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AnimatedButton
            title="Проверить"
            onPress={handleSearch}
            disabled={barcode.length !== 13}
          />
        </View>

        <TouchableScale
          style={styles.scanHint}
          onPress={() => navigation.getParent()?.navigate('Scanner')}
        >
          <Text style={styles.scanHintEmoji}>📷</Text>
          <View>
            <Text style={styles.scanHintTitle}>Или отсканируйте камерой</Text>
            <Text style={styles.scanHintText}>Вкладка "Сканер"</Text>
          </View>
        </TouchableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  logoContainer: { alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.xxxl },
  logoText: { fontSize: 42, fontWeight: '700', color: COLORS.primary, letterSpacing: -1.5 },
  subtitle: { fontSize: 14, color: COLORS.gray4, marginTop: SPACING.xs },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.xs },
  hint: { fontSize: 13, color: COLORS.gray4, marginBottom: SPACING.lg },
  inputContainer: { position: 'relative', marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.lightGray0,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.greyLight,
    letterSpacing: 1,
  },
  inputError: { borderColor: COLORS.red },
  clearButton: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -14 }],
    padding: SPACING.sm,
    backgroundColor: COLORS.greyLight,
    borderRadius: BORDER_RADIUS.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: { fontSize: 14, color: COLORS.gray4, fontWeight: '600' },
  progressContainer: {
    height: 3,
    backgroundColor: COLORS.greyLight,
    borderRadius: 2,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  charCount: { fontSize: 12, color: COLORS.gray4, textAlign: 'right', marginBottom: SPACING.lg },
  errorContainer: {
    backgroundColor: COLORS.redHighlight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: { color: COLORS.red, fontSize: 14, textAlign: 'center', fontWeight: '500' },
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  scanHintEmoji: { fontSize: 32 },
  scanHintTitle: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  scanHintText: { fontSize: 12, color: COLORS.gray4, marginTop: 2 },
});

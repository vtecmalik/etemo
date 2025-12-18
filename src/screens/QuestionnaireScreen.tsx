import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase, authService } from '../services/supabase';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = {
  step: 'gender' | 'age' | 'skin_type' | 'skin_tone' | 'pregnancy';
};

const QUESTIONS = {
  gender: {
    title: 'Ваш пол',
    options: [
      { label: 'Женский', value: 'female' },
      { label: 'Мужской', value: 'male' },
      { label: 'Другой', value: 'other' },
    ],
    next: 'age',
  },
  age: {
    title: 'Ваш возраст',
    options: [
      { label: 'До 18', value: 'under_18' },
      { label: '18-24', value: '18_24' },
      { label: '25-34', value: '25_34' },
      { label: '35-44', value: '35_44' },
      { label: '45-54', value: '45_54' },
      { label: '55+', value: '55_plus' },
    ],
    next: 'skin_type',
  },
  skin_type: {
    title: 'Ваш тип кожи',
    options: [
      { label: 'Нормальная', value: 'normal' },
      { label: 'Сухая', value: 'dry' },
      { label: 'Жирная', value: 'oily' },
      { label: 'Комбинированная', value: 'combination' },
      { label: 'Чувствительная', value: 'sensitive' },
    ],
    next: 'skin_tone',
  },
  skin_tone: {
    title: 'Ваш тон кожи без загара',
    options: [
      { label: 'Очень светлый', value: 'very_light' },
      { label: 'Светлый', value: 'light' },
      { label: 'Средний', value: 'medium' },
      { label: 'Смуглый', value: 'tan' },
      { label: 'Темный', value: 'dark' },
    ],
    next: 'pregnancy',
  },
  pregnancy: {
    title: 'Вы беременны или планируете в ближайшее время?',
    options: [
      { label: 'Да', value: 'yes' },
      { label: 'Нет', value: 'no' },
      { label: 'Не хочу отвечать', value: 'prefer_not_to_say' },
    ],
    next: null,
  },
};

export default function QuestionnaireScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { step } = (route.params as RouteParams) || { step: 'gender' };

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[step];
  const stepIndex = Object.keys(QUESTIONS).indexOf(step);
  const totalSteps = Object.keys(QUESTIONS).length;

  const handleSelect = async (value: string) => {
    const newAnswers = { ...answers, [step]: value };
    setAnswers(newAnswers);

    if (question.next) {
      // Move to next step
      navigation.navigate('Questionnaire', { step: question.next as any });
    } else {
      // Last step - save and go to profile
      await saveAnswers(newAnswers);
    }
  };

  const handleSkip = () => {
    if (question.next) {
      navigation.navigate('Questionnaire', { step: question.next as any });
    } else {
      // Last step - just go to main tabs
      navigation.navigate('MainTabs' as any);
    }
  };

  const saveAnswers = async (finalAnswers: Record<string, string>) => {
    try {
      setSaving(true);

      const user = await authService.getCurrentUser();
      if (!user) {
        navigation.navigate('MainTabs' as any);
        return;
      }

      // Save to cosme_users table
      const { error } = await supabase
        .from('cosme_users')
        .upsert({
          id: user.id,
          email: user.email,
          gender: finalAnswers.gender,
          age_range: finalAnswers.age,
          skin_type: finalAnswers.skin_type,
          skin_tone: finalAnswers.skin_tone,
          is_pregnant: finalAnswers.pregnancy === 'yes',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Navigate to main tabs
      navigation.navigate('MainTabs' as any);
    } catch (error) {
      console.error('Error saving questionnaire:', error);
      navigation.navigate('MainTabs' as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {Object.keys(QUESTIONS).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= stepIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepText}>
          Шаг {stepIndex + 1} из {totalSteps}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{question.title}</Text>

        <View style={styles.optionsGrid}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                answers[step] === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelect(option.value)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  answers[step] === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={saving}
        >
          <Text style={styles.skipButtonText}>Пропустить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.greyLight,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xxxl,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  optionButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.gray4,
    textDecorationLine: 'underline',
  },
});

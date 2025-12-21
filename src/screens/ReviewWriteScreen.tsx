import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ReviewWriteScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Написать отзыв</Text>
        <Text style={styles.subtitle}>
          Эта страница находится в разработке
        </Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>✍️</Text>
          <Text style={styles.placeholderText}>
            Здесь будет форма для написания отзывов о продуктах
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray4,
    marginBottom: SPACING.xl,
  },
  placeholder: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray4,
    textAlign: 'center',
    lineHeight: 20,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface IngredientsRingIndicatorProps {
  safe: number;
  medium: number;
  high: number;
  unknown: number;
  size: number;
  expanded?: boolean;
}

export function IngredientsRingIndicator({
  safe,
  medium,
  high,
  unknown,
  size,
  expanded = false
}: IngredientsRingIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const total = safe + medium + high + unknown;

  // Если нет данных - не показываем кольцо
  if (total === 0) {
    return null;
  }

  // Анимация масштаба при расширении
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: expanded ? 1.08 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  }, [expanded, scaleAnim]);

  // Ширина кольца и отступ
  const baseStrokeWidth = 10; // Тонкое по умолчанию
  const expandedStrokeWidth = 18; // Толстое при тапе
  const strokeWidth = expanded ? expandedStrokeWidth : baseStrokeWidth;

  // При расширении - отходит наружу
  const baseRadius = (size / 2) - (baseStrokeWidth / 2);
  const expandedRadius = (size / 2) + 8; // Наружу на 8px
  const radius = expanded ? expandedRadius : baseRadius;
  const circumference = 2 * Math.PI * radius;

  // Промежуток между сегментами
  const gap = 4;

  // Массив сегментов - ЗЕЛЕНЫЙ ПЕРВЫМ (с 12 часов)
  const segments: { color: string; count: number; percent: number; label: string }[] = [];

  if (safe > 0) {
    segments.push({ color: COLORS.riskSafe, count: safe, percent: safe / total, label: 'Безоп.' });
  }
  if (medium > 0) {
    segments.push({ color: COLORS.riskMedium, count: medium, percent: medium / total, label: 'Средн.' });
  }
  if (high > 0) {
    segments.push({ color: COLORS.riskHigh, count: high, percent: high / total, label: 'Высок.' });
  }
  if (unknown > 0) {
    segments.push({ color: COLORS.riskUnknown, count: unknown, percent: unknown / total, label: 'Неопр.' });
  }

  // Вычисляем offset для каждого сегмента
  let currentOffset = 0;

  return (
    <Animated.View style={{
      position: 'absolute',
      width: size,
      height: size,
      transform: [{ scale: scaleAnim }],
      pointerEvents: 'none',
      zIndex: 10
    }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {segments.map((segment, index) => {
            const segmentLength = segment.percent * circumference;
            const offset = currentOffset;
            currentOffset += segmentLength;

            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${segmentLength - gap} ${circumference - segmentLength + gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

      {/* Числа снаружи при раскрытии - по диагонали */}
      {expanded && segments.map((segment, index) => {
        // Позиции по диагонали: 4:30 (135°) и 10:30 (315°)
        const positions = [
          { angle: 135, offsetY: -30 * index }, // Правый верх
          { angle: 135, offsetY: -30 * (index - 1) },
          { angle: 315, offsetY: -30 * (index - 2) }, // Левый низ
          { angle: 315, offsetY: -30 * (index - 3) }
        ];

        const pos = positions[index] || positions[0];
        const angleRad = (pos.angle * Math.PI) / 180;
        const labelRadius = radius + strokeWidth + 25; // Снаружи

        const labelX = (size / 2) + (labelRadius * Math.cos(angleRad));
        const labelY = (size / 2) + (labelRadius * Math.sin(angleRad)) + pos.offsetY;

        return (
          <View
            key={`label-${index}`}
            style={[
              styles.label,
              {
                left: labelX - 24,
                top: labelY - 16,
              }
            ]}
          >
            <Text style={[styles.labelCount, { color: segment.color }]}>
              {segment.count}
            </Text>
            <Text style={styles.labelText}>{segment.label}</Text>
          </View>
        );
      })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 9,
    color: COLORS.gray4,
    fontWeight: '500',
  },
});

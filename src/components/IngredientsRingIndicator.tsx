import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface IngredientsRingIndicatorProps {
  safe: number;
  medium: number;
  high: number;
  unknown: number;
  size: number;
  onPress?: () => void;
}

export function IngredientsRingIndicator({
  safe,
  medium,
  high,
  unknown,
  size,
  onPress
}: IngredientsRingIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const total = safe + medium + high + unknown;

  // Если нет данных - не показываем кольцо
  if (total === 0) {
    return null;
  }

  // Процентное соотношение
  const safePercent = safe / total;
  const mediumPercent = medium / total;
  const highPercent = high / total;
  const unknownPercent = unknown / total;

  // Ширина кольца
  const strokeWidth = expanded ? 12 : 8;
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;

  // Функция для создания дуги
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(size / 2, size / 2, radius, endAngle);
    const end = polarToCartesian(size / 2, size / 2, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Рассчитываем углы для каждого сегмента
  let currentAngle = 0;
  const segments: { color: string; startAngle: number; endAngle: number; count: number; label: string }[] = [];

  if (unknown > 0) {
    const angle = unknownPercent * 360;
    segments.push({
      color: COLORS.riskUnknown,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      count: unknown,
      label: 'Неопр.'
    });
    currentAngle += angle;
  }

  if (safe > 0) {
    const angle = safePercent * 360;
    segments.push({
      color: COLORS.riskSafe,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      count: safe,
      label: 'Безоп.'
    });
    currentAngle += angle;
  }

  if (medium > 0) {
    const angle = mediumPercent * 360;
    segments.push({
      color: COLORS.riskMedium,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      count: medium,
      label: 'Средн.'
    });
    currentAngle += angle;
  }

  if (high > 0) {
    const angle = highPercent * 360;
    segments.push({
      color: COLORS.riskHigh,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      count: high,
      label: 'Высок.'
    });
  }

  const handlePress = () => {
    setExpanded(!expanded);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={{ position: 'absolute', width: size, height: size }}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={describeArc(segment.startAngle, segment.endAngle)}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>

      {/* Числа около сегментов при раскрытии */}
      {expanded && segments.map((segment, index) => {
        const midAngle = (segment.startAngle + segment.endAngle) / 2;
        const labelRadius = radius + strokeWidth + 20;
        const labelPos = polarToCartesian(size / 2, size / 2, labelRadius, midAngle);

        return (
          <View
            key={`label-${index}`}
            style={[
              styles.label,
              {
                left: labelPos.x - 24,
                top: labelPos.y - 16,
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
    </Pressable>
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

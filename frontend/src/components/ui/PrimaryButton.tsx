import React, { useRef } from 'react';
import {
  TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Radius, Shadow } from '../../constants/layout';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<Props> = ({
  label, onPress, loading, disabled, variant = 'primary', icon, fullWidth = true, size = 'lg',
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();

  const heights: Record<string, number> = { sm: 40, md: 48, lg: 56 };
  const h = heights[size];
  const fs = size === 'sm' ? FontSize.sm : size === 'md' ? FontSize.base : FontSize.md;

  const inner = loading
    ? <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
    : (
      <>
        {icon && <View style={styles.iconGap}>{icon}</View>}
        <Text style={[styles.label, { fontSize: fs },
          variant === 'outline' && styles.labelOutline,
          variant === 'ghost'   && styles.labelGhost,
          variant === 'danger'  && styles.labelDanger,
          isDisabled && variant === 'primary' && styles.labelDisabled,
        ]}>
          {label}
        </Text>
      </>
    );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={isDisabled} style={fullWidth ? { width: '100%' } : undefined}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient
            colors={isDisabled ? ['#C8D6E0', '#B8C8D5'] : ['#00C896', '#00A87E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.gradient, { height: h }, !isDisabled && Shadow.primary]}
          >
            {inner}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={isDisabled} style={fullWidth ? { width: '100%' } : undefined}
      >
        <Animated.View style={[styles.outlineBox, { height: h, borderColor: Colors.error, transform: [{ scale }] }]}>
          {inner}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        disabled={isDisabled} style={fullWidth ? { width: '100%' } : undefined}
      >
        <Animated.View style={[styles.outlineBox, { height: h, transform: [{ scale }] }, isDisabled && styles.disabledOutline]}>
          {inner}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled}>
      <Text style={[styles.labelGhost, { fontSize: fs }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineBox: {
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 8,
  },
  label: {
    fontWeight: FontWeight.semiBold,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  labelOutline: { color: Colors.primary },
  labelGhost:   { color: Colors.primary, fontWeight: FontWeight.medium },
  labelDanger:  { color: Colors.error },
  labelDisabled: { color: 'rgba(255,255,255,0.7)' },
  disabledOutline: { opacity: 0.5 },
  iconGap: {},
});

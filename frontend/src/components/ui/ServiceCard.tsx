import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/layout';

const CARD_W = (Dimensions.get('window').width - Spacing.base * 2 - Spacing.sm) / 2;

interface Props {
  service: Service;
  onPress: () => void;
}

export const ServiceCard: React.FC<Props> = ({ service, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => Animated.parallel([
    Animated.spring(scale,  { toValue: 0.95, useNativeDriver: true, speed: 25, bounciness: 4 }),
    Animated.timing(bgAnim, { toValue: 1,    useNativeDriver: false, duration: 100 }),
  ]).start();

  const onPressOut = () => Animated.parallel([
    Animated.spring(scale,  { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 4 }),
    Animated.timing(bgAnim, { toValue: 0, useNativeDriver: false, duration: 150 }),
  ]).start();

  const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.surface, Colors.primaryLight] });
  const fmtPrice = (p: number) => `${(p / 1000).toFixed(0)} 000 so'm`;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.View style={[styles.card, { backgroundColor: bgColor }]}>
        {service.popular && (
          <View style={styles.badge}>
            <Ionicons name="flame" size={10} color={Colors.primary} />
            <Text style={styles.badgeText}>Top</Text>
          </View>
        )}
        <View style={[styles.iconWrap, { backgroundColor: service.iconBg }]}>
          <Ionicons name={service.icon as any} size={28} color={service.iconColor} />
        </View>
        <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
        {service.duration && (
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.duration}>{service.duration}</Text>
          </View>
        )}
        <Text style={styles.price}>{fmtPrice(service.price)}</Text>
        <View style={styles.footer}>
          <Text style={styles.fromLabel}>dan boshlab</Text>
          <View style={styles.arrowBtn}>
            <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
          </View>
        </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  badge: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full,
  },
  badgeText: { fontSize: 10, fontWeight: FontWeight.semiBold, color: Colors.primary },
  iconWrap: {
    width: 56, height: 56, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.base, fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary, marginBottom: 4, lineHeight: 21,
  },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  duration: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  footer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: Spacing.xs,
  },
  fromLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  arrowBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
});

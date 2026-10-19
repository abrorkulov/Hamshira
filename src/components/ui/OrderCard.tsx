import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/layout';
import { StatusBadge } from './StatusBadge';

interface Props {
  order: Order;
  onPress: () => void;
}

export const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 25 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 25 }).start();

  const fmtPrice = (p: number) => `${p.toLocaleString('uz-UZ')} so'm`;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {/* Left accent */}
        <View style={[styles.accent, { backgroundColor: order.service.iconColor }]} />

        <View style={styles.body}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: order.service.iconBg }]}>
              <Ionicons name={order.service.icon as any} size={20} color={order.service.iconColor} />
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.serviceName}>{order.service.name}</Text>
              <StatusBadge status={order.status} />
            </View>
            <Text style={styles.price}>{fmtPrice(order.price)}</Text>
          </View>

          <View style={styles.sep} />

          {/* Footer row */}
          <View style={styles.footerRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{order.date}</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{order.time}</Text>
            </View>
            {order.doctor && (
              <>
                <View style={styles.dot} />
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {order.doctor.name.split(' ')[0]}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: Spacing.base },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  titleCol: { flex: 1, gap: 5 },
  serviceName: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  price: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, flexShrink: 0 },
  sep: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
});

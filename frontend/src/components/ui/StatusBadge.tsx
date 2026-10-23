import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Radius, Spacing } from '../../constants/layout';

interface Props { status: OrderStatus; }

const CFG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  kutilmoqda:    { label: "Kutilmoqda",    color: Colors.warning, bg: Colors.warningBg },
  tasdiqlangan:  { label: "Tasdiqlangan",  color: Colors.info,    bg: Colors.infoBg    },
  bajarilmoqda:  { label: "Jarayonda",     color: Colors.primary, bg: Colors.primaryLight },
  bajarildi:     { label: "Bajarildi",     color: '#059669',      bg: '#D1FAE5'        },
  bekor_qilindi: { label: "Bekor qilindi", color: Colors.error,   bg: Colors.errorBg   },
};

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const c = CFG[status];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.color }]} />
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 4,
    borderRadius: Radius.full, alignSelf: 'flex-start',
  },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold },
});

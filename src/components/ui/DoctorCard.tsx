import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Doctor } from '../../types';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/layout';

interface Props {
  doctor: Doctor;
  onPress: () => void;
  compact?: boolean;
}

export const DoctorCard: React.FC<Props> = ({ doctor, onPress, compact }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 25 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 25 }).start();

  const fmtPrice = (p: number) => `${(p / 1000).toFixed(0)} 000 so'm`;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, compact && styles.compact, { transform: [{ scale }] }]}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: doctor.image }} style={styles.avatar} />
          <View style={[styles.onlineDot, { backgroundColor: doctor.available ? Colors.success : Colors.border }]} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          <View style={styles.meta}>
            <View style={styles.chip}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.chipText}>{doctor.rating}</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="briefcase-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.chipText}>{doctor.experience} yil</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="chatbubble-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.chipText}>{doctor.reviewCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.price}>{fmtPrice(doctor.price)}</Text>
          <Text style={styles.perVisit}>tashrif</Text>
          <TouchableOpacity
            style={[styles.bookBtn, !doctor.available && styles.bookBtnOff]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={14} color={doctor.available ? Colors.white : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  compact: { padding: Spacing.md },
  avatarWrap: { position: 'relative', marginRight: Spacing.md },
  avatar: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.border,
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 13, height: 13, borderRadius: 7,
    borderWidth: 2, borderColor: Colors.white,
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: 2 },
  specialty: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  meta: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.background,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.xs,
  },
  chipText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  right: { alignItems: 'flex-end', gap: 2 },
  price: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  perVisit: { fontSize: 10, color: Colors.textMuted },
  bookBtn: {
    marginTop: 6, width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },
  bookBtnOff: { backgroundColor: Colors.border, shadowOpacity: 0 },
});

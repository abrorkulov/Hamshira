import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/typography';
import { Spacing } from '../../constants/layout';

interface Props {
  title: string;
  onSeeAll?: () => void;
  subtitle?: string;
}

export const SectionHeader: React.FC<Props> = ({ title, onSeeAll, subtitle }) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
    {onSeeAll && (
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.seeAllBtn}
      >
        <Text style={styles.seeAll}>Barchasi</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primary },
});

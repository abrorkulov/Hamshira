import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, OrderStatus } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Spacing } from '../constants/layout';
import { useAppStore } from '../store';
import { OrderCard } from '../components/ui/OrderCard';

type Nav = StackNavigationProp<RootStackParamList>;
type Tab = 'barchasi' | 'faol' | 'tugallangan';

const ACTIVE_STATUSES: OrderStatus[] = ['kutilmoqda', 'tasdiqlangan', 'bajarilmoqda'];
const DONE_STATUSES:   OrderStatus[] = ['bajarildi', 'bekor_qilindi'];

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const orders     = useAppStore((s) => s.orders);
  const [tab, setTab] = useState<Tab>('barchasi');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start(), []);

  const filtered = orders.filter((o) =>
    tab === 'faol'        ? ACTIVE_STATUSES.includes(o.status) :
    tab === 'tugallangan' ? DONE_STATUSES.includes(o.status)   : true
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'barchasi',    label: 'Barchasi' },
    { id: 'faol',        label: `Faol (${orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length})` },
    { id: 'tugallangan', label: 'Tugallangan' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Buyurtmalarim</Text>
        <Text style={styles.sub}>{orders.length} ta buyurtma</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id} onPress={() => setTab(t.id)} activeOpacity={0.8}
            style={[styles.tabItem, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[{ flex: 1 }, { opacity: fade }]}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Buyurtma yo'q</Text>
            <Text style={styles.emptySub}>Bu bo'limda hali hech narsa yo'q</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={() => navigation.navigate('OrderDetail', { order: item })}
              />
            )}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.base, paddingTop: Spacing.base, marginBottom: Spacing.base,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sub:   { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  tabBar: {
    flexDirection: 'row', paddingHorizontal: Spacing.base,
    gap: Spacing.xs, marginBottom: Spacing.base,
    backgroundColor: Colors.background,
  },
  tabItem: {
    flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabLabel:  { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabLabelActive: { color: Colors.white, fontWeight: FontWeight.semiBold },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semiBold, color: Colors.textSecondary },
  emptySub:   { fontSize: FontSize.sm, color: Colors.textMuted },
});

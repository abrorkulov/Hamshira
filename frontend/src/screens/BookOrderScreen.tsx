import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Service } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';
import { useAppStore } from '../store';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Nav = StackNavigationProp<RootStackParamList, 'BookOrder'>;
type RouteP = RouteProp<RootStackParamList, 'BookOrder'>;

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DATE_OPTS = Array.from({ length: 4 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return { id: ['today', 'tomorrow', 'd2', 'd3'][i], label: ['Bugun', 'Ertaga', 'Indinga', '3 kundan so‘ng'][i], sub: date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) };
});

export const BookOrderScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<RouteP>();
  const { createOrderRequest, user, services } = useAppStore();

  const [selService, setSelService] = useState<Service | null>(route.params?.service ?? null);
  const [selDate,    setSelDate]    = useState<string>('today');
  const [selTime,    setSelTime]    = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  const fade  = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 14 }),
    ]).start();
  }, []);

  const isValid = !!(selService && selDate && selTime);
  const fmtPrice = (p: number) => `${p.toLocaleString('uz-UZ')} so'm`;

  const handleBook = async () => {
    if (!isValid || !selService || !selTime) return;
    setLoading(true);
    try {
      const dateLabel = DATE_OPTS.find((d) => d.id === selDate)?.label ?? 'Bugun';
      const defaultAddr = user.addresses.find((a) => a.isDefault);
      const appointment = new Date();
      appointment.setDate(appointment.getDate() + Math.max(0, DATE_OPTS.findIndex((d) => d.id === selDate)));
      const [hours, minutes] = selTime.split(':').map(Number);
      appointment.setHours(hours, minutes, 0, 0);
      await createOrderRequest({
        serviceId: selService.id,
        appointmentAt: appointment.toISOString(),
        address: defaultAddr?.full ?? 'Manzil kiritilmagan',
        type: 'uyga_tashrif',
      });
      Alert.alert('Buyurtma qabul qilindi!', `${selService.name} — ${dateLabel}, soat ${selTime}`, [{
        text: "Buyurtmalarimga o'tish",
        onPress: () => (navigation as any).navigate('Main', { screen: 'OrdersTab' }),
      }]);
    } catch (error) {
      Alert.alert('Buyurtma yuborilmadi', error instanceof Error ? error.message : 'Server bilan bog‘lanib bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Buyurtma berish</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>

          {/* ── 1. Xizmat ── */}
          <Text style={styles.sLabel}>Xizmatni tanlang</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {services.map((s) => {
              const sel = selService?.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id} onPress={() => setSelService(s)} activeOpacity={0.8}
                  style={[styles.serviceChip, sel && styles.serviceChipActive]}
                >
                  <View style={[styles.schipIcon, { backgroundColor: s.iconBg }]}>
                    <Ionicons name={s.icon as any} size={18} color={s.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.schipName, sel && { color: Colors.primary }]}>{s.name}</Text>
                    <Text style={styles.schipPrice}>{(s.price / 1000).toFixed(0)} 000 so'm</Text>
                  </View>
                  {sel && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={styles.checkIcon} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── 2. Sana ── */}
          <Text style={styles.sLabel}>Sanani tanlang</Text>
          <View style={styles.datesRow}>
            {DATE_OPTS.map((d) => {
              const sel = selDate === d.id;
              return (
                <TouchableOpacity
                  key={d.id} onPress={() => setSelDate(d.id)} activeOpacity={0.8}
                  style={[styles.dateChip, sel && styles.dateChipActive]}
                >
                  <Text style={[styles.dateLabel, sel && styles.dateLabelActive]}>{d.label}</Text>
                  <Text style={[styles.dateSub, sel && { color: 'rgba(255,255,255,0.7)' }]}>{d.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── 3. Vaqt ── */}
          <Text style={styles.sLabel}>Vaqtni tanlang</Text>
          <View style={styles.timesGrid}>
            {TIME_SLOTS.map((t) => {
              const sel = selTime === t;
              return (
                <TouchableOpacity
                  key={t} onPress={() => setSelTime(t)} activeOpacity={0.8}
                  style={[styles.timeChip, sel && styles.timeChipActive]}
                >
                  <Text style={[styles.timeLabel, sel && styles.timeLabelActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── 4. Manzil ── */}
          <Text style={styles.sLabel}>Manzil</Text>
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => navigation.navigate('Addresses')}
            activeOpacity={0.8}
          >
            <View style={styles.addrIcon}>
              <Ionicons name="location" size={18} color={Colors.primary} />
            </View>
            <View style={styles.addrInfo}>
              <Text style={styles.addrLabel}>
                {user.addresses.find((a) => a.isDefault)?.label ?? 'Uy'}
              </Text>
              <Text style={styles.addrFull} numberOfLines={1}>
                {user.addresses.find((a) => a.isDefault)?.full ?? 'Manzil kiritilmagan'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* ── Summary ── */}
          {selService && (
            <LinearGradient colors={[Colors.primaryLight, '#FFFFFF']} style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Xizmat</Text>
                <Text style={styles.summaryVal}>{selService.name}</Text>
              </View>
              {selDate && selTime && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Vaqt</Text>
                  <Text style={styles.summaryVal}>
                    {DATE_OPTS.find((d) => d.id === selDate)?.label}, {selTime}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Jami</Text>
                <Text style={styles.summaryTotalVal}>{fmtPrice(selService.price)}</Text>
              </View>
            </LinearGradient>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <PrimaryButton
          label={loading ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
          onPress={handleBook}
          loading={loading}
          disabled={!isValid}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  topTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  scroll:   { paddingHorizontal: Spacing.base },
  sLabel:   { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.base },

  hScroll: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  serviceChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.xs,
  },
  serviceChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  schipIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  schipName:  { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  schipPrice: { fontSize: FontSize.xs, color: Colors.textMuted },
  checkIcon: { marginLeft: 'auto' },

  datesRow: { flexDirection: 'row', gap: Spacing.xs },
  dateChip: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  dateChipActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateLabel:        { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  dateLabelActive:  { color: Colors.white },
  dateSub:          { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeChip: {
    width: '30%', alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  timeChipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeLabel:       { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  timeLabelActive: { color: Colors.white, fontWeight: FontWeight.semiBold },

  addressCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  addrIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  addrFull:  { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  summary: {
    borderRadius: Radius.xl, padding: Spacing.base, marginTop: Spacing.base,
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.primaryMuted,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryVal:   { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.primaryMuted, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  summaryTotalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  summaryTotalVal:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadow.lg,
  },
});

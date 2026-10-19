import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAppStore } from '../store';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Nav    = StackNavigationProp<RootStackParamList, 'OrderDetail'>;
type RouteP = RouteProp<RootStackParamList, 'OrderDetail'>;

export const OrderDetailScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const { params }  = useRoute<RouteP>();
  const { order }   = params;
  const cancelOrder = useAppStore((s) => s.cancelOrder);
  const insets      = useSafeAreaInsets();

  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 14 }),
    ]).start();
  }, []);

  const fmtPrice = (p: number) => `${p.toLocaleString('uz-UZ')} so'm`;
  const canCancel = order.status === 'kutilmoqda' || order.status === 'tasdiqlangan';

  const handleCancel = () => {
    Alert.alert('Bekor qilish', 'Buyurtmani bekor qilishni tasdiqlaysizmi?', [
      { text: "Yo'q", style: 'cancel' },
      { text: 'Ha', style: 'destructive', onPress: () => { cancelOrder(order.id); navigation.goBack(); } },
    ]);
  };

  const DETAILS = [
    { icon: 'calendar-outline',  label: 'Sana',    value: order.date    },
    { icon: 'time-outline',      label: 'Vaqt',    value: order.time    },
    { icon: 'location-outline',  label: 'Manzil',  value: order.address },
    ...(order.doctor ? [{ icon: 'person-outline', label: 'Hamshira', value: order.doctor.name }] : []),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Buyurtma #{order.id.slice(-4)}</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>

          {/* Service */}
          <View style={styles.serviceCard}>
            <View style={[styles.sIcon, { backgroundColor: order.service.iconBg }]}>
              <Ionicons name={order.service.icon as any} size={28} color={order.service.iconColor} />
            </View>
            <View style={styles.sInfo}>
              <Text style={styles.sName}>{order.service.name}</Text>
              <StatusBadge status={order.status} />
            </View>
            <Text style={styles.sPrice}>{fmtPrice(order.price)}</Text>
          </View>

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Buyurtma ma'lumotlari</Text>
            {DETAILS.map((d, i) => (
              <View key={i} style={[styles.detailRow, i < DETAILS.length - 1 && styles.detailBorder]}>
                <View style={styles.detailIcon}>
                  <Ionicons name={d.icon as any} size={16} color={Colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{d.label}</Text>
                  <Text style={styles.detailValue}>{d.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Payment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>To'lov</Text>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Xizmat narxi</Text>
              <Text style={styles.payVal}>{fmtPrice(order.price)}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Yetkazib berish</Text>
              <Text style={[styles.payVal, { color: Colors.success }]}>Bepul</Text>
            </View>
            <View style={[styles.payRow, styles.payTotal]}>
              <Text style={styles.payTotalLabel}>Jami</Text>
              <Text style={styles.payTotalVal}>{fmtPrice(order.price)}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {canCancel && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <PrimaryButton
            label="Buyurtmani bekor qilish"
            onPress={handleCancel}
            variant="danger"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  scroll:   { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, gap: Spacing.sm },

  serviceCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  sIcon: { width: 52, height: 52, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  sInfo: { flex: 1, gap: 5 },
  sName: { fontSize: FontSize.lg, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  sPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.md },

  detailRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingVertical: Spacing.sm },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  detailIcon:   { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  detailContent: { flex: 1 },
  detailLabel:   { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  detailValue:   { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },

  payRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  payLabel:     { fontSize: FontSize.base, color: Colors.textSecondary },
  payVal:       { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  payTotal:     { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  payTotalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  payTotalVal:   { fontSize: FontSize.xl,   fontWeight: FontWeight.bold,     color: Colors.primary },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadow.lg,
  },
});

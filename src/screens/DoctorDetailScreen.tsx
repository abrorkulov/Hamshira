import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Nav    = StackNavigationProp<RootStackParamList, 'DoctorDetail'>;
type RouteP = RouteProp<RootStackParamList, 'DoctorDetail'>;

export const DoctorDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();
  const { doctor } = params;
  const insets = useSafeAreaInsets();
  const fade   = useRef(new Animated.Value(0)).current;

  useEffect(() => Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start(), []);

  const fmtPrice = (p: number) => `${p.toLocaleString('uz-UZ')} so'm`;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <LinearGradient
        colors={[Colors.dark, Colors.darkMid]}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={Colors.white} />
        </TouchableOpacity>

        <Image source={{ uri: doctor.image }} style={styles.avatar} />
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>

        {doctor.available && (
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Hozir mavjud</Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats card floating */}
      <Animated.View style={[styles.statsCard, { opacity: fade }]}>
        {[
          { icon: 'star',              val: doctor.rating.toString(), lbl: 'Reyting', clr: '#F59E0B' },
          { icon: 'briefcase-outline', val: `${doctor.experience}`,   lbl: 'Yil',     clr: Colors.primary },
          { icon: 'chatbubble-outline',val: `${doctor.reviewCount}`,  lbl: 'Sharh',   clr: '#3B82F6' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.statDiv} />}
            <View style={styles.statItem}>
              <Ionicons name={s.icon as any} size={20} color={s.clr} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          </React.Fragment>
        ))}
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fade }}>
          {/* About */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Haqida</Text>
            <Text style={styles.cardBody}>
              {doctor.specialty} mutaxassisi, {doctor.experience} yillik amaliy tajribaga ega.
              Bemorlarni uy sharoitida qabul qiladi va onlayn maslahat beradi.
              Sertifikatlangan va ishonchli mutaxassis.
            </Text>
          </View>

          {/* Prices */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Narxlar</Text>
            <View style={styles.priceRow}>
              {[
                { icon: 'home-outline',    type: 'Uyga tashrif', price: doctor.price,             clr: Colors.primary, bg: Colors.primaryLight },
                { icon: 'videocam-outline',type: 'Onlayn',       price: Math.round(doctor.price * 0.6), clr: '#3B82F6', bg: '#EBF5FF' },
              ].map((p, i) => (
                <View key={i} style={[styles.priceCard, { backgroundColor: p.bg }]}>
                  <View style={[styles.priceIcon, { backgroundColor: `${p.clr}22` }]}>
                    <Ionicons name={p.icon as any} size={20} color={p.clr} />
                  </View>
                  <Text style={styles.priceType}>{p.type}</Text>
                  <Text style={[styles.priceVal, { color: p.clr }]}>{fmtPrice(p.price)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          label={doctor.available ? "Buyurtma berish" : "Hozir mavjud emas"}
          onPress={() => navigation.navigate('BookOrder', {})}
          disabled={!doctor.available}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { alignItems: 'center', paddingBottom: 60 },
  backBtn: {
    alignSelf: 'flex-start', marginLeft: Spacing.base, marginBottom: Spacing.base,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: Colors.primary, marginBottom: Spacing.md,
    backgroundColor: Colors.border,
  },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: 4 },
  specialty: { fontSize: FontSize.base, color: Colors.textOnDark, marginBottom: Spacing.sm },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,200,150,0.18)', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full,
  },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  availText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semiBold },

  statsCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base, marginTop: -36,
    borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDiv:  { width: 1, height: 40, backgroundColor: Colors.borderLight, alignSelf: 'center' },
  statVal:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl:  { fontSize: FontSize.xs, color: Colors.textMuted },

  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  card:      { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  cardBody:  { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  priceRow:  { flexDirection: 'row', gap: Spacing.sm },
  priceCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 6 },
  priceIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  priceType: { fontSize: FontSize.sm, color: Colors.textSecondary },
  priceVal:  { fontSize: FontSize.base, fontWeight: FontWeight.bold },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadow.lg,
  },
});

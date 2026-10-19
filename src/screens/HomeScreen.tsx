import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';
import { useAppStore } from '../store';
import { SERVICES, DOCTORS } from '../data';
import { ServiceCard } from '../components/ui/ServiceCard';
import { DoctorCard } from '../components/ui/DoctorCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { OrderCard } from '../components/ui/OrderCard';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, orders, unreadCount } = useAppStore();

  const fadeY = useRef(new Animated.Value(24)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(fadeY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
    ]).start();
  }, []);

  const count = unreadCount();
  const activeOrder = orders.find((o) => o.status === 'bajarilmoqda' || o.status === 'kutilmoqda');
  const availableDoctors = DOCTORS.filter((d) => d.available).slice(0, 2);

  const animStyle = { opacity: fade, transform: [{ translateY: fadeY }] };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Top bar ── */}
        <Animated.View style={[styles.topBar, animStyle]}>
          <View>
            <Text style={styles.greeting}>Xush kelibsiz 👋</Text>
            <Text style={styles.username}>{user.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifWrap}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            {count > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Location ── */}
        <Animated.View style={[styles.locationRow, animStyle]}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={13} color={Colors.primary} />
          </View>
          <Text style={styles.locationText}>{user.currentLocation}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.textMuted} />
        </Animated.View>

        {/* ── Hero card ── */}
        <Animated.View style={[animStyle, styles.heroSection]}>
          <LinearGradient
            colors={[Colors.dark, Colors.darkMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            {/* BG circles */}
            <View style={[styles.bgCircle, { width: 180, height: 180, right: -50, top: -50 }]} />
            <View style={[styles.bgCircle, { width: 100, height: 100, right: 60, bottom: -30, opacity: 0.05 }]} />

            <View style={styles.heroLeft}>
              <View style={styles.heroPill}>
                <View style={styles.heroPillDot} />
                <Text style={styles.heroPillText}>24/7 xizmat</Text>
              </View>
              <Text style={styles.heroTitle}>Hamshira{'\n'}uyingizga{'\n'}keladi</Text>
              <Text style={styles.heroSub}>30 daqiqada yetib boradi</Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => navigation.navigate('BookOrder', {})}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Buyurtma berish</Text>
                <Ionicons name="arrow-forward" size={13} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroRight}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.heroIconCircle}
              >
                <Ionicons name="medical" size={44} color={Colors.white} />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Quick stats ── */}
        <Animated.View style={[styles.statsRow, animStyle]}>
          {[
            { icon: 'people',              val: '500+', lbl: 'Hamshira'  },
            { icon: 'star',                val: '4.9',  lbl: 'Reyting'   },
            { icon: 'checkmark-circle',    val: '10K+', lbl: 'Buyurtma'  },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Active order ── */}
        {activeOrder && (
          <Animated.View style={[styles.section, animStyle]}>
            <SectionHeader title="Faol buyurtma" subtitle="Kuzatib boring" />
            <OrderCard
              order={activeOrder}
              onPress={() => navigation.navigate('OrderDetail', { order: activeOrder })}
            />
          </Animated.View>
        )}

        {/* ── Services ── */}
        <Animated.View style={[styles.section, animStyle]}>
          <SectionHeader
            title="Xizmatlar"
            subtitle={`${SERVICES.length} ta xizmat mavjud`}
            onSeeAll={() => (navigation as any).navigate('Main', { screen: 'ServicesTab' })}
          />
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {SERVICES.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onPress={() => navigation.navigate('ServiceDetail', { service: s })}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Doctors ── */}
        <Animated.View style={[styles.section, animStyle]}>
          <SectionHeader
            title="Shifokorlar"
            subtitle="Uyga tashrif bo'yicha"
            onSeeAll={() => (navigation as any).navigate('Main', { screen: 'ServicesTab' })}
          />
          {availableDoctors.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              onPress={() => navigation.navigate('DoctorDetail', { doctor: d })}
            />
          ))}
        </Animated.View>

        {/* ── Promo ── */}
        <Animated.View style={[{ marginBottom: Spacing.xxxl }, animStyle]}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.promo}
          >
            <View style={[styles.bgCircle, { width: 140, height: 140, right: -30, top: -30, opacity: 0.15 }]} />
            <View>
              <Text style={styles.promoSub}>Birinchi buyurtma</Text>
              <Text style={styles.promoTitle}>20% chegirma!</Text>
              <TouchableOpacity
                style={styles.promoBtn}
                onPress={() => navigation.navigate('BookOrder', {})}
                activeOpacity={0.85}
              >
                <Text style={styles.promoBtnText}>Foydalanish →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeNum}>20%</Text>
              <Text style={styles.promoBadgeOff}>OFF</Text>
            </View>
          </LinearGradient>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.base },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: Spacing.base, marginBottom: Spacing.xs,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  username: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.textPrimary },

  notifWrap: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  notifBadge: {
    position: 'absolute', top: 8, right: 8, width: 16, height: 16,
    borderRadius: 8, backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  notifBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white },

  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: Spacing.base,
  },
  locationIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  locationText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, flex: 1 },

  heroSection: { marginBottom: Spacing.md },
  hero: {
    borderRadius: Radius.xxl, padding: Spacing.xl, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
  },
  bgCircle: {
    position: 'absolute', borderRadius: 9999,
    backgroundColor: Colors.white, opacity: 0.07,
  },
  heroLeft: { flex: 1 },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 2, paddingVertical: 5, borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  heroPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  heroPillText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.medium },
  heroTitle: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.white,
    lineHeight: 34, marginBottom: Spacing.xs,
  },
  heroSub: { fontSize: FontSize.sm, color: Colors.textOnDark, marginBottom: Spacing.base },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.white, alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full,
    ...Shadow.xs,
  },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.dark },
  heroRight: { marginLeft: Spacing.md },
  heroIconCircle: {
    width: 86, height: 86, borderRadius: 43,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },

  statsRow: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  statVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLbl: { fontSize: 10, color: Colors.textMuted },

  section: { marginBottom: Spacing.base },
  hScroll: { gap: Spacing.sm },

  promo: {
    borderRadius: Radius.xxl, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoSub:   { fontSize: FontSize.sm,   color: 'rgba(255,255,255,0.75)' },
  promoTitle: { fontSize: FontSize.xl,   fontWeight: FontWeight.extraBold, color: Colors.white, marginBottom: Spacing.md },
  promoBtn: {
    backgroundColor: Colors.white, alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: Radius.full,
  },
  promoBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.primaryDeep },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', width: 78, height: 78, borderRadius: 39,
    alignItems: 'center', justifyContent: 'center',
  },
  promoBadgeNum: { fontSize: FontSize.xl,  fontWeight: FontWeight.extraBold, color: Colors.white },
  promoBadgeOff: { fontSize: FontSize.sm,  fontWeight: FontWeight.bold,      color: 'rgba(255,255,255,0.8)' },
});

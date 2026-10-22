import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
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

type Nav   = StackNavigationProp<RootStackParamList, 'ServiceDetail'>;
type RouteP = RouteProp<RootStackParamList, 'ServiceDetail'>;

const FEATURES = [
  { icon: 'shield-checkmark-outline', text: 'Sertifikatlangan hamshira' },
  { icon: 'time-outline',             text: '30 daqiqada yetib boradi'  },
  { icon: 'medical-outline',          text: 'Steril bir martalik anjomlar' },
  { icon: 'card-outline',             text: "To'lov xizmatdan keyin"    },
];
const STEPS = ['Buyurtma bering', 'Hamshira tanlanadi', 'Hamshira keladi', "Xizmat ko'rsatiladi"];

export const ServiceDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteP>();
  const { service } = params;
  const insets = useSafeAreaInsets();

  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, speed: 14 }),
    ]).start();
  }, []);

  const fmtPrice = (p: number) => `${p.toLocaleString('uz-UZ')} so'm`;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: service.iconBg, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
          <View style={[styles.iconCircle, { backgroundColor: `${service.iconColor}22` }]}>
            <View style={[styles.iconInner, { backgroundColor: service.iconBg }]}>
              <Ionicons name={service.icon as any} size={60} color={service.iconColor} />
            </View>
          </View>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }] }}>
          {/* Title + price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{service.name}</Text>
              {service.duration && (
                <View style={styles.durationRow}>
                  <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.duration}>{service.duration}</Text>
                </View>
              )}
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>{fmtPrice(service.price)}</Text>
              <Text style={styles.priceFrom}>dan boshlab</Text>
            </View>
          </View>

          {service.popular && (
            <View style={styles.popularRow}>
              <Ionicons name="flame" size={14} color={Colors.primary} />
              <Text style={styles.popularText}>Eng mashhur xizmatlardan biri</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tavsif</Text>
            <Text style={styles.cardBody}>{service.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nimalar kiradi?</Text>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={15} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Qanday ishlaydi?</Text>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <LinearGradient colors={['#00C896', '#00A87E']} style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </LinearGradient>
                {i < STEPS.length - 1 && <View style={styles.stepLine} />}
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <PrimaryButton
          label="Buyurtma berish"
          onPress={() => navigation.navigate('BookOrder', { service })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingBottom: Spacing.xxl + Spacing.lg,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start', marginLeft: Spacing.base, marginBottom: Spacing.base,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    ...Shadow.xs,
  },
  iconCircle: {
    width: 150, height: 150, borderRadius: 75,
    alignItems: 'center', justifyContent: 'center',
  },
  iconInner: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll:   { paddingHorizontal: Spacing.base },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: Spacing.base, marginBottom: Spacing.sm },
  name:     { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1, marginRight: Spacing.sm },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  duration:    { fontSize: FontSize.xs, color: Colors.textMuted },
  priceBox: { alignItems: 'flex-end' },
  price:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  priceFrom: { fontSize: FontSize.xs, color: Colors.textMuted },
  popularRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight, alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, marginBottom: Spacing.base,
  },
  popularText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.primary },
  card:      { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.md },
  cardBody:  { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  featureIcon: {
    width: 34, height: 34, borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: FontSize.base, color: Colors.textSecondary, flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  stepNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepLine: { position: 'absolute', left: 14, top: 30, width: 2, height: Spacing.sm + 4, backgroundColor: Colors.primaryLight },
  stepNumText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.white },
  stepText: { fontSize: FontSize.base, color: Colors.textSecondary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadow.lg,
  },
});

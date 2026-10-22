import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity,
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
import { PrimaryButton } from '../components/ui/PrimaryButton';

const { width } = Dimensions.get('window');
type Nav = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const SLIDES = [
  {
    id: '1',
    bgGrad: ['#0A1628', '#112240'] as [string, string],
    icon: 'medical' as const,
    iconGrad: ['#00C896', '#00A87E'] as [string, string],
    title: 'Hamshira uyingizga\nkeladi',
    subtitle: 'Sertifikatlangan tibbiy xodimlar 30 daqiqa ichida eshigingizda.',
    tag: '30 daq ichida',
  },
  {
    id: '2',
    bgGrad: ['#112240', '#1C3358'] as [string, string],
    icon: 'shield-checkmark' as const,
    iconGrad: ['#3B82F6', '#2563EB'] as [string, string],
    title: 'Xavfsiz va\nishonchli',
    subtitle: "Barcha mutaxassislar tekshirilgan va sertifikatlangan. Sog'lig'ingiz bizning ustuvorligimiz.",
    tag: '500+ hamshira',
  },
  {
    id: '3',
    bgGrad: ['#1C3358', '#0A1628'] as [string, string],
    icon: 'time' as const,
    iconGrad: ['#F59E0B', '#D97706'] as [string, string],
    title: '24/7 doim\ntayyormiz',
    subtitle: 'Tunmi, kunduzmi — faqat buyurtma bering, qolganini biz hal qilamiz.',
    tag: '24/7 xizmat',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const [current, setCurrent]   = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef  = useRef<any>(null);

  const slide = SLIDES[current];

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      setCurrent(next);
      flatRef.current?.scrollTo({ x: width * next, animated: true });
    } else {
      setOnboarded();
      navigation.replace('Auth');
    }
  };

  const skip = () => { setOnboarded(); navigation.replace('Auth'); };

  return (
    <LinearGradient colors={slide.bgGrad} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Skip */}
        {current < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.skipBtn} onPress={skip}>
            <Text style={styles.skipText}>O'tkazib yuborish</Text>
          </TouchableOpacity>
        )}

        {/* Horizontal pager (manual) */}
        <Animated.ScrollView
          ref={flatRef}
          horizontal pagingEnabled scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        >
          {SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.slideWrap, { width }]}>
              {/* Icon hero */}
              <View style={styles.iconHero}>
                <View style={styles.outerRing}>
                  <View style={styles.innerRing}>
                    <LinearGradient colors={s.iconGrad} style={styles.iconCircle}>
                      <Ionicons name={s.icon} size={72} color={Colors.white} />
                    </LinearGradient>
                  </View>
                </View>
              </View>

              {/* Tag pill */}
              <View style={styles.tag}>
                <View style={styles.tagDot} />
                <Text style={styles.tagText}>{s.tag}</Text>
              </View>

              {/* Text */}
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>
          ))}
        </Animated.ScrollView>

        {/* Bottom area */}
        <View style={styles.bottom}>
          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i === current ? 28 : 8,
                    backgroundColor: i === current ? Colors.primary : 'rgba(255,255,255,0.25)',
                  },
                ]}
              />
            ))}
          </View>

          {/* Button */}
          <PrimaryButton
            label={current === SLIDES.length - 1 ? "Boshlash →" : "Keyingisi →"}
            onPress={goNext}
          />

          {current === SLIDES.length - 1 && (
            <TouchableOpacity onPress={skip} style={styles.loginLink}>
              <Text style={styles.loginText}>Hisobim bor → Kirish</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', marginRight: Spacing.base, marginTop: Spacing.sm, padding: Spacing.sm },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  slideWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  iconHero: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.xl },
  outerRing: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  innerRing: {
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, marginBottom: Spacing.base,
  },
  tagDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  tagText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  title: {
    fontSize: FontSize.xxxl, fontWeight: FontWeight.extraBold,
    color: Colors.white, lineHeight: 44, marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.base, color: 'rgba(255,255,255,0.6)',
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.base,
  },
  dots: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  dot: { height: 8, borderRadius: Radius.full },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.xs },
  loginText: { color: 'rgba(255,255,255,0.45)', fontSize: FontSize.sm },
});

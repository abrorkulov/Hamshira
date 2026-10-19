import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
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

type Nav = StackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: string; iconColor: string; iconBg: string;
  label: string; value?: string;
  onPress: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, iconColor, iconBg, label, value, onPress, danger }) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 25 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.menuItem, { transform: [{ scale }] }]}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={19} color={iconColor} />
        </View>
        <View style={styles.menuLabel}>
          <Text style={[styles.menuText, danger && { color: Colors.error }]}>{label}</Text>
          {value && <Text style={styles.menuValue}>{value}</Text>}
        </View>
        {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, orders } = useAppStore();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() =>
    void Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start(),
  []);

  const done  = orders.filter((o) => o.status === 'bajarildi').length;
  const spent = orders.filter((o) => o.status === 'bajarildi').reduce((s, o) => s + o.price, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Animated.View style={{ opacity: fade }}>
          <LinearGradient
            colors={[Colors.dark, Colors.darkMid]}
            style={styles.headerGrad}
          >
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="camera" size={13} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={13} color={Colors.textOnDark} />
              <Text style={styles.phone}>{user.phone}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsBox}>
              {[
                { val: done.toString(),    lbl: 'Buyurtma'  },
                { val: spent > 0 ? (spent / 1000).toFixed(0) + 'K' : '0', lbl: "So'm sarflandi" },
                { val: user.addresses.length.toString(), lbl: 'Manzil'    },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={styles.statDiv} />}
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{s.val}</Text>
                    <Text style={styles.statLbl}>{s.lbl}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Menu ── */}
        <Animated.View style={[styles.content, { opacity: fade }]}>

          <Text style={styles.sectionLabel}>SHAXSIY</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline" iconColor="#3B82F6" iconBg="#EBF5FF"
              label="Profilni tahrirlash"
              value={user.email ?? ''}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={styles.sep} />
            <MenuItem
              icon="location-outline" iconColor={Colors.primary} iconBg={Colors.primaryLight}
              label="Manzillarim"
              value={`${user.addresses.length} ta saqlangan`}
              onPress={() => navigation.navigate('Addresses')}
            />
            <View style={styles.sep} />
            <MenuItem
              icon="notifications-outline" iconColor="#F59E0B" iconBg={Colors.warningBg}
              label="Bildirishnomalar"
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>

          <Text style={styles.sectionLabel}>SOZLAMALAR</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="language-outline" iconColor="#8B5CF6" iconBg="#F4F0FF"
              label="Til"
              value="O'zbek"
              onPress={() => {}}
            />
            <View style={styles.sep} />
            <MenuItem
              icon="shield-checkmark-outline" iconColor={Colors.primary} iconBg={Colors.primaryLight}
              label="Xavfsizlik"
              onPress={() => {}}
            />
            <View style={styles.sep} />
            <MenuItem
              icon="help-circle-outline" iconColor="#3B82F6" iconBg="#EBF5FF"
              label="Yordam markazi"
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <View style={styles.sep} />
            <MenuItem
              icon="star-outline" iconColor="#F59E0B" iconBg={Colors.warningBg}
              label="Ilovani baholash"
              onPress={() => {}}
            />
          </View>

          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline" iconColor={Colors.error} iconBg={Colors.errorBg}
              label="Chiqish"
              onPress={() => {}} danger
            />
          </View>

          <Text style={styles.version}>Hamshira v1.0.0  •  © 2026</Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  headerGrad: {
    alignItems: 'center', paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl, paddingHorizontal: Spacing.base,
    borderBottomLeftRadius: Radius.xxl, borderBottomRightRadius: Radius.xxl,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.white },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.darkLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.dark,
  },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: Spacing.xl },
  phone:    { fontSize: FontSize.sm, color: Colors.textOnDark },

  statsBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    gap: Spacing.xl, alignSelf: 'stretch', justifyContent: 'center',
  },
  statItem: { alignItems: 'center' },
  statVal:  { fontSize: FontSize.lg,  fontWeight: FontWeight.bold, color: Colors.white },
  statLbl:  { fontSize: FontSize.xs, color: Colors.textOnDark, marginTop: 2 },
  statDiv:  { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },

  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing.xxxl },

  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.textMuted,
    letterSpacing: 1, marginBottom: Spacing.xs, marginTop: Spacing.base,
  },
  menuCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
    marginBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md + 2, gap: Spacing.md,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1 },
  menuText:  { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  menuValue: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  sep: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 72 },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xl },
});

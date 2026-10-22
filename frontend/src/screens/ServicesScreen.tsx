import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ServiceCategory } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';
import { SERVICES } from '../data';
import { ServiceCard } from '../components/ui/ServiceCard';

type Nav = StackNavigationProp<RootStackParamList>;

const CATS: { id: ServiceCategory | 'barchasi'; label: string; icon: string }[] = [
  { id: 'barchasi',    label: 'Barchasi',    icon: 'apps-outline'    },
  { id: 'muolaja',     label: 'Muolaja',     icon: 'fitness-outline' },
  { id: 'diagnostika', label: 'Diagnostika', icon: 'flask-outline'   },
  { id: 'parvarish',   label: 'Parvarish',   icon: 'leaf-outline'    },
];

export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [cat, setCat]       = useState<string>('barchasi');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filtered = SERVICES.filter((s) => {
    const catOk = cat === 'barchasi' || s.category === cat;
    const searchOk = s.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Xizmat qidirish..."
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View>
              <Text style={styles.title}>Xizmatlar</Text>
              <Text style={styles.sub}>{SERVICES.length} ta xizmat</Text>
            </View>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => setShowSearch(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Category pills */}
      <Animated.ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
        style={{ opacity: fade, maxHeight: 52 }}
      >
        {CATS.map((c) => {
          const active = cat === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => setCat(c.id)}
              activeOpacity={0.8}
              style={[styles.catChip, active && styles.catChipActive]}
            >
              <Ionicons
                name={c.icon as any}
                size={14}
                color={active ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* Grid */}
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={44} color={Colors.border} />
              <Text style={styles.emptyText}>Hech narsa topilmadi</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => navigation.navigate('ServiceDetail', { service: item })}
            />
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.base, marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sub:   { fontSize: FontSize.xs,  color: Colors.textMuted, marginTop: 2 },
  searchBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.xs,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, height: 46,
    borderWidth: 1, borderColor: Colors.primary,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },

  catScroll: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.md },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 1,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  catLabelActive: { color: Colors.white, fontWeight: FontWeight.semiBold },

  grid:    { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl, gap: Spacing.sm },
  gridRow: { gap: Spacing.sm, justifyContent: 'space-between' },

  empty: { alignItems: 'center', paddingTop: Spacing.xxxl, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});

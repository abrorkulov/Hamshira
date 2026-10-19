import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Radius, Shadow, Spacing } from '../constants/layout';

const NOTIFICATIONS = [
  { id: '1', icon: 'checkmark-circle', color: Colors.success, bg: Colors.successBg, title: "Buyurtma tasdiqlandi", body: "Tomchilatma buyurtmangiz tasdiqlandi. Hamshira 30 daqiqada keladi.", time: '5 daq oldin', read: false },
  { id: '2', icon: 'person', color: '#3B82F6', bg: '#EBF5FF', title: "Hamshira yo'lda", body: "Dilnoza Rahimova sizning manzilingizga yo'l oldi.", time: '20 daq oldin', read: false },
  { id: '3', icon: 'star', color: Colors.warning, bg: Colors.warningBg, title: "Baholang", body: "Kechagi xizmatni baholashni unutmang!", time: 'Kecha', read: true },
  { id: '4', icon: 'gift', color: '#EC4899', bg: '#FFF0F9', title: "Yangi chegirma!", body: "Kelgusi buyurtmangizga 15% chegirma. Muddati: 3 kun.", time: '2 kun oldin', read: true },
];

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirishnomalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.notifCard, item.read && styles.readCard]}>
            {!item.read && <View style={styles.unreadDot} />}
            <View style={[styles.notifIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTop}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.base, gap: Spacing.md, ...Shadow.sm,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  readCard: { borderLeftColor: 'transparent', opacity: 0.75 },
  unreadDot: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary,
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  notifTitle: {
    fontSize: FontSize.base, fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary, flex: 1, marginRight: Spacing.sm,
  },
  notifTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  notifBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});

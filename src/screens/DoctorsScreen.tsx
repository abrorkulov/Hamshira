import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { Spacing } from '../constants/layout';
import { DOCTORS } from '../data';
import { DoctorCard } from '../components/ui/DoctorCard';

type Nav = StackNavigationProp<RootStackParamList>;

export const DoctorsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start(), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shifokorlar</Text>
        <Text style={styles.sub}>{DOCTORS.length} nafar mutaxassis</Text>
      </View>
      <Animated.FlatList
        style={{ opacity: fade }}
        data={DOCTORS}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => navigation.navigate('DoctorDetail', { doctor: item })}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, marginBottom: Spacing.base },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sub:   { fontSize: FontSize.sm,  color: Colors.textMuted, marginTop: 2 },
  list:  { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
});

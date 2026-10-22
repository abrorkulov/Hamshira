import React, { useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/typography';
import { HomeScreen } from '../screens/HomeScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { DoctorsScreen } from '../screens/DoctorsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookOrderScreen } from '../screens/BookOrderScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabItem = {
  name: keyof RootTabParamList;
  label: string;
  icon: string;
  iconFilled: string;
  component: React.ComponentType<any>;
};

const TABS: TabItem[] = [
  { name: 'HomeTab',     label: 'Bosh sahifa', icon: 'home-outline',     iconFilled: 'home',    component: HomeScreen },
  { name: 'ServicesTab', label: 'Xizmatlar',   icon: 'grid-outline',     iconFilled: 'grid',    component: ServicesScreen },
  { name: 'BookTab',     label: 'Buyurtma',    icon: 'add-circle-outline', iconFilled: 'add-circle', component: BookOrderScreen },
  { name: 'OrdersTab',   label: 'Tarixim',     icon: 'receipt-outline',  iconFilled: 'receipt', component: OrdersScreen },
  { name: 'ProfileTab',  label: 'Profil',      icon: 'person-outline',   iconFilled: 'person',  component: ProfileScreen },
];

const AnimatedTabIcon: React.FC<{
  icon: string;
  iconFilled: string;
  label: string;
  focused: boolean;
  isBook?: boolean;
}> = ({ icon, iconFilled, label, focused, isBook }) => {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1 : 0.85, useNativeDriver: true, speed: 20, bounciness: 8 }),
      Animated.timing(opacity, { toValue: focused ? 1 : 0.6, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  if (isBook) {
    return (
      <View style={[styles.bookTabCenter, focused && styles.bookTabCenterActive]}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale }], opacity }]}>
      <Ionicons
        name={(focused ? iconFilled : icon) as any}
        size={22}
        color={focused ? Colors.primary : Colors.tabInactive}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.activeDot} />}
    </Animated.View>
  );
};

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
          )}
          {state.routes.map((route, index) => {
            const tab = TABS[index];
            const focused = state.index === index;
            const isBook = tab.name === 'BookTab';

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.tabTouchable}
              >
                <AnimatedTabIcon
                  icon={tab.icon}
                  iconFilled={tab.iconFilled}
                  label={tab.label}
                  focused={focused}
                  isBook={isBook}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 16,
  },
  androidBg: {
    backgroundColor: Colors.white,
  },
  tabTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.tabInactive,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 1,
  },
  bookTabCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bookTabCenterActive: {
    backgroundColor: Colors.primaryDark,
  },
});

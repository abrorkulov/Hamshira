import React from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ServiceDetailScreen } from '../screens/ServiceDetailScreen';
import { DoctorDetailScreen } from '../screens/DoctorDetailScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { BookOrderScreen } from '../screens/BookOrderScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { useAppStore } from '../store';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const loadCatalog = useAppStore((s) => s.loadCatalog);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#F5F7FA' } }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : null}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="ServiceDetail"
          component={ServiceDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="DoctorDetail"
          component={DoctorDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="BookOrder"
          component={BookOrderScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

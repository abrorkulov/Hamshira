import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/layout';
import { PrimaryButton } from '../components/ui/PrimaryButton';

type Nav = StackNavigationProp<RootStackParamList, 'Auth'>;

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const authenticate = useAppStore(s => s.authenticate);
  const apiError = useAppStore(s => s.apiError);
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await authenticate(mode, { name, phone, password });
      navigation.replace('Main');
    } catch { /* Error text is shown below the fields. */ }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.mark}><Text style={styles.markText}>H</Text></View>
        <Text style={styles.title}>{mode === 'register' ? 'Hisob yarating' : 'Hisobga kiring'}</Text>
        <Text style={styles.subtitle}>Buyurtmalaringiz va manzillaringizni saqlash uchun tizimga kiring.</Text>
        {mode === 'register' && <TextInput style={styles.input} placeholder="Ism va familiya" value={name} onChangeText={setName} autoCapitalize="words" />}
        <TextInput style={styles.input} placeholder="Telefon raqam (+998...)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
        <TextInput style={styles.input} placeholder="Parol (kamida 8 belgi)" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        {!!apiError && <Text style={styles.error}>{apiError}</Text>}
        <PrimaryButton label={loading ? 'Kuting...' : mode === 'register' ? 'Ro‘yxatdan o‘tish' : 'Kirish'} onPress={submit} disabled={loading || !phone.trim() || password.length < 8 || (mode === 'register' && name.trim().length < 2)} />
        {loading && <ActivityIndicator color={Colors.primary} style={styles.loader} />}
        <TouchableOpacity style={styles.switch} onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
          <Text style={styles.switchText}>{mode === 'register' ? 'Hisobingiz bormi? Kirish' : 'Yangi foydalanuvchimisiz? Hisob yarating'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  wrap: { flex: 1, justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  mark: { width: 58, height: 58, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  markText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  title: { color: Colors.textPrimary, fontWeight: '800', fontSize: 28 },
  subtitle: { color: Colors.textMuted, lineHeight: 22, marginBottom: Spacing.sm },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 14, minHeight: 52, paddingHorizontal: 16, color: Colors.textPrimary },
  error: { color: Colors.error, lineHeight: 20 },
  loader: { marginTop: 4 },
  switch: { alignItems: 'center', paddingVertical: Spacing.md },
  switchText: { color: Colors.primary, fontWeight: '600' },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Home,
  MapPin,
  Bookmark,
  Eye,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/ui/Header';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    full_name: string;
    phone: string;
    home_address: string;
    role: string;
  }>({
    full_name: 'Vecino de San Martín',
    phone: '998877665',
    home_address: 'Jr. Los Jazmines 340, Sector 4',
    role: 'vecino',
  });

  const [accessibleMode, setAccessibleMode] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('user_session');
        if (saved) {
          setProfile(JSON.parse(saved));
        }
        const acc = await AsyncStorage.getItem('accessible_mode');
        if (acc === 'true') {
          setAccessibleMode(true);
        }
      } catch (err) {
        console.error('Error loading session', err);
      }
    };
    loadSession();
  }, []);

  const toggleAccessibleMode = async (value: boolean) => {
    setAccessibleMode(value);
    await AsyncStorage.setItem('accessible_mode', value ? 'true' : 'false');
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Deseas salir de Sumayni?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user_session');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-neutral-background">
      <Header title="Mi Perfil" subtitle="Hogar y Preferencias Comunitarias" />

      <ScrollView contentContainerClassName="p-4 pb-28">
        {/* User Card */}
        <Card className="p-4 mb-3 flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-neutral-mutedBg items-center justify-center mr-3.5">
            <User size={26} color="#1A1D20" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
            >
              {profile.full_name}
            </Text>
            <Text
              className="text-neutral-textMuted mt-0.5"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            >
              Tel: {profile.phone}
            </Text>
            <View className="mt-1.5 bg-neutral-mutedBg self-start px-2.5 py-0.5 rounded-md">
              <Text
                className="text-neutral-textMuted uppercase"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
              >
                Rol: {profile.role}
              </Text>
            </View>
          </View>
        </Card>

        {/* Registered Home Address */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-1.5">
            <Home size={18} color="#1E5E45" strokeWidth={2.2} />
            <Text
              className="text-neutral-textMain ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Hogar Georreferenciado
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted mb-2.5 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Punto de partida fijo para calcular las distancias a pie en tu barrio.
          </Text>
          <View className="bg-neutral-mutedBg p-3 rounded-xl flex-row items-center">
            <MapPin size={18} color="#6C727A" strokeWidth={2} />
            <Text
              className="text-neutral-textMain ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {profile.home_address}
            </Text>
          </View>
        </Card>

        {/* Accessibility Toggle */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <Eye size={18} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-2 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                >
                  Modo Adulto Mayor
                </Text>
              </View>
              <Text
                className="text-neutral-textMuted leading-5"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
              >
                Amplía los botones y textos para facilitar la lectura.
              </Text>
            </View>
            <Switch
              value={accessibleMode}
              onValueChange={toggleAccessibleMode}
              trackColor={{ false: '#E9ECEF', true: '#348B68' }}
              thumbColor={accessibleMode ? '#1E5E45' : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Quick links */}
        <Card className="p-2 mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3.5 border-b border-neutral-border/50 min-h-[48px]"
            onPress={() => Alert.alert('Favoritos', 'Tienes 3 oficios guardados en favoritos.')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Bookmark size={18} color="#6C727A" strokeWidth={2} />
              <Text
                className="text-neutral-textMain ml-3 flex-1"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                Mis Favoritos Guardados
              </Text>
            </View>
            <ChevronRight size={18} color="#9EA3AE" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3.5 min-h-[48px]"
            onPress={() => router.push('/emergency-board')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Shield size={18} color="#DC2626" strokeWidth={2} />
              <Text
                className="text-emergency-alert ml-3 flex-1"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                Protocolo de Emergencia y Red SOS
              </Text>
            </View>
            <ChevronRight size={18} color="#DC2626" />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={18} color="#1A1D20" />}
        />
      </ScrollView>
    </View>
  );
}

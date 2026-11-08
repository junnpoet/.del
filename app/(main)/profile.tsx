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
    <SafeAreaView className="flex-1 bg-neutral-background">
      <Header title="Mi Perfil" subtitle="Hogar y Preferencias Comunitarias" />

      <ScrollView contentContainerClassName="p-4 pb-28">
        {/* User Card */}
        <Card className="p-4 mb-4 flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mr-4">
            <User size={30} color="#2D6A4F" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-neutral-textMain">
              {profile.full_name}
            </Text>
            <Text className="text-xs text-neutral-textMuted">
              {profile.phone}
            </Text>
            <View className="mt-1 bg-primary/15 self-start px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-bold text-primary uppercase">
                Rol: {profile.role}
              </Text>
            </View>
          </View>
        </Card>

        {/* Registered Home Address */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Home size={18} color="#2D6A4F" />
            <Text className="text-sm font-bold text-neutral-textMain ml-2">
              Hogar Georreferenciado
            </Text>
          </View>
          <Text className="text-xs text-neutral-textMuted mb-2">
            Punto de partida inmutable para todos tus cálculos de radio a pie.
          </Text>
          <View className="bg-neutral-background p-3 rounded-xl border border-neutral-border flex-row items-center">
            <MapPin size={18} color="#6B7280" />
            <Text className="text-sm font-semibold text-neutral-textMain ml-2 flex-1">
              {profile.home_address}
            </Text>
          </View>
        </Card>

        {/* Accessibility Toggle */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <Eye size={18} color="#2D6A4F" />
                <Text className="text-sm font-bold text-neutral-textMain ml-2">
                  Modo Accesible Adaptativo
                </Text>
              </View>
              <Text className="text-xs text-neutral-textMuted">
                Aumenta el tamaño de botones y tipografía para adultos mayores.
              </Text>
            </View>
            <Switch
              value={accessibleMode}
              onValueChange={toggleAccessibleMode}
              trackColor={{ false: '#E5E7EB', true: '#40916C' }}
              thumbColor={accessibleMode ? '#2D6A4F' : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Quick links */}
        <Card className="p-2 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 border-b border-neutral-border min-h-[48px]"
            onPress={() => Alert.alert('Favoritos', 'Tienes 3 oficios guardados en favoritos.')}
          >
            <View className="flex-row items-center">
              <Bookmark size={18} color="#6B7280" />
              <Text className="text-sm font-medium text-neutral-textMain ml-3">
                Mis Favoritos Guardados
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3 min-h-[48px]"
            onPress={() => router.push('/emergency-board')}
          >
            <View className="flex-row items-center">
              <Shield size={18} color="#D90429" />
              <Text className="text-sm font-medium text-emergency-alert ml-3">
                Protocolo de Emergencia y Red SOS
              </Text>
            </View>
            <ChevronRight size={18} color="#D90429" />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={18} color="#2D6A4F" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

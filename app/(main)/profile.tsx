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

      <ScrollView contentContainerClassName="p-4 pb-32">
        {/* User Card */}
        <Card className="p-5 mb-4 flex-row items-center">
          <View className="w-20 h-20 rounded-3xl bg-primary-pastel border-2 border-primary-light/60 items-center justify-center mr-4">
            <User size={38} color="#1B4332" strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 22 }}
            >
              {profile.full_name}
            </Text>
            <Text
              className="text-neutral-textMuted mt-0.5"
              style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}
            >
              Tel: {profile.phone}
            </Text>
            <View className="mt-2 bg-earth-pastel border border-earth-light self-start px-3.5 py-1 rounded-xl">
              <Text
                className="text-earth-dark uppercase"
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13 }}
              >
                Rol: {profile.role}
              </Text>
            </View>
          </View>
        </Card>

        {/* Registered Home Address */}
        <Card className="p-5 mb-4">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-xl bg-primary-pastel items-center justify-center mr-3">
              <Home size={22} color="#1B4332" strokeWidth={2.5} />
            </View>
            <Text
              className="text-neutral-textMain flex-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
            >
              Hogar Georreferenciado
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted mb-3 leading-6"
            style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
          >
            Punto de partida fijo para calcular las distancias a pie en tu barrio.
          </Text>
          <View className="bg-primary-pastel/50 p-4 rounded-2xl border-2 border-primary-light/50 flex-row items-center">
            <MapPin size={22} color="#1B4332" strokeWidth={2.5} />
            <Text
              className="text-primary-dark ml-2.5 flex-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
            >
              {profile.home_address}
            </Text>
          </View>
        </Card>

        {/* Accessibility Toggle */}
        <Card className="p-5 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-1.5">
                <View className="w-10 h-10 rounded-xl bg-sun-pastel items-center justify-center mr-3">
                  <Eye size={22} color="#7C4D12" strokeWidth={2.5} />
                </View>
                <Text
                  className="text-neutral-textMain flex-1"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
                >
                  Modo Adulto Mayor
                </Text>
              </View>
              <Text
                className="text-neutral-textMuted leading-6"
                style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
              >
                Amplía aún más los botones y textos para lectura sin esfuerzo.
              </Text>
            </View>
            <Switch
              value={accessibleMode}
              onValueChange={toggleAccessibleMode}
              trackColor={{ false: '#E6DEC8', true: '#52B788' }}
              thumbColor={accessibleMode ? '#1B4332' : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Quick links */}
        <Card className="p-3 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b-2 border-neutral-mutedBg min-h-[60px]"
            onPress={() => Alert.alert('Favoritos', 'Tienes 3 oficios guardados en favoritos.')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-earth-pastel items-center justify-center mr-3">
                <Bookmark size={22} color="#6D3B1E" strokeWidth={2.5} />
              </View>
              <Text
                className="text-neutral-textMain flex-1"
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
              >
                Mis Favoritos Guardados
              </Text>
            </View>
            <ChevronRight size={24} color="#5C564F" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 min-h-[60px]"
            onPress={() => router.push('/emergency-board')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-emergency-pastel items-center justify-center mr-3">
                <Shield size={22} color="#E03131" strokeWidth={2.5} />
              </View>
              <Text
                className="text-emergency-alert flex-1"
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
              >
                Protocolo de Emergencia y Red SOS
              </Text>
            </View>
            <ChevronRight size={24} color="#E03131" />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={22} color="#1B4332" />}
        />
      </ScrollView>
    </View>
  );
}

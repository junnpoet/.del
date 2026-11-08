import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { DEMO_PERSONAS, useDemo } from '../../src/services/demoStore';

export default function LoginScreen() {
  const router = useRouter();
  const { switchUser } = useDemo();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      Alert.alert('Atención', 'Ingresa tu número de teléfono celular.');
      return;
    }

    setIsLoading(true);
    try {
      // Find matching demo persona by phone or default to custom neighbor
      const matched = DEMO_PERSONAS.find((p) => p.phone === cleanPhone);

      if (matched) {
        await switchUser(matched.id);
        const sessionData = {
          id: matched.id,
          full_name: matched.name,
          phone: matched.phone,
          role: matched.role,
          home_address: matched.homeAddress,
        };
        await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));
      } else {
        const customUser = {
          id: `user-${cleanPhone}`,
          full_name: 'Vecino de San Martín',
          phone: cleanPhone,
          role: 'vecino',
          home_address: 'Jr. Los Jazmines 340, Sector 4',
        };
        await AsyncStorage.setItem('user_session', JSON.stringify(customUser));
        await switchUser('carmen_vecina');
      }

      router.replace('/(main)');
    } catch (err) {
      console.error('Login error', err);
      Alert.alert('Error', 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-6 justify-center flex-grow">
          <View className="mb-6 items-center">
            <Image
              source={require('../../assets/images/logo-with-text.png')}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />
            <Text
              className="text-neutral-textMuted -mt-4 text-center"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
            >
              Bienestar y reciprocidad comunitaria
            </Text>
          </View>

          <Card className="p-5 mb-6">
            <Text
              className="text-neutral-textMain mb-4"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }}
            >
              Iniciar Sesión
            </Text>

            <Input
              label="Teléfono Celular"
              placeholder="Ej: 987654321"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Button
              title="Ingresar a mi Barrio"
              variant="primary"
              onPress={handleLogin}
              isLoading={isLoading}
              className="mt-2"
            />
          </Card>

          <View className="items-center">
            <Text
              className="text-neutral-textMuted mb-2.5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
            >
              ¿Aún no has registrado tu hogar?
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="min-h-[46px] items-center justify-center px-5 bg-neutral-mutedBg rounded-2xl"
            >
              <Text
                className="text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                Crear cuenta y registrar domicilio
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

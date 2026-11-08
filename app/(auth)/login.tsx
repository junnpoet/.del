import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Atención', 'Ingresa tu número de teléfono celular.');
      return;
    }

    setIsLoading(true);
    try {
      // Mock / local demo session persistence
      const dummyUser = {
        id: 'demo-user-id',
        full_name: 'Vecino Demo',
        phone: phone.trim(),
        role: 'vecino',
        home_address: 'Av. Las Palmeras 450, Los Olivos',
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(dummyUser));
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
          <View className="mb-8 items-center">
            <Text className="text-4xl font-extrabold text-primary">
              Sumayni
            </Text>
            <Text className="text-sm text-neutral-textMuted mt-1">
              Bienestar y reciprocidad comunitaria
            </Text>
          </View>

          <Card className="p-5 mb-6">
            <Text className="text-xl font-bold text-neutral-textMain mb-4">
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
            <Text className="text-sm text-neutral-textMuted mb-2">
              ¿Aún no has registrado tu hogar?
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="min-h-[48px] items-center justify-center px-4"
            >
              <Text className="text-sm font-bold text-primary">
                Crear cuenta y geolocalizar domicilio
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
            <View className="bg-primary-pastel px-6 py-2.5 rounded-3xl border-2 border-primary-light/60 mb-2">
              <Text
                className="text-primary-dark"
                style={{ fontFamily: 'Nunito_900Black', fontSize: 38 }}
              >
                Sumayni
              </Text>
            </View>
            <Text
              className="text-neutral-textMuted mt-1 text-center"
              style={{ fontFamily: 'Nunito_700Bold', fontSize: 17 }}
            >
              Bienestar y reciprocidad comunitaria
            </Text>
          </View>

          <Card className="p-6 mb-6">
            <Text
              className="text-neutral-textMain mb-4"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 24 }}
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
              className="text-neutral-textMuted mb-3"
              style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}
            >
              ¿Aún no has registrado tu hogar?
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="min-h-[54px] items-center justify-center px-6 bg-earth-pastel border-2 border-earth-light rounded-2xl"
            >
              <Text
                className="text-earth-dark"
                style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
              >
                Crear cuenta y geolocalizar domicilio
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

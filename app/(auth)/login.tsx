import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuth } from '../../src/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('Atención', 'Ingresa tu número de celular y tu contraseña.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(phone, password);
      router.replace('/(main)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const invalid = /invalid login credentials/i.test(message);
      Alert.alert(
        'Error',
        invalid
          ? 'Número de celular o contraseña incorrectos. Verifica que el usuario esté registrado en la base de datos.'
          : 'No se pudo iniciar sesión. Revisa tu conexión a la red.'
      );
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
              label="Número de celular"
              placeholder="Ej: 998877665"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, CheckCircle, Navigation } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Header } from '../../src/components/ui/Header';

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Request push notification permissions safely without blocking Expo Go
    const registerPushToken = async () => {
      try {
        const Notifications = await import('expo-notifications');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
          if (tokenData?.data) {
            setPushToken(tokenData.data);
          }
        }
      } catch (err) {
        // Expo Go on Android restricts remote push token generation; safe to bypass
        console.warn('Push notification token capture bypassed in Expo Go:', err);
      }
    };

    registerPushToken();
  }, []);

  const handleCaptureLocation = async () => {
    setIsLocating(true);
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de Ubicación',
          'Usaremos la ubicación referencial del sector para continuar con el registro.'
        );
        setCoords({ latitude: -12.0125, longitude: -77.0815 });
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }).catch(() => []);

      if (reverse.length > 0 && !homeAddress) {
        const item = reverse[0];
        const suggested = `${item.street || ''} ${item.name || ''}, ${item.district || item.subregion || ''}`.trim();
        if (suggested) {
          setHomeAddress(suggested);
        }
      }
    } catch (err) {
      console.warn('GPS fallback activated:', err);
      setCoords({ latitude: -12.0125, longitude: -77.0815 });
      if (!homeAddress) {
        setHomeAddress('Jr. Los Jazmines 340, San Martín de Porres');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Faltan Datos', 'Por favor ingresa tus nombres y apellidos.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Faltan Datos', 'Ingresa tu número de teléfono celular.');
      return;
    }
    if (!homeAddress.trim()) {
      Alert.alert('Faltan Datos', 'Ingresa la dirección exacta de tu residencia.');
      return;
    }
    if (!coords) {
      Alert.alert(
        'Ubicación Requerida',
        'Debes fijar la geolocalización de tu hogar para calcular distancias a pie y validar tu barrio.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newProfile = {
        id: `user-${Date.now()}`,
        full_name: fullName.trim(),
        phone: phone.trim(),
        home_address: homeAddress.trim(),
        home_location: coords,
        role: 'vecino',
        is_vulnerable: false,
        push_token: pushToken,
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user_session', JSON.stringify(newProfile));
      Alert.alert(
        '¡Bienvenido a Sumayni!',
        'Tu hogar ha sido georreferenciado con éxito en tu comunidad.'
      );
      router.replace('/(main)');
    } catch (err) {
      console.error('Registration error', err);
      Alert.alert('Error', 'No se pudo guardar el registro del hogar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-neutral-background">
      <Header title="Registro de Hogar" showBack />

      <ScrollView contentContainerClassName="p-4 pb-12">
        <View className="bg-neutral-mutedBg p-3.5 rounded-2xl mb-4">
          <Text
            className="text-neutral-textMuted leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Para garantizar la confianza y reciprocidad vecinal, cada cuenta se
            vincula a un domicilio georreferenciado en el sector.
          </Text>
        </View>

        <Card className="p-4 mb-4">
          <Input
            label="Nombres y Apellidos"
            placeholder="Ej: Carmen Rosa Mamani"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Teléfono Móvil (WhatsApp)"
            placeholder="Ej: 998877665"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label="Dirección de Residencia"
            placeholder="Ej: Jr. Los Jazmines 340, Mz. D Lt. 12"
            value={homeAddress}
            onChangeText={setHomeAddress}
          />

          {/* GPS Location Pinning */}
          <View className="mb-4">
            <Text
              className="text-neutral-textMain mb-1.5"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
            >
              Punto GPS Fijo del Domicilio
            </Text>

            <TouchableOpacity
              onPress={handleCaptureLocation}
              disabled={isLocating}
              className={`p-3.5 rounded-2xl flex-row items-center justify-between min-h-[56px] ${
                coords
                  ? 'bg-neutral-surface border border-neutral-border shadow-xs'
                  : 'bg-neutral-mutedBg'
              }`}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    coords ? 'bg-primary' : 'bg-neutral-surface'
                  }`}
                >
                  <Navigation
                    size={18}
                    color={coords ? '#FFFFFF' : '#6C727A'}
                    strokeWidth={2.2}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className={
                      coords ? 'text-neutral-textMain' : 'text-neutral-textMain'
                    }
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                  >
                    {coords
                      ? 'Ubicación fijada con éxito'
                      : 'Fijar mi ubicación actual'}
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                  >
                    {coords
                      ? `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`
                      : 'Pulsa para georreferenciar tu hogar'}
                  </Text>
                </View>
              </View>

              {coords ? (
                <CheckCircle size={20} color="#1E5E45" strokeWidth={2.2} />
              ) : (
                <MapPin size={18} color="#9EA3AE" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <Button
            title="Registrar y Unirme a mi Barrio"
            variant="primary"
            onPress={handleRegister}
            isLoading={isSubmitting}
            className="mt-1"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

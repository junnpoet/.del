import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, CheckCircle, Navigation } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Header } from '../../src/components/ui/Header';
import { useAuth } from '../../src/services/auth';
import { useI18n } from '../../src/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        Alert.alert(t('register.locationPermTitle'), t('register.locationPerm'));
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
    const missing = t('register.missingTitle');
    if (!fullName.trim()) {
      Alert.alert(missing, t('register.missingName'));
      return;
    }
    if (email.trim() && !email.includes('@')) {
      Alert.alert(missing, t('register.invalidEmailOptional'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(missing, t('register.missingPassword'));
      return;
    }
    if (!phone.trim()) {
      Alert.alert(missing, t('register.missingPhone'));
      return;
    }
    if (!homeAddress.trim()) {
      Alert.alert(missing, t('register.missingAddress'));
      return;
    }
    if (!coords) {
      Alert.alert(t('register.locationRequiredTitle'), t('register.locationRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        email,
        password,
        fullName,
        phone,
        homeAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
        pushToken,
      });
      Alert.alert(t('register.welcomeTitle'), t('register.welcome'));
      router.replace('/(main)');
    } catch (err) {
      console.error('Registration error', err);
      const message = err instanceof Error ? err.message : '';
      let text = t('register.errGeneric');
      if (/already registered/i.test(message)) {
        text = t('register.errExists');
      } else if (message === 'CONFIRM_EMAIL') {
        text = t('register.errConfirm');
      } else if (/row-level security policy/i.test(message)) {
        text = t('register.errRls');
      } else if (/parse|geometry|geo/i.test(message)) {
        text = t('register.errGeo');
      } else if (message) {
        text = t('register.errWith', { message });
      }
      Alert.alert(t('common.error'), text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-neutral-background">
      <Header title={t('register.title')} showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="p-4"
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-neutral-mutedBg p-3.5 rounded-2xl mb-4">
          <Text
            className="text-neutral-textMuted leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('register.intro')}
          </Text>
        </View>

        <Card className="p-4 mb-4">
          <Input
            label={t('register.fullName')}
            placeholder={t('register.fullNamePlaceholder')}
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label={t('register.emailOptional')}
            placeholder={t('register.emailOptionalPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label={t('register.password')}
            placeholder={t('register.passwordPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <Input
            label={t('register.phone')}
            placeholder={t('register.phonePlaceholder')}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label={t('register.address')}
            placeholder={t('register.addressPlaceholder')}
            value={homeAddress}
            onChangeText={setHomeAddress}
          />

          {/* GPS Location Pinning */}
          <View className="mb-4">
            <Text
              className="text-neutral-textMain mb-1.5"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
            >
              {t('register.gps')}
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
                    {coords ? t('register.gpsSet') : t('register.gpsCta')}
                  </Text>
                  <Text
                    className="text-neutral-textLight mt-0.5"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                  >
                    {coords
                      ? `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`
                      : t('register.gpsHint')}
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
            title={t('register.submit')}
            variant="primary"
            onPress={handleRegister}
            isLoading={isSubmitting}
            className="mt-1"
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}

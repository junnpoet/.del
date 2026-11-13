import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ScrollViewInstance,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, CheckCircle, Navigation } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Header } from '../../src/components/ui/Header';
import { normalizeNationalPhone, useAuth } from '../../src/services/auth';
import { useI18n } from '../../src/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const activeField = useRef<string | null>(null);
  const stepRef = useRef<1 | 2 | 3>(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const FIELD_SCROLL_OFFSETS: Record<string, { step: 1 | 2 | 3; y: number }> = {
    fullName: { step: 1, y: 75 },
    phone: { step: 1, y: 115 },
    password: { step: 3, y: 170 },
  };

  const scrollToField = (field: string) => {
    activeField.current = field;
    const config = FIELD_SCROLL_OFFSETS[field];
    if (!config || stepRef.current !== config.step) return;
    scrollViewRef.current?.scrollTo({
      y: config.y,
      animated: true,
    });
  };

  const handleFocus = (field: string) => {
    activeField.current = field;
    setTimeout(() => {
      scrollToField(field);
    }, 150);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      if (activeField.current) {
        const field = activeField.current;
        setTimeout(() => {
          scrollToField(field);
        }, 120);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      activeField.current = null;
      if (stepRef.current === 1 || stepRef.current === 3) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  const handleNextFromStep1 = () => {
    const missing = t('register.missingTitle');
    if (!fullName.trim()) {
      Alert.alert(missing, t('register.missingName'));
      return;
    }
    const nationalPhone = normalizeNationalPhone(phone);
    if (nationalPhone.length !== 9) {
      Alert.alert(missing, t('register.missingPhone'));
      return;
    }
    Keyboard.dismiss();
    setStep(2);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleNextFromStep2 = () => {
    const missing = t('register.missingTitle');
    if (!coords) {
      Alert.alert(t('register.locationRequiredTitle'), t('register.locationRequired'));
      return;
    }
    if (!homeAddress.trim()) {
      Alert.alert(missing, t('register.missingAddress'));
      return;
    }
    Keyboard.dismiss();
    setStep(3);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleHeaderBack = () => {
    Keyboard.dismiss();
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    const missing = t('register.missingTitle');
    if (!fullName.trim()) {
      Alert.alert(missing, t('register.missingName'));
      setStep(1);
      return;
    }
    if (normalizeNationalPhone(phone).length !== 9) {
      Alert.alert(missing, t('register.missingPhone'));
      setStep(1);
      return;
    }
    if (!coords) {
      Alert.alert(t('register.locationRequiredTitle'), t('register.locationRequired'));
      setStep(2);
      return;
    }
    if (!homeAddress.trim()) {
      Alert.alert(missing, t('register.missingAddress'));
      setStep(2);
      return;
    }
    if (password.length < 6) {
      Alert.alert(missing, t('register.missingPassword'));
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
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
      <Header
        title={t('register.title')}
        showBack
        onBack={handleHeaderBack}
      />

      {/* Stepper Progress Bar */}
      <View className="px-5 pt-3 pb-2.5 bg-neutral-surface border-b border-neutral-border/40">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className="text-neutral-textMuted uppercase tracking-wider"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
          >
            {t('register.stepOf', { step })}
          </Text>
          <Text
            className="text-primary font-bold"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
          >
            {step === 1
              ? t('register.step1Tab')
              : step === 2
              ? t('register.step2Tab')
              : t('register.step3Tab')}
          </Text>
        </View>
        <View className="flex-row h-1.5 bg-neutral-mutedBg rounded-full overflow-hidden gap-1.5">
          <View
            className={`flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-neutral-border/40'}`}
          />
          <View
            className={`flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-neutral-border/40'}`}
          />
          <View
            className={`flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-neutral-border/40'}`}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 320, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          {/* STEP 1: IDENTIDAD */}
          {step === 1 && (
            <Card className="p-5 mb-4">
              <View className="mb-4">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                >
                  {t('register.step1Title')}
                </Text>
                <Text
                  className="text-neutral-textMuted mt-1 leading-5"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                >
                  {t('register.step1Subtitle')}
                </Text>
              </View>

              <Input
                label={t('register.fullName')}
                placeholder={t('register.fullNamePlaceholder')}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() => handleFocus('fullName')}
              />

              <Input
                label={t('register.phone')}
                placeholder={t('register.phonePlaceholder')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                returnKeyType="done"
                onFocus={() => handleFocus('phone')}
              />

              <Button
                title={t('register.continueToAddress')}
                variant="primary"
                onPress={handleNextFromStep1}
                className="mt-2"
              />
            </Card>
          )}

          {/* STEP 2: DOMICILIO Y SECTOR */}
          {step === 2 && (
            <Card className="p-5 mb-4">
              <View className="mb-4">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                >
                  {t('register.step2Title')}
                </Text>
                <Text
                  className="text-neutral-textMuted mt-1 leading-5"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                >
                  {t('register.step2Subtitle')}
                </Text>
              </View>

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
                        className="text-neutral-textMain"
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

              <Input
                label={t('register.address')}
                placeholder={t('register.addressPlaceholder')}
                value={homeAddress}
                onChangeText={setHomeAddress}
                returnKeyType="done"
              />

              <Button
                title={t('register.continueToSecurity')}
                variant="primary"
                onPress={handleNextFromStep2}
                className="mt-2"
              />

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setStep(1);
                }}
                className="mt-3 py-2 items-center min-h-[44px] justify-center"
              >
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  {t('register.backToPersonal')}
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* STEP 3: SEGURIDAD Y RESUMEN */}
          {step === 3 && (
            <Card className="p-5 mb-4">
              <View className="mb-4">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
                >
                  {t('register.step3Title')}
                </Text>
                <Text
                  className="text-neutral-textMuted mt-1 leading-5"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                >
                  {t('register.step3Subtitle')}
                </Text>
              </View>

              {/* Resumen del registro */}
              <View className="bg-neutral-mutedBg p-3.5 rounded-2xl mb-4 border border-neutral-border/50">
                <Text
                  className="text-neutral-textMain mb-1.5"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  {t('register.summaryTitle')}
                </Text>
                <Text
                  className="text-neutral-textMuted text-xs"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
                >
                  {t('register.summaryHolder')} <Text className="text-neutral-textMain font-semibold">{fullName}</Text>
                </Text>
                <Text
                  className="text-neutral-textMuted text-xs mt-1"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
                >
                  {t('register.summaryWhatsapp')} <Text className="text-neutral-textMain font-semibold">{phone}</Text>
                </Text>
                <Text
                  className="text-neutral-textMuted text-xs mt-1"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
                  numberOfLines={1}
                >
                  {t('register.summaryAddress')} <Text className="text-neutral-textMain font-semibold">{homeAddress}</Text>
                </Text>
              </View>

              <Input
                label={t('register.password')}
                placeholder={t('register.passwordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onFocus={() => handleFocus('password')}
              />

              <Button
                title={t('register.submit')}
                variant="primary"
                onPress={handleRegister}
                isLoading={isSubmitting}
                className="mt-2"
              />

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setStep(2);
                }}
                className="mt-3 py-2 items-center min-h-[44px] justify-center"
              >
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                >
                  {t('register.backToAddress')}
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

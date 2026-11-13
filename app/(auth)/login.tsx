import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewInstance,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuth } from '../../src/services/auth';
import { isAccessibleModeEnabled } from '../../src/features/accessible-mode/storage';
import { useI18n } from '../../src/i18n';
import { LanguageMenuButton } from '../../src/i18n/LanguageToggle';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, requestOtp, signInWithOtp } = useAuth();
  const { t } = useI18n();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const activeField = useRef<string | null>(null);

  const scrollToField = (field: string) => {
    activeField.current = field;
    // Desplazamiento moderado: solo oculta parte del logo para mantener
    // visible toda la tarjeta (inputs, botón y "¿Olvidaste tu contraseña?")
    scrollViewRef.current?.scrollTo({
      y: 80,
      animated: true,
    });
  };

  const handleFocus = (field: string) => {
    activeField.current = field;
    setTimeout(() => {
      scrollToField(field);
    }, 80);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      if (activeField.current) {
        scrollToField(activeField.current);
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      activeField.current = null;
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert(t('common.attention'), t('login.missingPhoneOrPassword'));
      return;
    }
    setIsLoading(true);
    try {
      await signIn(phone, password);
      const accessible = await isAccessibleModeEnabled();
      router.replace(accessible ? '/accessible' : '/(main)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const invalid = /invalid login credentials/i.test(message);
      Alert.alert(
        t('common.error'),
        invalid
          ? t('login.invalidPhoneOrPassword')
          : t('login.failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      Alert.alert(t('common.attention'), t('login.missingPhone'));
      return;
    }
    setIsRequestingOtp(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
      Alert.alert(t('login.otpGenerated'), t('login.otpWhatsAppNotice'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unexpectedError');
      Alert.alert(t('common.attention'), msg);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!phone.trim() || !otpCode.trim()) {
      Alert.alert(t('common.attention'), t('login.missingOtp'));
      return;
    }
    setIsLoading(true);
    try {
      await signInWithOtp(phone, otpCode);
      const accessible = await isAccessibleModeEnabled();
      router.replace(accessible ? '/accessible' : '/(main)');
    } catch (err) {
      console.error('OTP error', err);
      Alert.alert(t('common.error'), t('login.otpInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-background">
      <View className="items-end px-5 pt-2 z-20">
        <LanguageMenuButton />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerClassName="p-6 justify-center flex-grow"
          contentContainerStyle={{ paddingBottom: 220, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
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
              {t('brand.subtitle')}
            </Text>
          </View>

          <Card className="p-5 mb-6">
            <Text
              className="text-neutral-textMain mb-4"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }}
            >
              {mode === 'password' ? t('login.title') : t('login.otpTitle')}
            </Text>

            <Input
              label={t('login.phone')}
              placeholder={t('login.phonePlaceholder')}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => handleFocus('phone')}
            />

            {mode === 'password' ? (
              <>
                <Input
                  label={t('login.password')}
                  placeholder={t('login.passwordPlaceholder')}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => handleFocus('password')}
                  rightAccessory={
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6C727A" />
                      ) : (
                        <Eye size={20} color="#6C727A" />
                      )}
                    </TouchableOpacity>
                  }
                />

                <Button
                  title={t('login.submit')}
                  variant="primary"
                  onPress={handleLogin}
                  isLoading={isLoading}
                  className="mt-2"
                />

                <TouchableOpacity
                  onPress={() => {
                    setMode('otp');
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className="mt-4 items-center py-2 min-h-[44px] justify-center"
                >
                  <Text
                    className="text-primary-emeraldDark"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                  >
                    {t('login.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {otpSent && (
                  <Input
                    label={t('login.otpCode')}
                    placeholder={t('login.otpCodePlaceholder')}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    onFocus={() => handleFocus('otpCode')}
                  />
                )}

                {otpSent ? (
                  <Button
                    title={t('login.verifyOtp')}
                    variant="primary"
                    onPress={handleVerifyOtp}
                    isLoading={isLoading}
                    className="mt-2"
                  />
                ) : (
                  <Button
                    title={t('login.sendOtp')}
                    variant="primary"
                    onPress={handleRequestOtp}
                    isLoading={isRequestingOtp}
                    className="mt-2"
                  />
                )}

                {otpSent && (
                  <TouchableOpacity
                    onPress={handleRequestOtp}
                    disabled={isRequestingOtp}
                    className="mt-3 items-center py-1.5 min-h-[44px] justify-center"
                  >
                    <Text
                      className="text-neutral-textMuted"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                    >
                      {isRequestingOtp ? t('login.resending') : t('login.resendOtp')}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setMode('password')}
                  className="mt-4 items-center py-2 border-t border-neutral-border/60 min-h-[44px] justify-center"
                >
                  <Text
                    className="text-neutral-textMuted"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                  >
                    {t('login.backToPassword')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>

          <View className="items-center mb-4">
            <Text
              className="text-neutral-textMuted mb-2.5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
            >
              {t('login.noAccount')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="min-h-[46px] items-center justify-center px-5 bg-neutral-mutedBg rounded-2xl"
            >
              <Text
                className="text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                {t('login.createAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

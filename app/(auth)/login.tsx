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
import { useI18n } from '../../src/i18n';
import { LanguageToggle } from '../../src/i18n/LanguageToggle';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('common.attention'), t('login.missing'));
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(main)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      const invalid = /invalid login credentials/i.test(message);
      Alert.alert(t('common.error'), invalid ? t('login.invalid') : t('login.failed'));
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
              {t('brand.subtitle')}
            </Text>
          </View>

          <Card className="p-5 mb-6">
            <Text
              className="text-neutral-textMain mb-4"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }}
            >
              {t('login.title')}
            </Text>

            <Input
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label={t('login.password')}
              placeholder={t('login.passwordPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            <Button
              title={t('login.submit')}
              variant="primary"
              onPress={handleLogin}
              isLoading={isLoading}
              className="mt-2"
            />
          </Card>

          <View className="items-center mb-6">
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

          {/* Selector de idioma también antes de iniciar sesión */}
          <Card className="p-4">
            <LanguageToggle />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

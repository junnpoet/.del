import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldAlert, CheckCircle } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { useI18n } from '../../src/i18n';

export default function OnboardingStep3() {
  const router = useRouter();
  const { t } = useI18n();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      router.replace('/(auth)/register');
    } catch (err) {
      console.error('Error saving onboarding flag', err);
      router.replace('/(auth)/register');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
          <View className="w-6 h-1.5 rounded-full bg-neutral-textMain" />
        </View>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto px-4">
        <View className="w-24 h-24 rounded-3xl bg-neutral-mutedBg items-center justify-center mb-6">
          <ShieldAlert size={40} color="#DC2626" strokeWidth={2} />
        </View>

        <Text
          className="text-neutral-textMain text-center mb-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26 }}
        >
          {t('onboarding.s3.title')}
        </Text>

        <Text
          className="text-neutral-textMuted text-center leading-6"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
        >
          {t('onboarding.s3.body')}
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-4">
        <Button
          title={t('onboarding.s3.start')}
          variant="primary"
          onPress={handleFinish}
          icon={<CheckCircle size={18} color="#FFFFFF" strokeWidth={2} />}
        />
      </View>
    </SafeAreaView>
  );
}

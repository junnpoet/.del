import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { useI18n } from '../../src/i18n';

export default function OnboardingStep1() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator & skip */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-row items-center gap-1.5">
          <View className="w-6 h-1.5 rounded-full bg-neutral-textMain" />
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
        </View>
        <Text
          onPress={() => router.push('/(onboarding)/step3')}
          className="text-neutral-textMuted py-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
        >
          {t('common.skip')}
        </Text>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto px-4">
        <View className="w-24 h-24 rounded-3xl bg-neutral-mutedBg items-center justify-center mb-6">
          <MapPin size={40} color="#1E5E45" strokeWidth={2} />
        </View>

        <Text
          className="text-neutral-textMain text-center mb-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26 }}
        >
          {t('onboarding.s1.title')}
        </Text>

        <Text
          className="text-neutral-textMuted text-center leading-6"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
        >
          {t('onboarding.s1.body')}
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-4">
        <Button
          title={t('common.next')}
          variant="primary"
          onPress={() => router.push('/(onboarding)/step2')}
          icon={<ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />}
        />
      </View>
    </SafeAreaView>
  );
}

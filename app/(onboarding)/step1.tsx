import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator & skip */}
      <View className="flex-row items-center justify-between pt-3">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-3 rounded-full bg-primary" />
          <View className="w-3 h-3 rounded-full bg-neutral-border" />
          <View className="w-3 h-3 rounded-full bg-neutral-border" />
        </View>
        <View className="bg-neutral-mutedBg px-4 py-2 rounded-2xl border border-neutral-border">
          <Text
            onPress={() => router.push('/(onboarding)/step3')}
            className="text-neutral-textMain"
            style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
          >
            Saltar
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto px-2">
        <View className="w-36 h-36 rounded-full bg-primary-pastel border-4 border-primary-light/60 items-center justify-center mb-8 shadow-sm">
          <MapPin size={68} color="#1B4332" strokeWidth={2.5} />
        </View>

        <Text
          className="text-neutral-textMain text-center mb-4"
          style={{ fontFamily: 'Nunito_900Black', fontSize: 34 }}
        >
          Tu barrio a pie
        </Text>

        <Text
          className="text-neutral-textMuted text-center leading-7"
          style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 19 }}
        >
          Descubre oficios independientes, gasfiteros, costureras y apoyo mutuo
          a menos de 10 minutos caminando de tu puerta.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-4">
        <Button
          title="Siguiente"
          variant="primary"
          onPress={() => router.push('/(onboarding)/step2')}
          icon={<ArrowRight size={24} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>
    </SafeAreaView>
  );
}

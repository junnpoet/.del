import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator & skip */}
      <View className="flex-row items-center justify-between pt-4">
        <View className="flex-row space-x-2">
          <View className="w-8 h-2 rounded-full bg-primary" />
          <View className="w-2 h-2 rounded-full bg-neutral-border ml-2" />
          <View className="w-2 h-2 rounded-full bg-neutral-border ml-2" />
        </View>
        <Text
          onPress={() => router.push('/(onboarding)/step3')}
          className="text-sm font-semibold text-neutral-textMuted py-2 px-1"
        >
          Saltar
        </Text>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto">
        <View className="w-28 h-28 rounded-full bg-primary/10 items-center justify-center mb-6">
          <MapPin size={56} color="#2D6A4F" strokeWidth={2.2} />
        </View>

        <Text className="text-3xl font-extrabold text-neutral-textMain text-center mb-3">
          Tu barrio a pie
        </Text>

        <Text className="text-base text-neutral-textMuted text-center px-4 leading-6">
          Descubre oficios independientes, gasfiteros, costureras y apoyo mutuo
          a menos de 10 minutos caminando de tu puerta.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-6">
        <Button
          title="Siguiente"
          variant="primary"
          onPress={() => router.push('/(onboarding)/step2')}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

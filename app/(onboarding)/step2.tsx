import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';

export default function OnboardingStep2() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator */}
      <View className="flex-row items-center justify-between pt-4">
        <View className="flex-row space-x-2">
          <View className="w-2 h-2 rounded-full bg-neutral-border" />
          <View className="w-8 h-2 rounded-full bg-primary ml-2" />
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
        <View className="w-28 h-28 rounded-full bg-earth/20 items-center justify-center mb-6">
          <Mic size={56} color="#7F5539" strokeWidth={2.2} />
        </View>

        <Text className="text-3xl font-extrabold text-neutral-textMain text-center mb-3">
          Publica en 3 toques
        </Text>

        <Text className="text-base text-neutral-textMuted text-center px-4 leading-6">
          ¿No tienes tiempo de escribir o se te dificulta teclear? Graba una
          nota de voz y nuestra IA estructurará tu pedido de auxilio o servicio
          en segundos.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-6">
        <Button
          title="Siguiente"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/step3')}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

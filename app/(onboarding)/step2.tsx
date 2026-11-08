import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';

export default function OnboardingStep2() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-background justify-between p-6">
      {/* Top indicator */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
          <View className="w-6 h-1.5 rounded-full bg-neutral-textMain" />
          <View className="w-1.5 h-1.5 rounded-full bg-neutral-border" />
        </View>
        <Text
          onPress={() => router.push('/(onboarding)/step3')}
          className="text-neutral-textMuted py-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
        >
          Saltar
        </Text>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto px-4">
        <View className="w-24 h-24 rounded-3xl bg-neutral-mutedBg items-center justify-center mb-6">
          <Mic size={40} color="#1A1D20" strokeWidth={2} />
        </View>

        <Text
          className="text-neutral-textMain text-center mb-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26 }}
        >
          Publica en 3 pasos
        </Text>

        <Text
          className="text-neutral-textMuted text-center leading-6"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15 }}
        >
          ¿Prefieres dictar? Graba una nota de voz y nuestra IA organizará tu pedido
          de auxilio o servicio en segundos.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-4">
        <Button
          title="Siguiente"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/step3')}
          icon={<ArrowRight size={18} color="#1A1D20" strokeWidth={2} />}
        />
      </View>
    </SafeAreaView>
  );
}

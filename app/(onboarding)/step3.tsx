import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldAlert, CheckCircle } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';

export default function OnboardingStep3() {
  const router = useRouter();

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
      <View className="flex-row items-center justify-between pt-3">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-neutral-border" />
          <View className="w-3 h-3 rounded-full bg-neutral-border" />
          <View className="w-10 h-3 rounded-full bg-primary" />
        </View>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto px-2">
        <View className="w-36 h-36 rounded-full bg-emergency-pastel border-4 border-emergency-alert/40 items-center justify-center mb-8 shadow-sm">
          <ShieldAlert size={68} color="#E03131" strokeWidth={2.5} />
        </View>

        <Text
          className="text-neutral-textMain text-center mb-4"
          style={{ fontFamily: 'Nunito_900Black', fontSize: 34 }}
        >
          Red protectora y SOS
        </Text>

        <Text
          className="text-neutral-textMuted text-center leading-7"
          style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 19 }}
        >
          Frente a emergencias o vulnerabilidad, activamos la red barrial de
          padrinos y apoyo mutuo. Nadie se queda solo en Sumayni.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-4">
        <Button
          title="Empezar en mi Barrio"
          variant="primary"
          onPress={handleFinish}
          icon={<CheckCircle size={24} color="#FFFFFF" strokeWidth={2.5} />}
        />
      </View>
    </SafeAreaView>
  );
}

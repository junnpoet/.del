import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
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
      <View className="flex-row items-center justify-between pt-4">
        <View className="flex-row space-x-2">
          <View className="w-2 h-2 rounded-full bg-neutral-border" />
          <View className="w-2 h-2 rounded-full bg-neutral-border ml-2" />
          <View className="w-8 h-2 rounded-full bg-primary ml-2" />
        </View>
      </View>

      {/* Main Content */}
      <View className="items-center my-auto">
        <View className="w-28 h-28 rounded-full bg-emergency-alert/15 items-center justify-center mb-6">
          <ShieldAlert size={56} color="#D90429" strokeWidth={2.2} />
        </View>

        <Text className="text-3xl font-extrabold text-neutral-textMain text-center mb-3">
          Red protectora y SOS
        </Text>

        <Text className="text-base text-neutral-textMuted text-center px-4 leading-6">
          Frente a emergencias o vulnerabilidad, activamos la red barrial de
          padrinos y apoyo mutuo. Nadie se queda solo en Sumayni.
        </Text>
      </View>

      {/* Bottom Action */}
      <View className="pb-6">
        <Button
          title="Empezar en mi Barrio"
          variant="primary"
          onPress={handleFinish}
          icon={<CheckCircle size={20} color="#FFFFFF" />}
        />
      </View>
    </SafeAreaView>
  );
}

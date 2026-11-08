import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Flame,
  Activity,
  HeartPulse,
  MapPin,
  ChevronLeft,
  PhoneCall,
  Volume2,
} from 'lucide-react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';

export default function EmergencyBoardScreen() {
  const router = useRouter();
  const [sosActive, setSosActive] = useState(false);

  const handleTriggerSOS = () => {
    Alert.alert(
      '¿Activar Alerta SOS Vecinal?',
      'Esta señal notificará de inmediato a tus Padrinos asignados y a la dirigencia de tu sector con tu ubicación GPS.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'EMITIR SOS AHORA',
          style: 'destructive',
          onPress: () => {
            setSosActive(true);
            Alert.alert(
              'Alerta SOS Emitida',
              'Tus padrinos y vecinos coordinadores han sido notificados.'
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-emergency-background">
      {/* Top Banner */}
      <View className="px-5 pt-8 pb-4 bg-emergency-background border-b border-emergency-alert/30">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver al modo normal"
            onPress={() => router.back()}
            className="flex-row items-center min-h-[48px] px-2 -ml-2"
          >
            <ChevronLeft size={24} color="#FFFFFF" />
            <Text className="text-white text-xs font-semibold ml-1">
              Modo Cotidiano
            </Text>
          </TouchableOpacity>

          <View className="bg-emergency-alert px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-black tracking-widest uppercase">
              MODO CONTINGENCIA
            </Text>
          </View>
        </View>

        <Text className="text-2xl font-black text-white mt-3">
          Tablero de Ayuda Humanitaria
        </Text>
        <Text className="text-xs text-emergency-warning font-semibold mt-1">
          Sector 4 · San Martín de Porres · Alerta Barrial
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-20">
        {/* SOS Central Button */}
        <View className="items-center my-4">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Botón central de auxilio SOS"
            onPress={handleTriggerSOS}
            activeOpacity={0.8}
            className={`w-36 h-36 rounded-full items-center justify-center border-4 ${
              sosActive
                ? 'bg-emergency-warning border-white animate-pulse'
                : 'bg-emergency-alert border-white/60 shadow-2xl'
            }`}
          >
            <AlertTriangle size={48} color="#FFFFFF" strokeWidth={2.5} />
            <Text className="text-white font-black text-xl mt-1 tracking-wider">
              {sosActive ? 'ENVIADO' : 'SOS'}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-neutral-border text-center mt-3 max-w-[260px]">
            Presiona para pedir auxilio médico, seguridad o apoyo inmediato a tu red de padrinos.
          </Text>
        </View>

        {/* Safe Zones & First Aid */}
        <Text className="text-sm font-bold text-white uppercase tracking-wider mb-3 mt-2">
          Puntos Seguros y Auxilio en el Sector
        </Text>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <MapPin size={18} color="#2B9348" />
            <Text className="text-base font-bold text-white ml-2">
              Losa Deportiva Los Jazmines (Zona Segura)
            </Text>
          </View>
          <Text className="text-xs text-neutral-border">
            Punto de concentración vecinal libre de cables y postes. A 150m de tu domicilio.
          </Text>
        </Card>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <HeartPulse size={18} color="#D90429" />
            <Text className="text-base font-bold text-white ml-2">
              Botiquín Comunitario & Desfibrilador
            </Text>
          </View>
          <Text className="text-xs text-neutral-border">
            Custodiado por: Familia Mendoza (Jr. Los Jazmines 310 - Mz. D Lt. 4).
          </Text>
        </Card>

        <Card variant="emergency" className="mb-4 p-4">
          <View className="flex-row items-center mb-1">
            <PhoneCall size={18} color="#F77F00" />
            <Text className="text-base font-bold text-white ml-2">
              Central Telefónica Rápida
            </Text>
          </View>
          <Text className="text-xs text-neutral-border mb-2">
            Comisaría del sector: 105 | Bomberos: 116 | SAMU: 106
          </Text>
        </Card>

        <Button
          title="Regresar a Modo Cotidiano"
          variant="outline"
          onPress={() => router.back()}
          className="border-neutral-border"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

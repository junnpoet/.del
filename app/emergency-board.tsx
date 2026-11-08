import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <View className="px-5 pt-3 pb-4 bg-emergency-background border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver al modo normal"
            onPress={() => router.back()}
            className="flex-row items-center min-h-[40px] px-3 py-1.5 bg-white/10 rounded-xl"
          >
            <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              className="text-white ml-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              Modo Cotidiano
            </Text>
          </TouchableOpacity>

          <View className="bg-emergency-alert/20 px-3 py-1 rounded-full">
            <Text
              className="text-emergency-alert uppercase"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
            >
              CONTINGENCIA
            </Text>
          </View>
        </View>

        <Text
          className="text-white mt-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}
        >
          Tablero de Ayuda Humanitaria
        </Text>
        <Text
          className="text-emergency-warning mt-0.5"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          Sector 4 · San Martín de Porres · Alerta Barrial
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-20">
        {/* SOS Central Button */}
        <View className="items-center my-4">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Botón central de auxilio SOS"
            onPress={handleTriggerSOS}
            activeOpacity={0.85}
            className={`w-32 h-32 rounded-full items-center justify-center shadow-xl ${
              sosActive
                ? 'bg-emergency-warning'
                : 'bg-emergency-alert shadow-emergency-alert/30'
            }`}
          >
            <AlertTriangle size={36} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              className="text-white mt-1 tracking-wider"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
            >
              {sosActive ? 'ENVIADO' : 'SOS'}
            </Text>
          </TouchableOpacity>
          <Text
            className="text-white/60 text-center mt-3 px-4 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Presiona para pedir auxilio médico, seguridad o apoyo inmediato a tu red de padrinos.
          </Text>
        </View>

        {/* Safe Zones & First Aid */}
        <Text
          className="text-white uppercase tracking-wider mb-2.5 mt-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
        >
          Puntos Seguros y Auxilio en el Sector
        </Text>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <MapPin size={18} color="#16A34A" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Losa Deportiva Los Jazmines (Zona Segura)
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Punto de concentración vecinal libre de cables y postes. A 150m de tu domicilio.
          </Text>
        </Card>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <HeartPulse size={18} color="#EF4444" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Botiquín Comunitario y Desfibrilador
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            Custodiado por: Familia Mendoza (Jr. Los Jazmines 310 - Mz. D Lt. 4).
          </Text>
        </Card>

        <Card variant="emergency" className="mb-4 p-4">
          <View className="flex-row items-center mb-1">
            <PhoneCall size={18} color="#F59E0B" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Central Telefónica Rápida
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            Comisaría del sector: 105 · Bomberos: 116 · SAMU: 106
          </Text>
        </Card>

        <Button
          title="Regresar a Modo Cotidiano"
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

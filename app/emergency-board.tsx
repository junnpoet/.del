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
      <View className="px-5 pt-4 pb-5 bg-emergency-background border-b-2 border-emergency-alert/40">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver al modo normal"
            onPress={() => router.back()}
            className="flex-row items-center min-h-[48px] px-3.5 py-2 bg-white/10 rounded-2xl"
          >
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              className="text-white ml-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
            >
              Modo Cotidiano
            </Text>
          </TouchableOpacity>

          <View className="bg-emergency-alert px-3.5 py-1.5 rounded-2xl">
            <Text
              className="text-white uppercase"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 13 }}
            >
              CONTINGENCIA
            </Text>
          </View>
        </View>

        <Text
          className="text-white mt-4"
          style={{ fontFamily: 'Nunito_900Black', fontSize: 28 }}
        >
          Tablero de Ayuda Humanitaria
        </Text>
        <Text
          className="text-emergency-warning mt-1"
          style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}
        >
          Sector 4 · San Martín de Porres · Alerta Barrial
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-5 pb-20">
        {/* SOS Central Button */}
        <View className="items-center my-5">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Botón central de auxilio SOS"
            onPress={handleTriggerSOS}
            activeOpacity={0.8}
            className={`w-44 h-44 rounded-full items-center justify-center border-4 ${
              sosActive
                ? 'bg-emergency-warning border-white'
                : 'bg-emergency-alert border-emergency-pastel shadow-2xl'
            }`}
          >
            <AlertTriangle size={56} color="#FFFFFF" strokeWidth={2.8} />
            <Text
              className="text-white mt-1.5 tracking-wider"
              style={{ fontFamily: 'Nunito_900Black', fontSize: 24 }}
            >
              {sosActive ? 'ENVIADO' : 'SOS'}
            </Text>
          </TouchableOpacity>
          <Text
            className="text-neutral-border text-center mt-4 px-4 leading-6"
            style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16 }}
          >
            Presiona para pedir auxilio médico, seguridad o apoyo inmediato a tu red de padrinos.
          </Text>
        </View>

        {/* Safe Zones & First Aid */}
        <Text
          className="text-white uppercase tracking-wider mb-3.5 mt-2"
          style={{ fontFamily: 'Nunito_900Black', fontSize: 17 }}
        >
          Puntos Seguros y Auxilio en el Sector
        </Text>

        <Card variant="emergency" className="mb-4 p-5">
          <View className="flex-row items-center mb-2">
            <MapPin size={24} color="#52B788" strokeWidth={2.5} />
            <Text
              className="text-white ml-2.5 flex-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
            >
              Losa Deportiva Los Jazmines (Zona Segura)
            </Text>
          </View>
          <Text
            className="text-neutral-border leading-6"
            style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16 }}
          >
            Punto de concentración vecinal libre de cables y postes. A 150m de tu domicilio.
          </Text>
        </Card>

        <Card variant="emergency" className="mb-4 p-5">
          <View className="flex-row items-center mb-2">
            <HeartPulse size={24} color="#FF8787" strokeWidth={2.5} />
            <Text
              className="text-white ml-2.5 flex-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
            >
              Botiquín Comunitario y Desfibrilador
            </Text>
          </View>
          <Text
            className="text-neutral-border leading-6"
            style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 16 }}
          >
            Custodiado por: Familia Mendoza (Jr. Los Jazmines 310 - Mz. D Lt. 4).
          </Text>
        </Card>

        <Card variant="emergency" className="mb-6 p-5">
          <View className="flex-row items-center mb-2">
            <PhoneCall size={24} color="#FCD34D" strokeWidth={2.5} />
            <Text
              className="text-white ml-2.5 flex-1"
              style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
            >
              Central Telefónica Rápida
            </Text>
          </View>
          <Text
            className="text-neutral-border leading-6"
            style={{ fontFamily: 'Nunito_700Bold', fontSize: 16 }}
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Vibration,
} from 'react-native';
import {
  AlertTriangle,
  Flame,
  Activity,
  Droplets,
  ZapOff,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';

export type EmergencyEventType =
  | 'SISMO_TERREMOTO'
  | 'INUNDACION_HUAICO'
  | 'INCENDIO'
  | 'CORTE_SERVICIOS';

interface SlideToActivateProps {
  groupId?: string;
  isDirigente: boolean;
  onActivated?: (eventType: EmergencyEventType) => void;
}

const EVENT_OPTIONS: {
  type: EmergencyEventType;
  label: string;
  description: string;
  icon: any;
  color: string;
}[] = [
  {
    type: 'SISMO_TERREMOTO',
    label: 'Sismo / Terremoto',
    description: 'Evacuación y concentración en losas seguras',
    icon: Activity,
    color: '#DC2626',
  },
  {
    type: 'INUNDACION_HUAICO',
    label: 'Inundación / Huaico',
    description: 'Riesgo fluvial y bloqueo de accesos barriales',
    icon: Droplets,
    color: '#2563EB',
  },
  {
    type: 'INCENDIO',
    label: 'Incendio Urbano',
    description: 'Llamado a bomberos y corte de gas en el sector',
    icon: Flame,
    color: '#D97706',
  },
  {
    type: 'CORTE_SERVICIOS',
    label: 'Corte Masivo de Agua/Luz',
    description: 'Coordinación comunitaria de puntos de abastecimiento',
    icon: ZapOff,
    color: '#7C3AED',
  },
];

export function SlideToActivate({
  groupId,
  isDirigente,
  onActivated,
}: SlideToActivateProps) {
  const { session } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyEventType>('SISMO_TERREMOTO');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pan Responder para el deslizador
  const slideX = useRef(new Animated.Value(0)).current;
  const maxSlide = 220; // Ancho aproximado del track

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= maxSlide) {
          slideX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxSlide * 0.75) {
          // Completó el deslizamiento
          Animated.timing(slideX, {
            toValue: maxSlide,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            Vibration.vibrate(100);
            setModalVisible(true);
            slideX.setValue(0);
          });
        } else {
          // Regresa al inicio
          Animated.spring(slideX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Manejo de la cuenta regresiva antierror de 5 segundos
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      // Activar emergencia definitivamente
      executeActivation(selectedType);
      setCountdown(null);
      setModalVisible(false);
    }
  }, [countdown, selectedType]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const executeActivation = async (eventType: EmergencyEventType) => {
    try {
      if (groupId) {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || session?.user?.id || '00000000-0000-0000-0000-000000000000';
        await supabase.from('emergency_events').insert({
          group_id: groupId,
          event_type: eventType,
          description: `Activación de contingencia vecinal: ${eventType}`,
          status: 'ACTIVE',
          activated_by: userId,
        });
      }
    } catch (err) {
      console.warn('Simulando activación local sin backend:', err);
    }

    onActivated?.(eventType);
  };

  if (!isDirigente) return null;

  return (
    <View className="my-3">
      {/* Track Deslizador */}
      <View className="bg-red-950/80 border border-red-500/40 rounded-2xl p-2 relative h-16 justify-center overflow-hidden shadow-lg">
        <View className="absolute inset-0 items-center justify-center flex-row">
          <Text
            className="text-red-300 font-bold text-sm tracking-wider uppercase ml-10"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            Desliza para Activar Emergencia ➔
          </Text>
        </View>

        {/* Thumb Deslizable */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX: slideX }],
          }}
          className="w-12 h-12 bg-emergency-alert rounded-xl items-center justify-center shadow-md z-10"
        >
          <ShieldAlert size={24} color="#FFFFFF" />
        </Animated.View>
      </View>

      {/* Modal Selector de Tipo de Evento & Cuenta Regresiva */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          cancelCountdown();
          setModalVisible(false);
        }}
      >
        <View className="flex-1 bg-black/80 items-center justify-end p-4">
          <View className="w-full max-w-lg bg-[#1E2126] border border-red-500/30 rounded-3xl p-5 shadow-2xl">
            {countdown !== null ? (
              /* Cuenta Regresiva Antierror de 5 segundos */
              <View className="items-center py-6">
                <View className="w-24 h-24 rounded-full border-4 border-emergency-alert items-center justify-center mb-4 bg-red-950/50">
                  <Text
                    className="text-white text-5xl font-black"
                    style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                  >
                    {countdown}
                  </Text>
                </View>

                <Text
                  className="text-white text-lg font-bold text-center"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                >
                  Activando Modo Emergencia Barrial
                </Text>
                <Text
                  className="text-red-300 text-sm text-center mt-1 px-4"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
                >
                  Se notificará a todos los vecinos y se activará el Tablero de Ayuda Humanitaria en 5 segundos.
                </Text>

                <TouchableOpacity
                  onPress={cancelCountdown}
                  activeOpacity={0.8}
                  className="mt-6 w-full py-4 bg-white/10 border border-white/20 rounded-2xl items-center"
                >
                  <Text
                    className="text-white font-bold text-base"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                  >
                    CANCELAR INMEDIATAMENTE
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Selector de Tipo de Contingencia */
              <>
                <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <View className="flex-row items-center">
                    <AlertTriangle size={22} color="#EF4444" />
                    <Text
                      className="text-white font-bold text-base ml-2"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                    >
                      Selecciona Tipo de Contingencia
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="p-1 rounded-full bg-white/10"
                  >
                    <X size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View className="gap-2.5">
                  {EVENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedType === opt.type;
                    return (
                      <TouchableOpacity
                        key={opt.type}
                        onPress={() => setSelectedType(opt.type)}
                        activeOpacity={0.8}
                        className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <View className="flex-row items-center flex-1 pr-3">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${opt.color}25` }}
                          >
                            <Icon size={20} color={opt.color} />
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-white font-bold text-sm"
                              style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
                            >
                              {opt.label}
                            </Text>
                            <Text
                              className="text-white/60 text-xs mt-0.5"
                              style={{ fontFamily: 'PlusJakartaSans_400Regular' }}
                            >
                              {opt.description}
                            </Text>
                          </View>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? 'border-red-500 bg-red-500'
                              : 'border-white/30'
                          }`}
                        >
                          {isSelected && (
                            <View className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={startCountdown}
                  activeOpacity={0.85}
                  className="mt-5 w-full py-4 bg-emergency-alert rounded-2xl items-center shadow-lg"
                >
                  <Text
                    className="text-white font-black text-base uppercase tracking-wider"
                    style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
                  >
                    Iniciar Activación (5s)
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


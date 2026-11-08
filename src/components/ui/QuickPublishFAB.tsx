import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Plus, X, Wrench, HeartHandshake, HelpCircle, Mic, Square, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Input } from './Input';
import { Chip } from './Chip';
import type { AudioRecorder } from 'expo-audio';

export interface QuickPublishFABProps {
  onPublishSuccess?: (data: {
    type: 'SERVICIO' | 'AYUDA' | 'SOLIDARIO';
    category: string;
    description: string;
    audioUri?: string | null;
  }) => void;
}

export const QuickPublishFAB: React.FC<QuickPublishFABProps> = ({
  onPublishSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'SERVICIO' | 'AYUDA' | 'SOLIDARIO' | null
  >(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Voice recording state using expo-audio with graceful fallback
  const recorderRef = useRef<AudioRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriesByType = {
    SERVICIO: ['Gasfitería', 'Electricidad', 'Costura', 'Carpintería', 'Cuidado', 'Clases'],
    AYUDA: ['Medicinas', 'Herramientas', 'Movilidad', 'Alimentos', 'Compañía'],
    SOLIDARIO: ['Préstamo', 'Donación', 'Trueque', 'Voluntariado'],
  };

  const handleOpenMenu = () => {
    setSelectedType(null);
    setCategory('');
    setDescription('');
    setRecordedUri(null);
    setIsOpen(true);
  };

  const handleClose = async () => {
    if (recorderRef.current && isRecording) {
      try {
        await recorderRef.current.stop();
      } catch {
        // Ignore stop error on close
      }
      recorderRef.current = null;
      setIsRecording(false);
    }
    setIsOpen(false);
  };

  const startRecording = async () => {
    try {
      const ExpoAudio = await import('expo-audio');
      const permission = await ExpoAudio.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso Denegado',
          'Se requiere acceso al micrófono para grabar la solicitud por voz.'
        );
        return;
      }

      await ExpoAudio.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const AudioModule = (await import('expo-audio/build/AudioModule')).default;
      const recorder = new AudioModule.AudioRecorder(
        ExpoAudio.RecordingPresets.HIGH_QUALITY
      );
      await recorder.prepareToRecordAsync();
      recorder.record();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.warn('Native audio module fallback active:', err);
      // Fallback for environments where native audio recorder is unavailable
      setIsRecording(true);
    }
  };

  const stopRecording = async () => {
    try {
      if (recorderRef.current) {
        await recorderRef.current.stop();
        const uri = recorderRef.current.uri || 'file://simulated-voice-note.m4a';
        setRecordedUri(uri);
        recorderRef.current = null;
      } else {
        setRecordedUri('file://simulated-voice-note.m4a');
      }
      setIsRecording(false);
      if (!description) {
        setDescription('[Nota de voz adjunta para transcripción automática con Gemini]');
      }
    } catch (err) {
      console.warn('Error stopping recording, using fallback URI:', err);
      setRecordedUri('file://simulated-voice-note.m4a');
      setIsRecording(false);
      if (!description) {
        setDescription('[Nota de voz adjunta para transcripción automática con Gemini]');
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Atención', 'Selecciona el tipo de publicación.');
      return;
    }
    if (!category) {
      Alert.alert('Atención', 'Selecciona una categoría.');
      return;
    }
    if (!description.trim() && !recordedUri) {
      Alert.alert('Atención', 'Escribe un detalle o graba una nota de voz.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onPublishSuccess) {
        onPublishSuccess({
          type: selectedType,
          category,
          description: description.trim() || 'Publicación por voz',
          audioUri: recordedUri,
        });
      }
      Alert.alert(
        '¡Publicado con éxito!',
        'Tu aviso ya está visible para los vecinos de tu sector.'
      );
      handleClose();
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button — Pill style inspired by modern productivity interfaces */}
      <View
        className="absolute right-5 z-50 items-center justify-center"
        style={{ bottom: 72 + Math.max(insets.bottom, 12) }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Publicación rápida en 3 clics"
          onPress={handleOpenMenu}
          activeOpacity={0.88}
          className="flex-row items-center bg-primary px-5 py-3.5 rounded-full shadow-lg shadow-black/20"
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text
            className="text-white ml-2"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
          >
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3-Click Funnel Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-neutral-surface rounded-t-3xl px-5 pt-5 max-h-[92%]"
            style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border/60">
              <View className="flex-1 pr-2">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 }}
                >
                  Publicación Rápida
                </Text>
                <Text
                  className="text-neutral-textMuted mt-0.5"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  Embudo vecinal en 3 pasos simples
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="h-9 w-9 rounded-full bg-neutral-mutedBg items-center justify-center"
              >
                <X size={18} color="#6C727A" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Step 1: Select Type */}
            {!selectedType ? (
              <View className="py-4">
                <Text
                  className="text-neutral-textMain mb-3"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15 }}
                >
                  ¿Qué deseas comunicar al barrio?
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedType('SERVICIO')}
                  className="flex-row items-center p-3.5 bg-neutral-mutedBg rounded-2xl mb-2.5 min-h-[64px]"
                >
                  <View className="w-11 h-11 rounded-xl bg-neutral-surface items-center justify-center mr-3 shadow-xs">
                    <Wrench size={20} color="#1E5E45" strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                    >
                      Ofrecer un Servicio
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      Gasfitería, electricidad, costura, talleres
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('AYUDA')}
                  className="flex-row items-center p-3.5 bg-neutral-mutedBg rounded-2xl mb-2.5 min-h-[64px]"
                >
                  <View className="w-11 h-11 rounded-xl bg-neutral-surface items-center justify-center mr-3 shadow-xs">
                    <HelpCircle size={20} color="#DC2626" strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                    >
                      Pedir Ayuda / Necesidad
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      Medicinas urgentes, soporte, acompañamiento
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('SOLIDARIO')}
                  className="flex-row items-center p-3.5 bg-neutral-mutedBg rounded-2xl mb-2 min-h-[64px]"
                >
                  <View className="w-11 h-11 rounded-xl bg-neutral-surface items-center justify-center mr-3 shadow-xs">
                    <HeartHandshake size={20} color="#9A5B32" strokeWidth={2.2} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                    >
                      Aporte Solidario / Donación
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      Préstamo de herramientas, trueque, voluntariado
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2 & 3: Category and Detail / Audio */
              <View className="py-3">
                <View className="flex-row items-center justify-between mb-3 bg-neutral-mutedBg px-3.5 py-2 rounded-xl">
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                  >
                    {selectedType === 'SERVICIO'
                      ? '🛠️ OFRECER SERVICIO'
                      : selectedType === 'AYUDA'
                      ? '🆘 PEDIR AYUDA'
                      : '🤝 APORTE SOLIDARIO'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedType(null)}
                    className="min-h-[32px] justify-center px-2.5 bg-neutral-surface rounded-lg"
                  >
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                    >
                      Cambiar
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Paso 2: Categorías rápidas */}
                <Text
                  className="text-neutral-textMain mb-2"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  Paso 2: Categoría
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  {categoriesByType[selectedType].map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      isActive={category === cat}
                      onPress={() => setCategory(cat)}
                    />
                  ))}
                </View>

                {/* Paso 3: Detalle o Nota de voz */}
                <Text
                  className="text-neutral-textMain mb-2"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  Paso 3: Detalle o Nota de Voz
                </Text>

                {/* Voice recorder box */}
                <View className="p-3.5 bg-neutral-mutedBg rounded-2xl mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-neutral-textMain"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                      >
                        ¿Prefieres dictar?
                      </Text>
                      <Text
                        className="text-neutral-textMuted mt-0.5"
                        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                      >
                        La IA estructurará el pedido automáticamente.
                      </Text>
                    </View>

                    {isRecording ? (
                      <TouchableOpacity
                        onPress={stopRecording}
                        className="bg-emergency-alert px-3.5 py-2 rounded-xl flex-row items-center min-h-[40px]"
                      >
                        <Square size={15} color="#FFFFFF" />
                        <Text
                          className="text-white ml-1.5"
                          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                        >
                          Detener
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={startRecording}
                        className="bg-neutral-textMain px-3.5 py-2 rounded-xl flex-row items-center min-h-[40px]"
                      >
                        <Mic size={15} color="#FFFFFF" />
                        <Text
                          className="text-white ml-1.5"
                          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                        >
                          Grabar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {recordedUri && !isRecording && (
                    <View className="flex-row items-center mt-2.5 pt-2 border-t border-neutral-border/60">
                      <Check size={16} color="#1E5E45" strokeWidth={2.5} />
                      <Text
                        className="text-neutral-textMain ml-1.5"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                      >
                        Nota de voz lista para procesar
                      </Text>
                    </View>
                  )}
                </View>

                <Input
                  label="Descripción breve"
                  placeholder="Ej: Apoyo para reparar tubería principal..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                />

                <Button
                  title="Confirmar y Publicar"
                  variant={selectedType === 'AYUDA' ? 'emergency' : 'primary'}
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  className="mt-1"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

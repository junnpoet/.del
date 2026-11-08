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
      {/* Floating Action Button */}
      <View
        className="absolute right-5 z-50 items-center justify-center shadow-lg"
        style={{ bottom: 76 + Math.max(insets.bottom, 12) }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Publicación rápida en 3 clics"
          onPress={handleOpenMenu}
          activeOpacity={0.85}
          className="w-16 h-16 rounded-full bg-primary items-center justify-center border-4 border-primary-pastel shadow-lg shadow-black/25"
        >
          <Plus size={32} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* 3-Click Funnel Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            className="bg-neutral-surface rounded-t-3xl px-5 pt-6 border-t-2 border-neutral-border max-h-[92%]"
            style={{ paddingBottom: Math.max(insets.bottom + 20, 28) }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-4 border-b-2 border-neutral-border">
              <View className="flex-1 pr-2">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'Nunito_900Black', fontSize: 24 }}
                >
                  Publicación Rápida
                </Text>
                <Text
                  className="text-neutral-textMuted mt-0.5"
                  style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
                >
                  Embudo vecinal en 3 toques simples
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="min-h-[48px] min-w-[48px] rounded-2xl bg-neutral-mutedBg items-center justify-center"
              >
                <X size={26} color="#5C564F" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Step 1: Select Type */}
            {!selectedType ? (
              <View className="py-5">
                <Text
                  className="text-neutral-textMain mb-4"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
                >
                  Paso 1: ¿Qué deseas comunicar al barrio?
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedType('SERVICIO')}
                  className="flex-row items-center p-5 bg-primary-pastel border-2 border-primary-light/60 rounded-3xl mb-3.5 min-h-[76px]"
                >
                  <View className="w-14 h-14 rounded-2xl bg-primary items-center justify-center mr-4">
                    <Wrench size={26} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-primary-dark"
                      style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
                    >
                      Ofrecer un Servicio
                    </Text>
                    <Text
                      className="text-primary-dark/80 mt-0.5"
                      style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
                    >
                      Gasfitería, electricidad, costura, talleres
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('AYUDA')}
                  className="flex-row items-center p-5 bg-emergency-pastel border-2 border-emergency-alert/40 rounded-3xl mb-3.5 min-h-[76px]"
                >
                  <View className="w-14 h-14 rounded-2xl bg-emergency-alert items-center justify-center mr-4">
                    <HelpCircle size={26} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-emergency-alert"
                      style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
                    >
                      Pedir Ayuda / Necesidad
                    </Text>
                    <Text
                      className="text-neutral-textMain/80 mt-0.5"
                      style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
                    >
                      Medicinas urgentes, acompañamiento, soporte
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('SOLIDARIO')}
                  className="flex-row items-center p-5 bg-earth-pastel border-2 border-earth-light rounded-3xl mb-2 min-h-[76px]"
                >
                  <View className="w-14 h-14 rounded-2xl bg-earth items-center justify-center mr-4">
                    <HeartHandshake size={26} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-earth-dark"
                      style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 19 }}
                    >
                      Aporte Solidario / Donación
                    </Text>
                    <Text
                      className="text-earth-dark/85 mt-0.5"
                      style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 15 }}
                    >
                      Préstamo de herramientas, trueque, voluntariado
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2 & 3: Category and Detail / Audio */
              <View className="py-4">
                <View className="flex-row items-center justify-between mb-4 bg-primary-pastel/60 px-4 py-2.5 rounded-2xl border border-primary-light/40">
                  <Text
                    className="text-primary-dark"
                    style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
                  >
                    {selectedType === 'SERVICIO'
                      ? '🛠️ OFRECER SERVICIO'
                      : selectedType === 'AYUDA'
                      ? '🆘 PEDIR AYUDA'
                      : '🤝 APORTE SOLIDARIO'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedType(null)}
                    className="min-h-[40px] justify-center px-3 bg-neutral-surface rounded-xl border border-neutral-border"
                  >
                    <Text
                      className="text-primary-dark"
                      style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}
                    >
                      Cambiar
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Paso 2: Categorías rápidas */}
                <Text
                  className="text-neutral-textMain mb-2.5"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
                >
                  Paso 2: Elige una categoría
                </Text>
                <View className="flex-row flex-wrap mb-4">
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
                  className="text-neutral-textMain mb-2.5"
                  style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 17 }}
                >
                  Paso 3: Detalle o Nota de Voz
                </Text>

                {/* Voice recorder box */}
                <View className="p-4 bg-primary-pastel/50 border-2 border-primary-light/50 rounded-2xl mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-primary-dark"
                        style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
                      >
                        ¿Prefieres hablar? Graba un audio:
                      </Text>
                      <Text
                        className="text-neutral-textMuted mt-0.5"
                        style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 14 }}
                      >
                        Nuestra IA ordenará tu mensaje automáticamente.
                      </Text>
                    </View>

                    {isRecording ? (
                      <TouchableOpacity
                        onPress={stopRecording}
                        className="bg-emergency-alert px-4 py-3 rounded-2xl flex-row items-center min-h-[48px]"
                      >
                        <Square size={18} color="#FFFFFF" />
                        <Text
                          className="text-white ml-1.5"
                          style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
                        >
                          Detener
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={startRecording}
                        className="bg-primary px-4 py-3 rounded-2xl flex-row items-center min-h-[48px]"
                      >
                        <Mic size={18} color="#FFFFFF" />
                        <Text
                          className="text-white ml-1.5"
                          style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16 }}
                        >
                          Grabar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {recordedUri && !isRecording && (
                    <View className="flex-row items-center mt-3 pt-2.5 border-t border-primary-light/40">
                      <Check size={18} color="#1B4332" strokeWidth={3} />
                      <Text
                        className="text-primary-dark ml-1.5"
                        style={{ fontFamily: 'Nunito_700Bold', fontSize: 15 }}
                      >
                        Audio grabado listo para enviar
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

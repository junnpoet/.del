import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Plus, X, Wrench, HeartHandshake, HelpCircle, Mic, Square, Check } from 'lucide-react-native';
import { Button } from './Button';
import { Input } from './Input';
import { Chip } from './Chip';

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'SERVICIO' | 'AYUDA' | 'SOLIDARIO' | null
  >(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Voice recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
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
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // Ignore unload error
      }
      setRecording(null);
      setIsRecording(false);
    }
    setIsOpen(false);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso Denegado',
          'Se requiere acceso al micrófono para grabar la solicitud por voz.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación de audio.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsRecording(false);
      if (!description) {
        setDescription('[Nota de voz adjunta para transcripción automática]');
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsRecording(false);
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
        className="absolute bottom-20 right-5 z-50 items-center justify-center shadow-lg"
        pointerEvents="box-none"
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Publicación rápida en 3 clics"
          onPress={handleOpenMenu}
          activeOpacity={0.85}
          className="w-14 h-14 rounded-full bg-primary items-center justify-center border-2 border-white shadow-md shadow-black/20"
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
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
          <View className="bg-neutral-surface rounded-t-3xl p-5 border-t border-neutral-border max-h-[90%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-neutral-border">
              <View>
                <Text className="text-xl font-bold text-neutral-textMain">
                  Publicación Rápida
                </Text>
                <Text className="text-xs text-neutral-textMuted">
                  Embudo Vecinal en 3 toques
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="min-h-[48px] min-w-[48px] items-center justify-center -mr-2"
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Step 1: Select Type */}
            {!selectedType ? (
              <View className="py-4">
                <Text className="text-base font-semibold text-neutral-textMain mb-3">
                  Paso 1: ¿Qué deseas comunicar al barrio?
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedType('SERVICIO')}
                  className="flex-row items-center p-4 bg-primary/10 border border-primary/30 rounded-2xl mb-3 min-h-[56px]"
                >
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <Wrench size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-dark">
                      Ofrecer un Servicio
                    </Text>
                    <Text className="text-xs text-neutral-textMuted">
                      Gasfitería, electricidad, costura, talleres
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('AYUDA')}
                  className="flex-row items-center p-4 bg-emergency-alert/10 border border-emergency-alert/30 rounded-2xl mb-3 min-h-[56px]"
                >
                  <View className="w-10 h-10 rounded-full bg-emergency-alert items-center justify-center mr-3">
                    <HelpCircle size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-emergency-alert">
                      Pedir Ayuda / Necesidad
                    </Text>
                    <Text className="text-xs text-neutral-textMuted">
                      Medicinas urgentes, acompañamiento, soporte
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType('SOLIDARIO')}
                  className="flex-row items-center p-4 bg-earth/15 border border-earth/40 rounded-2xl mb-3 min-h-[56px]"
                >
                  <View className="w-10 h-10 rounded-full bg-earth items-center justify-center mr-3">
                    <HeartHandshake size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-earth-dark">
                      Aporte Solidario / Donación
                    </Text>
                    <Text className="text-xs text-neutral-textMuted">
                      Préstamo de herramientas, trueque, voluntariado
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2 & 3: Category and Detail / Audio */
              <View className="py-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-bold text-primary">
                    {selectedType === 'SERVICIO'
                      ? '🛠️ OFRECER SERVICIO'
                      : selectedType === 'AYUDA'
                      ? '🆘 PEDIR AYUDA'
                      : '🤝 APORTE SOLIDARIO'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedType(null)}
                    className="min-h-[36px] justify-center px-2"
                  >
                    <Text className="text-xs font-semibold text-primary underline">
                      Cambiar
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Paso 2: Categorías rápidas */}
                <Text className="text-xs font-semibold text-neutral-textMuted uppercase mb-2">
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
                <Text className="text-xs font-semibold text-neutral-textMuted uppercase mb-2">
                  Paso 3: Detalle o Nota de Voz
                </Text>

                {/* Voice recorder box */}
                <View className="p-3 bg-neutral-background border border-neutral-border rounded-xl mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-semibold text-neutral-textMain">
                        ¿Prefieres hablar? Graba un audio:
                      </Text>
                      <Text className="text-[11px] text-neutral-textMuted">
                        Nuestra IA estructurará el pedido automáticamente.
                      </Text>
                    </View>

                    {isRecording ? (
                      <TouchableOpacity
                        onPress={stopRecording}
                        className="bg-emergency-alert px-3 py-2 rounded-lg flex-row items-center min-h-[40px]"
                      >
                        <Square size={16} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white ml-1">
                          Detener
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={startRecording}
                        className="bg-primary px-3 py-2 rounded-lg flex-row items-center min-h-[40px]"
                      >
                        <Mic size={16} color="#FFFFFF" />
                        <Text className="text-xs font-bold text-white ml-1">
                          Grabar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {recordedUri && !isRecording && (
                    <View className="flex-row items-center mt-2 pt-2 border-t border-neutral-border">
                      <Check size={16} color="#2D6A4F" />
                      <Text className="text-xs text-primary font-medium ml-1">
                        Audio grabado listo para procesar
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
                  className="mt-2"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

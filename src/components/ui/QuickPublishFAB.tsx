import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Plus, X, Wrench, HeartHandshake, HelpCircle, Mic, Square, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '../../services/demoStore';
import { Button } from './Button';
import { Input } from './Input';
import { Chip } from './Chip';
import type { AudioRecorder } from 'expo-audio';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../i18n';
import { useAuth } from '../../services/auth';
import { supabase } from '../../services/supabase';
import type { PostType } from '../../types';
import { useCreateSolidaryPost } from '../../features/community/hooks/useSolidaryFeed';
import { DIRECTORY_QUERY_KEY } from '../../features/public/hooks/useDirectory';
import { errorMessage, showMessage } from '../../features/community/utils';

/** Categoría del aporte solidario → post_type de solidary_posts (CHECK de la SPEC-02). */
const SOLIDARY_POST_TYPE: Record<string, PostType> = {
  Préstamo: 'PRESTAMO',
  Donación: 'DONACION',
  Trueque: 'TRUEQUE',
  Voluntariado: 'VOLUNTARIADO',
};

export interface QuickPublishFABProps {
  animatedTranslateY?: Animated.AnimatedInterpolation<number | string> | Animated.Value | number;
  animatedBottom?: Animated.AnimatedInterpolation<number | string> | Animated.Value | number;
  animatedOpacity?: Animated.AnimatedInterpolation<number | string> | Animated.Value | number;
  baseBottom?: number;
  zIndex?: number;
  pointerEvents?: 'auto' | 'none' | 'box-none';
  onPublishSuccess?: (data: {
    type: 'SERVICIO' | 'AYUDA' | 'SOLIDARIO';
    category: string;
    description: string;
    audioUri?: string | null;
  }) => void;
}

export const QuickPublishFAB: React.FC<QuickPublishFABProps> = ({
  animatedTranslateY,
  animatedBottom,
  animatedOpacity,
  baseBottom,
  zIndex = 35,
  pointerEvents,
  onPublishSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { fabOffset, hideGlobalFAB } = useDemo();
  const { t, tCategory } = useI18n();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const createSolidaryPost = useCreateSolidaryPost();
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
        showMessage(t('fab.micDeniedTitle'), t('fab.micDenied'));
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
        setDescription(t('fab.voiceAttached'));
      }
    } catch (err) {
      console.warn('Error stopping recording, using fallback URI:', err);
      setRecordedUri('file://simulated-voice-note.m4a');
      setIsRecording(false);
      if (!description) {
        setDescription(t('fab.voiceAttached'));
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      showMessage(t('common.attention'), t('fab.selectType'));
      return;
    }
    if (!category) {
      showMessage(t('common.attention'), t('fab.selectCategory'));
      return;
    }
    if (!description.trim() && !recordedUri) {
      showMessage(t('common.attention'), t('fab.needDetail'));
      return;
    }
    if (!session) {
      showMessage(t('common.attention'), t('fab.loginRequired'));
      return;
    }

    const finalDescription = description.trim() || t('fab.voicePost');
    setIsSubmitting(true);
    try {
      if (selectedType === 'SERVICIO') {
        // Oficio para el Directorio público (tabla services, SPEC-03).
        const { error } = await supabase.from('services').insert({
          provider_id: session.user.id,
          title: finalDescription.slice(0, 80),
          category,
          description: finalDescription,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
      } else {
        // Ayuda o aporte solidario para el Muro Solidario (tabla solidary_posts, SPEC-04).
        await createSolidaryPost.mutateAsync({
          postType: selectedType === 'AYUDA' ? 'AYUDA' : SOLIDARY_POST_TYPE[category] ?? 'DONACION',
          category,
          description: finalDescription,
        });
      }

      onPublishSuccess?.({
        type: selectedType,
        category,
        description: finalDescription,
        audioUri: recordedUri,
      });
      showMessage(t('fab.successTitle'), t('fab.success'));
      handleClose();
    } catch (error) {
      showMessage(t('fab.failed'), errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // When a screen (like the map) mounts its own synchronized FAB, hide the global layout instance
  if (animatedTranslateY === undefined && animatedBottom === undefined && hideGlobalFAB) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button — Minimalist circular '+' button */}
      <Animated.View
        className="absolute right-5 items-center justify-center"
        style={{
          bottom:
            baseBottom !== undefined
              ? baseBottom
              : animatedBottom !== undefined
              ? animatedBottom
              : 72 + Math.max(insets.bottom, 12) + fabOffset,
          opacity:
            animatedOpacity !== undefined
              ? animatedOpacity
              : (fabOffset > 240 ? 0 : 1),
          transform:
            animatedTranslateY !== undefined
              ? [{ translateY: animatedTranslateY }]
              : undefined,
          zIndex,
        }}
        pointerEvents={pointerEvents ?? 'auto'}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('fab.a11y')}
          onPress={handleOpenMenu}
          activeOpacity={0.88}
          className="rounded-full bg-primary items-center justify-center shadow-lg shadow-black/25"
          style={{ width: 54, height: 54 }}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </Animated.View>

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
                  {t('fab.title')}
                </Text>
                <Text
                  className="text-neutral-textMuted mt-0.5"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  {t('fab.subtitle')}
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
                  {t('fab.question')}
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
                      {t('fab.service')}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {t('fab.serviceBody')}
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
                      {t('fab.help')}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {t('fab.helpBody')}
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
                      {t('fab.solidary')}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {t('fab.solidaryBody')}
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
                      ? t('fab.badgeService')
                      : selectedType === 'AYUDA'
                      ? t('fab.badgeHelp')
                      : t('fab.badgeSolidary')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedType(null)}
                    className="min-h-[32px] justify-center px-2.5 bg-neutral-surface rounded-lg"
                  >
                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                    >
                      {t('fab.change')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Paso 2: Categorías rápidas */}
                <Text
                  className="text-neutral-textMain mb-2"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  {t('fab.step2')}
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  {categoriesByType[selectedType].map((cat) => (
                    <Chip
                      key={cat}
                      label={tCategory(cat)}
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
                  {t('fab.step3')}
                </Text>

                {/* Voice recorder box */}
                <View className="p-3.5 bg-neutral-mutedBg rounded-2xl mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-neutral-textMain"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                      >
                        {t('fab.dictateTitle')}
                      </Text>
                      <Text
                        className="text-neutral-textMuted mt-0.5"
                        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                      >
                        {t('fab.dictateBody')}
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
                          {t('fab.stop')}
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
                          {t('fab.record')}
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
                        {t('fab.voiceReady')}
                      </Text>
                    </View>
                  )}
                </View>

                <Input
                  label={t('fab.description')}
                  placeholder={t('fab.descriptionPlaceholder')}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                />

                <Button
                  title={t('fab.submit')}
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

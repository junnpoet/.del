import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useI18n } from '../../../i18n';

interface Props {
  /** Recibe el URI local del audio (o null si no se pudo grabar). */
  onRecorded: (audioUri: string | null) => void;
  busy?: boolean;
}

/**
 * Botón de Micrófono Asistente (SPEC-04 §2.4): pulsar para hablar, pulsar de
 * nuevo para enviar. La transcripción con Gemini es del pipeline de SPEC-05;
 * aquí solo se captura el audio y se entrega el URI.
 */
export function VoiceAssistantButton({ onRecorded, busy = false }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);

  const start = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        onRecorded(null);
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecording(true);
    } catch (error) {
      console.warn('No se pudo iniciar la grabación', error);
      onRecorded(null);
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      onRecorded(recorder.uri ?? null);
    } catch (error) {
      console.warn('No se pudo detener la grabación', error);
      onRecorded(null);
    } finally {
      setRecording(false);
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={recording ? t('accessible.voiceStopA11y') : t('accessible.voiceStartA11y')}
      disabled={busy}
      onPress={recording ? stop : start}
      className={`w-full min-h-[84px] rounded-3xl flex-row items-center justify-center px-5 ${
        recording ? 'bg-emergency-alert' : 'bg-neutral-textMain'
      }`}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {recording ? <Square size={30} color="#FFFFFF" /> : <Mic size={32} color="#FFFFFF" />}
          <Text className="text-white ml-3" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}>
            {recording ? t('accessible.voiceStop') : t('accessible.voiceStart')}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

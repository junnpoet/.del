import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, LogOut, Pill, ShoppingBasket } from 'lucide-react-native';
import { useAuth } from '../../../services/auth';
import { useI18n, type TranslationKey } from '../../../i18n';
import { LanguageToggle } from '../../../i18n/LanguageToggle';
import { useCreateSolidaryPost } from '../../community/hooks/useSolidaryFeed';
import { confirmAction, errorMessage, showMessage } from '../../community/utils';
import { SosHoldButton } from '../components/SosHoldButton';
import { VoiceAssistantButton } from '../components/VoiceAssistantButton';
import { useSosAlert } from '../hooks/useSosAlert';
import { setAccessibleModeEnabled } from '../storage';

// La categoría se guarda en español (valor de base de datos); la etiqueta se traduce.
const QUICK_NEEDS: { key: string; label: TranslationKey; category: string; Icon: typeof Pill }[] = [
  { key: 'compras', label: 'accessible.needShopping', category: 'Compras de mercado', Icon: ShoppingBasket },
  { key: 'medicinas', label: 'accessible.needMedicine', category: 'Medicinas', Icon: Pill },
];

/**
 * Modo Accesible Adaptativo para adultos mayores (SPEC-04 §2.4).
 * Sin menús ni feeds: solo el SOS central de 2 s, el micrófono asistente y
 * dos pedidos rápidos, con tipografía grande y alto contraste.
 */
export default function AccessibleHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { session, profile } = useAuth();
  const { send, cancel } = useSosAlert();
  const createPost = useCreateSolidaryPost();
  const [sentAlertId, setSentAlertId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] ?? t('accessible.neighbor');
  const fullName = profile?.full_name ?? t('accessible.someone');

  const triggerSos = () => {
    send.mutate(undefined, {
      onSuccess: (alertId) => setSentAlertId(alertId),
      onError: (error) =>
        showMessage(t('sos.failedTitle'), `${errorMessage(error)}\n\n${t('sos.failedHelp')}`),
    });
  };

  const cancelSos = async () => {
    if (!sentAlertId) return;
    const ok = await confirmAction(t('sos.cancelTitle'), t('sos.cancelConfirm'), t('sos.cancelYes'));
    if (!ok) return;
    cancel.mutate(sentAlertId, {
      onSuccess: () => setSentAlertId(null),
      onError: (error) => showMessage(t('sos.cancelFailed'), errorMessage(error)),
    });
  };

  const publishNeed = (category: string, description: string) =>
    createPost.mutate(
      { postType: 'AYUDA', category, description, urgency: 'ALTA_CRITICA' },
      {
        onSuccess: () => showMessage(t('accessible.needSentTitle'), t('accessible.needSent')),
        onError: (error) => showMessage(t('accessible.needFailed'), errorMessage(error)),
      }
    );

  const handleVoice = (audioUri: string | null) => {
    if (!audioUri) {
      showMessage(t('accessible.micUnavailableTitle'), t('accessible.micUnavailable'));
      return;
    }
    // El audio se procesa en el pipeline de voz (SPEC-05). Mientras tanto,
    // el pedido queda visible para que un vecino llame y escuche la necesidad.
    publishNeed('Pedido por voz', t('accessible.voicePost', { name: fullName }));
  };

  const exitAccessibleMode = async () => {
    await setAccessibleModeEnabled(false);
    router.replace('/(main)');
  };

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-background p-6">
        <Text className="text-neutral-textMain text-center" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26 }}>
          {t('accessible.loginTitle')}
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="mt-6 bg-primary rounded-3xl min-h-[72px] px-8 items-center justify-center"
        >
          <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}>
            {t('accessible.loginAction')}
          </Text>
        </TouchableOpacity>
        <View className="w-full mt-8">
          <LanguageToggle large />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#FFF9F2]"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
    >
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32 }}>
            {t('accessible.hello', { name: firstName })}
          </Text>
          <Text className="text-neutral-textMuted mt-1" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18 }}>
            {t('brand.tagline')}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('accessible.settingsA11y')}
          onPress={() => setShowSettings((value) => !value)}
          className="min-h-[52px] px-4 rounded-2xl bg-neutral-surface border border-neutral-border items-center justify-center"
        >
          <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
            {showSettings ? t('common.close') : t('accessible.settings')}
          </Text>
        </TouchableOpacity>
      </View>

      {showSettings && (
        <View className="bg-neutral-surface rounded-3xl p-4 mb-5">
          <LanguageToggle large />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={exitAccessibleMode}
            className="mt-4 min-h-[60px] rounded-2xl bg-neutral-mutedBg flex-row items-center justify-center"
          >
            <LogOut size={22} color="#1A1D20" />
            <Text className="text-neutral-textMain ml-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>
              {t('accessible.exit')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón SOS central o confirmación de envío */}
      <View className="items-center my-4">
        {sentAlertId ? (
          <View className="w-full items-center bg-primary-tint rounded-3xl p-6">
            <CheckCircle2 size={72} color="#1E5E45" />
            <Text className="text-primary-dark text-center mt-3" style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 30 }}>
              {t('sos.sent')}
            </Text>
            <Text className="text-neutral-textMain text-center mt-2" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 20 }}>
              {t('sos.sentDetail')}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={cancelSos}
              className="mt-5 min-h-[60px] px-6 rounded-2xl bg-neutral-surface border border-neutral-border items-center justify-center"
            >
              <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>
                {t('sos.cancelMistake')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SosHoldButton
            label={t('sos.button')}
            hint={send.isPending ? t('sos.sending') : t('sos.hold')}
            disabled={send.isPending}
            onTrigger={triggerSos}
          />
        )}
      </View>

      <View className="mt-2">
        <VoiceAssistantButton onRecorded={handleVoice} busy={createPost.isPending} />
        <View className="flex-row gap-3 mt-3">
          {QUICK_NEEDS.map(({ key, label, category, Icon }) => (
            <TouchableOpacity
              key={key}
              accessibilityRole="button"
              disabled={createPost.isPending}
              onPress={() => publishNeed(category, t('accessible.needPost', { name: fullName, need: t(label) }))}
              className="flex-1 min-h-[96px] rounded-3xl bg-neutral-surface border-2 border-primary/30 items-center justify-center p-3"
            >
              <Icon size={30} color="#1E5E45" />
              <Text className="text-neutral-textMain text-center mt-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}>
                {t(label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

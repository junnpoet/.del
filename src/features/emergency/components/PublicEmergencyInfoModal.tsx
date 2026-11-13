import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  CheckCircle2,
  HeartPulse,
  MapPin,
  PhoneCall,
  ShieldAlert,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useI18n } from '../../../i18n';

export interface PublicEmergencyInfoModalProps {
  visible: boolean;
  onClose: () => void;
  eventType?: string | null;
  description?: string | null;
  isMember?: boolean;
  requested?: boolean;
  loadingJoin?: boolean;
  onRequestExpressJoin?: () => void;
}

/**
 * Bandeja con información pública de emergencia (zonas seguras, botiquines y
 * teléfonos) accesible para todo el sector, con recordatorio opcional de
 * membresía para acceder a la coordinación del Muro Solidario.
 */
export function PublicEmergencyInfoModal({
  visible,
  onClose,
  eventType,
  description,
  isMember = false,
  requested = false,
  loadingJoin = false,
  onRequestExpressJoin,
}: PublicEmergencyInfoModalProps) {
  const { t } = useI18n();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="86%">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center rounded-full bg-[#FEE2E2] px-3 py-1">
          <ShieldAlert size={14} color="#DC2626" />
          <Text
            className="ml-1.5 uppercase text-[#DC2626]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
          >
            {eventType || 'Contingencia Activa'}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cerrar información de emergencia"
          onPress={onClose}
          className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
        >
          <X size={18} color="#6C727A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
        <Text
          className="text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 19 }}
        >
          Información Pública de Emergencia
        </Text>
        <Text
          className="mt-1 text-neutral-textMuted"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13.5, lineHeight: 19 }}
        >
          {description ||
            'Puntos de evacuación, botiquines vecinales y números de emergencia disponibles para todo el sector.'}
        </Text>

        <View className="mt-4 rounded-2xl border border-neutral-border bg-neutral-mutedBg/50 p-3.5">
          <View className="mb-1 flex-row items-center">
            <MapPin size={17} color="#1E5E45" />
            <Text
              className="ml-2 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {t('emergency.zone')}
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
          >
            {t('emergency.zoneBody')}
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-neutral-border bg-neutral-mutedBg/50 p-3.5">
          <View className="mb-1 flex-row items-center">
            <HeartPulse size={17} color="#DC2626" />
            <Text
              className="ml-2 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {t('emergency.kit')}
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
          >
            {t('emergency.kitBody')}
          </Text>
        </View>

        <View className="mt-3 rounded-2xl border border-neutral-border bg-neutral-mutedBg/50 p-3.5">
          <View className="mb-1 flex-row items-center">
            <PhoneCall size={17} color="#D97706" />
            <Text
              className="ml-2 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {t('emergency.phones')}
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 19 }}
          >
            {t('emergency.phonesBody')}
          </Text>
        </View>

        {!isMember && (
          <View className="mt-4 mb-2 rounded-2xl border border-primary/25 bg-[#EDF5F1] p-4">
            <View className="mb-1.5 flex-row items-center">
              <Users size={17} color="#1E5E45" />
              <Text
                className="ml-2 text-primary"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
              >
                Acceso a Grupos de Apoyo Vecinal
              </Text>
            </View>
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
            >
              Para coordinar víveres, agua, herramientas y ayuda conjunta en el Muro Solidario, debes formar parte de la comunidad vecinal de tu sector.
            </Text>
          </View>
        )}
      </ScrollView>

      {!isMember && onRequestExpressJoin && (
        requested ? (
          <View className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-neutral-mutedBg px-4">
            <CheckCircle2 size={18} color="#1E5E45" />
            <Text
              className="ml-2 text-primary"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13.5 }}
            >
              Tu solicitud está en revisión por el dirigente
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            disabled={loadingJoin}
            onPress={onRequestExpressJoin}
            className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-red-600 px-4"
          >
            <UserPlus size={18} color="#FFFFFF" />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {loadingJoin ? 'Enviando solicitud...' : 'Solicitar Unión Express a la Comunidad'}
            </Text>
          </TouchableOpacity>
        )
      )}
    </BottomSheetModal>
  );
}

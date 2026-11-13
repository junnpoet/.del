import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Info,
  MapPin,
  PhoneCall,
  ShieldAlert,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { useI18n } from '../../../i18n';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { useZoneEmergency } from '../hooks/useEmergencyRealtime';

interface EmergencyBannerProps {
  isEmergencyActive?: boolean;
  isInGroup?: boolean;
  userPhone?: string;
  userName?: string;
  onExpressJoinRequested?: () => void;
}

interface ActiveEmergencySummary {
  id: string;
  group_id: string;
  event_type: string;
  description: string | null;
}

export function EmergencyBanner({
  isEmergencyActive: isEmergencyActiveProp,
  isInGroup: isInGroupProp,
  userPhone,
  userName,
  onExpressJoinRequested,
}: EmergencyBannerProps) {
  const { profile, session } = useAuth();
  const { t } = useI18n();
  const { zoneEmergency } = useZoneEmergency();
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const liveEmergency: ActiveEmergencySummary | null = zoneEmergency
    ? {
        id: zoneEmergency.id,
        group_id: zoneEmergency.group_id,
        event_type: zoneEmergency.event_type,
        description: zoneEmergency.description,
      }
    : null;

  const effectiveIsInGroup =
    isInGroupProp ?? Boolean(profile?.group_id || profile?.role === 'dirigente');

  const resolveNearbyGroupId = useCallback(async (): Promise<string | null> => {
    if (zoneEmergency?.group_id) return zoneEmergency.group_id;
    if (
      profile?.lat !== null &&
      profile?.lat !== undefined &&
      profile?.lng !== null &&
      profile?.lng !== undefined
    ) {
      const { data: nearby } = await supabase.rpc('get_nearby_groups', {
        user_lat: profile.lat,
        user_lng: profile.lng,
        radius_meters: 3000,
      });
      if (nearby && nearby.length > 0 && nearby[0]?.group_id) {
        return nearby[0].group_id;
      }
    }

    const { data: fallbackGroups } = await supabase
      .from('neighborhood_groups')
      .select('id')
      .limit(1);
    return fallbackGroups?.[0]?.id ?? null;
  }, [zoneEmergency?.group_id, profile?.lat, profile?.lng]);

  useEffect(() => {
    if (zoneEmergency?.group_id) {
      setTargetGroupId(zoneEmergency.group_id);
    }
  }, [zoneEmergency?.group_id]);

  useEffect(() => {
    if (effectiveIsInGroup || !session) {
      return;
    }

    let mounted = true;

    const checkPendingRequest = async () => {
      try {
        const { data } = await supabase
          .from('group_join_requests')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'PENDING')
          .limit(1);
        if (mounted && data && data.length > 0) {
          setRequested(true);
        }
      } catch {
        // Ignore offline/network check errors
      }
    };

    void checkPendingRequest();

    return () => {
      mounted = false;
    };
  }, [effectiveIsInGroup, session]);

  const effectiveEmergencyActive =
    isEmergencyActiveProp ?? Boolean(liveEmergency);

  if (!effectiveEmergencyActive || effectiveIsInGroup) {
    return null;
  }

  const handleExpressJoin = async () => {
    if (requested || loading) return;
    setLoading(true);
    try {
      const groupId = targetGroupId ?? (await resolveNearbyGroupId());

      if (groupId) {
        const { error } = await supabase.from('group_join_requests').insert({
          group_id: groupId,
          user_id: profile?.id ?? session?.user.id ?? null,
          whatsapp_phone: userPhone ?? profile?.phone ?? null,
          full_name: userName ?? profile?.full_name ?? 'Vecino',
          address: profile?.home_address ?? null,
          status: 'PENDING',
          is_emergency: true,
          is_from_whatsapp: false,
        });
        if (error) throw error;
      }

      setRequested(true);
      onExpressJoinRequested?.();
      Alert.alert(
        'Solicitud Express Enviada',
        'El dirigente de tu sector ha recibido tu solicitud prioritaria y podrá admitirte de inmediato para acceder a la coordinación de víveres y auxilio.'
      );
    } catch (err) {
      Alert.alert(
        'No se pudo enviar',
        err instanceof Error ? err.message : 'Intenta nuevamente en unos segundos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View className="mx-4 my-2 rounded-2xl border border-red-400 bg-red-600 p-3.5 shadow-md">
        <View className="flex-row items-start">
          <View className="mr-3 mt-0.5 rounded-xl bg-white/20 p-2">
            <AlertTriangle size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text
                className="uppercase tracking-wider text-white"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12.5 }}
              >
                Alerta de Contingencia
              </Text>
              {Boolean(liveEmergency?.event_type) && (
                <View className="rounded-full bg-white/20 px-2 py-0.5">
                  <Text
                    className="uppercase text-white"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10.5 }}
                  >
                    {liveEmergency?.event_type}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="mt-1 leading-4 text-white/95"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
            >
              Consulta zonas seguras y teléfonos públicos, o únete a tu comunidad para acceder a los grupos de apoyo vecinal.
            </Text>

            <View className="mt-2.5 flex-row items-center gap-2">
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setInfoModalOpen(true)}
                activeOpacity={0.85}
                className="min-h-[42px] flex-1 flex-row items-center justify-center rounded-xl border border-white/40 bg-white/15 px-3"
              >
                <Info size={15} color="#FFFFFF" />
                <Text
                  numberOfLines={1}
                  className="ml-1.5 text-white"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                >
                  Info pública
                </Text>
              </TouchableOpacity>

              {requested ? (
                <View className="min-h-[42px] flex-1 flex-row items-center justify-center rounded-xl bg-white/20 px-3">
                  <CheckCircle2 size={15} color="#FFFFFF" />
                  <Text
                    numberOfLines={1}
                    className="ml-1.5 text-white"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
                  >
                    En revisión
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleExpressJoin}
                  disabled={loading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  className="min-h-[42px] flex-1 flex-row items-center justify-center rounded-xl bg-white px-3 shadow-sm"
                >
                  <UserPlus size={15} color="#DC2626" />
                  <Text
                    numberOfLines={1}
                    className="ml-1.5 text-red-700"
                    style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12 }}
                  >
                    {loading ? 'Enviando...' : 'Unión Express'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      <BottomSheetModal
        visible={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        maxHeight="86%"
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-[#FEE2E2] px-3 py-1 flex-row items-center">
              <ShieldAlert size={14} color="#DC2626" />
              <Text
                className="ml-1.5 uppercase text-[#DC2626]"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
              >
                {liveEmergency?.event_type || 'Contingencia Activa'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar información de emergencia"
            onPress={() => setInfoModalOpen(false)}
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
            {liveEmergency?.description ||
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
              Para coordinar víveres, agua, herramientas de rescate, recibir alertas directas y participar en el Tablero de Ayuda Humanitaria, debes formar parte de la comunidad vecinal de tu sector.
            </Text>
          </View>
        </ScrollView>

        {requested ? (
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
            disabled={loading}
            onPress={handleExpressJoin}
            className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-red-600 px-4"
          >
            <UserPlus size={18} color="#FFFFFF" />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {loading ? 'Enviando solicitud...' : 'Solicitar Unión Express a la Comunidad'}
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheetModal>
    </>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Info, UserPlus } from 'lucide-react-native';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { useZoneEmergency } from '../hooks/useEmergencyRealtime';
import { PublicEmergencyInfoModal } from './PublicEmergencyInfoModal';

interface EmergencyBannerProps {
  isEmergencyActive?: boolean;
  isInGroup?: boolean;
  userPhone?: string;
  userName?: string;
  onExpressJoinRequested?: () => void;
}

export function EmergencyBanner({
  isEmergencyActive: isEmergencyActiveProp,
  isInGroup: isInGroupProp,
  userPhone,
  userName,
  onExpressJoinRequested,
}: EmergencyBannerProps) {
  const { profile, session } = useAuth();
  const { zoneEmergency } = useZoneEmergency();
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

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
    isEmergencyActiveProp ?? Boolean(zoneEmergency);

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
        'El dirigente de tu sector ha recibido tu solicitud prioritaria y podrá admitirte de inmediato para coordinar ayuda con tu comunidad.'
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
      <View className="mx-4 my-2 rounded-2xl border border-red-300 bg-red-600 p-3.5 shadow-sm">
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
              {Boolean(zoneEmergency?.event_type) && (
                <View className="rounded-full bg-white/20 px-2 py-0.5">
                  <Text
                    className="uppercase text-white"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10.5 }}
                  >
                    {zoneEmergency?.event_type}
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

      <PublicEmergencyInfoModal
        visible={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        eventType={zoneEmergency?.event_type}
        description={zoneEmergency?.description}
        isMember={false}
        requested={requested}
        loadingJoin={loading}
        onRequestExpressJoin={handleExpressJoin}
      />
    </>
  );
}

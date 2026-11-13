import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react-native';
import { channelName, supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';

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
  const [liveEmergencyActive, setLiveEmergencyActive] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const effectiveIsInGroup =
    isInGroupProp ?? Boolean(profile?.group_id || profile?.role === 'dirigente');

  const resolveNearbyGroupId = useCallback(async (): Promise<string | null> => {
    if (profile?.lat !== null && profile?.lat !== undefined && profile?.lng !== null && profile?.lng !== undefined) {
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
  }, [profile?.lat, profile?.lng]);

  useEffect(() => {
    if (isEmergencyActiveProp !== undefined || effectiveIsInGroup || !session) {
      return;
    }

    let mounted = true;

    const checkLiveEmergency = async () => {
      try {
        const nearbyGroupId = await resolveNearbyGroupId();
        if (!mounted) return;
        if (nearbyGroupId) {
          setTargetGroupId(nearbyGroupId);
        }

        let query = supabase
          .from('emergency_events')
          .select('id, group_id')
          .eq('status', 'ACTIVE')
          .limit(1);

        if (nearbyGroupId) {
          query = query.eq('group_id', nearbyGroupId);
        }

        const { data } = await query;
        if (mounted) {
          setLiveEmergencyActive(Boolean(data && data.length > 0));
          if (data?.[0]?.group_id) {
            setTargetGroupId(data[0].group_id);
          }
        }
      } catch {
        if (mounted) setLiveEmergencyActive(false);
      }
    };

    void checkLiveEmergency();

    const channel = supabase
      .channel(channelName('public-emergency-banner'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_events' },
        () => {
          void checkLiveEmergency();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [isEmergencyActiveProp, effectiveIsInGroup, session, resolveNearbyGroupId]);

  const effectiveEmergencyActive = isEmergencyActiveProp ?? liveEmergencyActive;

  if (!effectiveEmergencyActive || effectiveIsInGroup) {
    return null;
  }

  const handleExpressJoin = async () => {
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
    <View className="mx-4 my-2.5 p-4 bg-red-600 rounded-2xl border border-red-400 shadow-md">
      <View className="flex-row items-start">
        <View className="p-2 bg-white/20 rounded-xl mr-3 mt-0.5">
          <AlertTriangle size={22} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text
            className="text-white uppercase tracking-wider mb-1"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 }}
          >
            Alerta de Contingencia Vecinal
          </Text>
          <Text
            className="text-white/95 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            Tu sector está bajo contingencia. El grupo vecinal más cercano está coordinando víveres, puntos seguros y auxilio.
          </Text>

          {requested ? (
            <View className="mt-3 flex-row items-center bg-white/20 px-3 min-h-[48px] rounded-xl">
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text
                className="text-white ml-2"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
              >
                Solicitud Express enviada al dirigente
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleExpressJoin}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              className="mt-3 bg-white px-4 min-h-[48px] rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <UserPlus size={16} color="#DC2626" />
              <Text
                className="text-red-700 ml-2 uppercase tracking-wide"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12 }}
              >
                {loading ? 'Enviando...' : 'Solicitar Unión Express'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

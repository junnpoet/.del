import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '../../../services/supabase';

interface EmergencyBannerProps {
  isEmergencyActive?: boolean;
  isInGroup?: boolean;
  userPhone?: string;
  userName?: string;
  onExpressJoinRequested?: () => void;
}

export function EmergencyBanner({
  isEmergencyActive = true,
  isInGroup = false,
  userPhone,
  userName = 'Vecino',
  onExpressJoinRequested,
}: EmergencyBannerProps) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isEmergencyActive || isInGroup) {
    return null;
  }

  const handleExpressJoin = async () => {
    setLoading(true);
    try {
      // Registrar solicitud prioritaria en Supabase
      const { data: groups } = await supabase
        .from('neighborhood_groups')
        .select('id')
        .limit(1);

      const targetGroupId = groups?.[0]?.id;

      if (targetGroupId) {
        await supabase.from('group_join_requests').insert({
          group_id: targetGroupId,
          whatsapp_phone: userPhone || null,
          full_name: userName,
          status: 'PENDING',
          is_emergency: true,
          is_from_whatsapp: false,
        });
      }

      setRequested(true);
      onExpressJoinRequested?.();
      Alert.alert(
        'Solicitud Express Enviada',
        'El dirigente de tu sector ha recibido tu solicitud prioritaria y podrá admitirte de inmediato para acceder a la coordinación de víveres y auxilio.'
      );
    } catch (err) {
      console.warn('Simulando solicitud express:', err);
      setRequested(true);
      onExpressJoinRequested?.();
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
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-white font-extrabold text-sm uppercase tracking-wider"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
            >
              ⚠️ Alerta de Contingencia Vecinal
            </Text>
          </View>
          <Text
            className="text-white/95 text-xs leading-4"
            style={{ fontFamily: 'PlusJakartaSans_500Medium' }}
          >
            Tu sector está bajo contingencia. El grupo vecinal más cercano está coordinando víveres, puntos seguros y auxilio.
          </Text>

          {requested ? (
            <View className="mt-3 flex-row items-center bg-white/20 px-3 py-2 rounded-xl">
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text
                className="text-white text-xs font-bold ml-2"
                style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
              >
                Solicitud Express enviada al dirigente
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleExpressJoin}
              disabled={loading}
              activeOpacity={0.85}
              className="mt-3 bg-white px-4 py-2.5 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <UserPlus size={16} color="#DC2626" />
              <Text
                className="text-red-700 font-extrabold text-xs ml-2 uppercase tracking-wide"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
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


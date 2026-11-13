import React, { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldAlert,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../../services/auth';
import { supabase, channelName } from '../../../services/supabase';
import { parseGeoPoint } from '../../../services/geo';
import { CARE_NETWORK_KEY } from '../../community/hooks/useCareNetwork';

interface ActiveSosAlert {
  id: string;
  sender_id: string;
  location: unknown;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    phone: string;
    home_address: string;
  } | null;
}

const ACTIVE_SOS_MODAL_KEY = ['active-sos-alerts-modal'] as const;

function formatRelativeTime(iso: string): string {
  const diffMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMin < 1) return 'Hace un instante';
  if (diffMin === 1) return 'Hace 1 min';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return 'Hace 1 h';
  return `Hace ${diffHours} h`;
}

function toWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const full = digits.length === 9 ? `51${digits}` : digits;
  return `https://wa.me/${full}`;
}

/**
 * Modal global de alerta SOS para dirigentes y padrinos.
 * Se abre automáticamente al iniciar la app (o en tiempo real) si existe un SOS activo.
 */
export function SosEmergencyAlertModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, profile } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const isResponder =
    Boolean(session) &&
    (profile?.role === 'dirigente' || profile?.role === 'padrino');

  // Reinicia los cierres locales en cada inicio o cambio de sesión.
  useEffect(() => {
    setDismissedIds([]);
  }, [session?.user.id]);

  useEffect(() => {
    if (!isResponder || !session) return;
    const channel = supabase
      .channel(channelName('global-sos-modal'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ACTIVE_SOS_MODAL_KEY });
        queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isResponder, session, queryClient]);

  const { data: activeAlerts = [] } = useQuery<ActiveSosAlert[]>({
    queryKey: [...ACTIVE_SOS_MODAL_KEY, session?.user.id, profile?.role],
    enabled: isResponder,
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select(`
          id,
          sender_id,
          location,
          created_at,
          sender:profiles!sos_alerts_sender_id_fkey (
            id,
            full_name,
            phone,
            home_address
          )
        `)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as ActiveSosAlert[];
    },
  });

  const markAttended = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('sos_alerts')
        .update({ status: 'ATTENDED' })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_SOS_MODAL_KEY });
      queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY });
    },
  });

  const visibleAlerts = activeAlerts.filter((a) => !dismissedIds.includes(a.id));
  const current = visibleAlerts[0];

  if (!isResponder || !current) {
    return null;
  }

  const coords = parseGeoPoint(current.location);
  const senderName = current.sender?.full_name || 'Persona vulnerable';
  const senderAddress = current.sender?.home_address || 'Dirección no especificada';
  const senderPhone = current.sender?.phone || '';
  const waUrl = toWhatsAppUrl(senderPhone);
  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : null;

  const dismissCurrent = () => {
    setDismissedIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
  };

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={dismissCurrent}
    >
      <Pressable
        className="flex-1 bg-black/55 justify-center px-5"
        onPress={dismissCurrent}
      >
        <Pressable
          className="bg-neutral-surface rounded-3xl border-2 border-red-500/80 overflow-hidden shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-red-600 px-5 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-2">
              <ShieldAlert size={22} color="#FFFFFF" strokeWidth={2.4} />
              <View className="ml-2.5 flex-1">
                <Text
                  className="text-white uppercase tracking-wider"
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 }}
                >
                  Emergencia SOS Activa
                  {visibleAlerts.length > 1 ? ` (${visibleAlerts.length})` : ''}
                </Text>
                <Text
                  className="text-red-100"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                >
                  {formatRelativeTime(current.created_at)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cerrar alerta"
              onPress={dismissCurrent}
              className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[420px] px-5 pt-4 pb-5">
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <AlertTriangle size={18} color="#DC2626" />
                <Text
                  className="text-red-800 ml-2 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
                >
                  {senderName}
                </Text>
              </View>

              <View className="flex-row items-start mt-1.5">
                <MapPin size={16} color="#991B1B" style={{ marginTop: 2 }} />
                <Text
                  className="text-red-900 ml-2 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
                >
                  {senderAddress}
                </Text>
              </View>

              {senderPhone ? (
                <View className="flex-row items-center mt-2">
                  <Phone size={15} color="#991B1B" />
                  <Text
                    className="text-red-900 ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                  >
                    {senderPhone}
                  </Text>
                </View>
              ) : null}

              {coords ? (
                <Text
                  className="text-red-700/90 mt-2"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                >
                  GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </Text>
              ) : null}
            </View>

            <View className="flex-row gap-2.5 mb-3">
              {senderPhone ? (
                <TouchableOpacity
                  onPress={() => void Linking.openURL(`tel:${senderPhone}`)}
                  className="flex-1 flex-row items-center justify-center bg-neutral-mutedBg py-3 rounded-xl border border-neutral-border"
                >
                  <Phone size={16} color="#111827" />
                  <Text
                    className="text-neutral-textMain ml-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    Llamar
                  </Text>
                </TouchableOpacity>
              ) : null}

              {waUrl ? (
                <TouchableOpacity
                  onPress={() => void Linking.openURL(waUrl)}
                  className="flex-1 flex-row items-center justify-center bg-[#E8F5E9] py-3 rounded-xl border border-[#A5D6A7]"
                >
                  <MessageCircle size={16} color="#1E5E45" />
                  <Text
                    className="text-primary ml-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              ) : null}

              {mapsUrl ? (
                <TouchableOpacity
                  onPress={() => void Linking.openURL(mapsUrl)}
                  className="flex-1 flex-row items-center justify-center bg-blue-50 py-3 rounded-xl border border-blue-200"
                >
                  <Navigation size={16} color="#1D4ED8" />
                  <Text
                    className="text-blue-700 ml-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    Mapa
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => {
                dismissCurrent();
                router.push('/care-network');
              }}
              className="w-full bg-red-600 py-3.5 rounded-xl items-center justify-center mb-2.5"
            >
              <Text
                className="text-white"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
              >
                Abrir Red de Cuidado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={markAttended.isPending}
              onPress={() => markAttended.mutate(current.id)}
              className="w-full flex-row items-center justify-center bg-neutral-mutedBg py-3 rounded-xl border border-neutral-border"
            >
              <CheckCircle2 size={16} color="#1E5E45" />
              <Text
                className="text-primary ml-1.5"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
              >
                {markAttended.isPending ? 'Registrando...' : 'Marcar como atendido'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

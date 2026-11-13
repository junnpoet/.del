import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  HeartPulse,
  MapPin,
  ChevronLeft,
  PhoneCall,
  CheckCircle2,
  Package,
} from 'lucide-react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { useI18n } from '../src/i18n';
import { useAuth } from '../src/services/auth';
import { channelName, supabase } from '../src/services/supabase';
import { useSosAlert } from '../src/features/accessible-mode/hooks/useSosAlert';
import { useActiveEmergency } from '../src/features/emergency/hooks/useEmergencyRealtime';

interface CriticalPostItem {
  id: string;
  post_type: string;
  category: string;
  description: string;
  created_at: string | null;
}

export default function EmergencyBoardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile, session } = useAuth();
  const { activeEvent, resolveEmergency } = useActiveEmergency(profile?.group_id);
  const { send: sendSos } = useSosAlert();

  const [sosActive, setSosActive] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [criticalPosts, setCriticalPosts] = useState<CriticalPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isDirigente = profile?.role === 'dirigente';

  const fetchCriticalPosts = useCallback(async () => {
    if (!profile?.group_id) return;
    setLoadingPosts(true);
    try {
      const { data } = await supabase
        .from('solidary_posts')
        .select('id, post_type, category, description, created_at')
        .eq('group_id', profile.group_id)
        .eq('urgency', 'ALTA_CRITICA')
        .neq('status', 'RESOLVED')
        .order('created_at', { ascending: false })
        .limit(8);

      setCriticalPosts(data ?? []);
    } catch {
      // Fallback silencioso ante desconexión
    } finally {
      setLoadingPosts(false);
    }
  }, [profile?.group_id]);

  useEffect(() => {
    void fetchCriticalPosts();
    if (!profile?.group_id) return;

    const channel = supabase
      .channel(channelName(`emergency-posts-${profile.group_id}`))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solidary_posts',
          filter: `group_id=eq.${profile.group_id}`,
        },
        () => {
          void fetchCriticalPosts();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.group_id, fetchCriticalPosts]);

  const handleTriggerSOS = () => {
    Alert.alert(
      t('emergency.sosConfirmTitle'),
      t('emergency.sosConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('emergency.sosConfirmAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              await sendSos.mutateAsync();
              setSosActive(true);

              if (profile?.group_id && session?.user?.id) {
                void supabase.functions.invoke('send-push-alert', {
                  body: {
                    type: 'SOS_ALERT',
                    groupId: profile.group_id,
                    userId: session.user.id,
                    title: 'Alerta SOS Vecinal',
                    body: `${profile.full_name || 'Un vecino'} solicitó auxilio inmediato en tu sector.`,
                  },
                });
              }

              Alert.alert(t('emergency.sosSentTitle'), t('emergency.sosSentBody'));
            } catch (err) {
              Alert.alert(
                t('sos.failedTitle'),
                err instanceof Error ? err.message : t('sos.failedHelp')
              );
            }
          },
        },
      ]
    );
  };

  const handleResolveEmergency = () => {
    if (!activeEvent) return;
    Alert.alert(
      'Finalizar Contingencia',
      'Al cerrar la emergencia, todos los vecinos del sector regresarán al Modo Cotidiano.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Confirmar Cierre',
          style: 'destructive',
          onPress: async () => {
            setResolving(true);
            try {
              await resolveEmergency(activeEvent.id);
              router.replace('/(main)');
            } catch (err) {
              Alert.alert(
                'No se pudo cerrar',
                err instanceof Error ? err.message : 'Intenta nuevamente.'
              );
            } finally {
              setResolving(false);
            }
          },
        },
      ]
    );
  };

  const activatedTime = activeEvent?.activated_at
    ? new Date(activeEvent.activated_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-emergency-background">
      {/* Top Banner */}
      <View className="px-5 pt-3 pb-4 bg-emergency-background border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.backA11y')}
            onPress={() => router.back()}
            className="flex-row items-center min-h-[48px] px-3 py-2 bg-white/10 rounded-xl"
          >
            <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              className="text-white ml-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {t('emergency.backNormal')}
            </Text>
          </TouchableOpacity>

          <View className="bg-emergency-alert/20 px-3 py-1.5 rounded-full">
            <Text
              className="text-emergency-alert uppercase"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              {activeEvent?.event_type ?? t('emergency.badge')}
            </Text>
          </View>
        </View>

        <Text
          className="text-white mt-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}
        >
          {t('emergency.title')}
        </Text>
        <Text
          className="text-emergency-warning mt-0.5"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          {activeEvent
            ? `${activeEvent.description || activeEvent.event_type}${activatedTime ? ` · Inicio ${activatedTime}` : ''}`
            : t('emergency.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-20">
        {/* SOS Central Button */}
        <View className="items-center my-4">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.sosA11y')}
            onPress={handleTriggerSOS}
            disabled={sendSos.isPending}
            activeOpacity={0.85}
            className={`w-32 h-32 rounded-full items-center justify-center shadow-xl ${
              sosActive
                ? 'bg-emergency-warning'
                : 'bg-emergency-alert shadow-emergency-alert/30'
            }`}
          >
            {sendSos.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <>
                <AlertTriangle size={36} color="#FFFFFF" strokeWidth={2.2} />
                <Text
                  className="text-white mt-1 tracking-wider"
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
                >
                  {sosActive ? t('emergency.sent') : 'SOS'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text
            className="text-white/70 text-center mt-3 px-4 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.sosHint')}
          </Text>
        </View>

        {/* Critical Reports & Humanitarian Resources (Live Realtime) */}
        <Text
          className="text-white uppercase tracking-wider mb-2.5 mt-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
        >
          Recursos Críticos y Auxilio Prioritario
        </Text>

        {loadingPosts ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : criticalPosts.length > 0 ? (
          criticalPosts.map((post) => (
            <Card key={post.id} variant="emergency" className="mb-3 p-4">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center flex-1 mr-2">
                  <Package size={16} color="#F59E0B" strokeWidth={2.2} />
                  <Text
                    className="text-white ml-2"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                  >
                    {post.category}
                  </Text>
                </View>
                <Text
                  className="text-emergency-alert uppercase"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                >
                  {post.post_type}
                </Text>
              </View>
              <Text
                className="text-white/80 leading-5"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
              >
                {post.description}
              </Text>
            </Card>
          ))
        ) : (
          <Card variant="emergency" className="mb-3 p-4">
            <Text
              className="text-white/70 leading-5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
            >
              No hay pedidos críticos activos en tu sector en este momento.
            </Text>
          </Card>
        )}

        {/* Safe Zones & First Aid */}
        <Text
          className="text-white uppercase tracking-wider mb-2.5 mt-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
        >
          {t('emergency.safeTitle')}
        </Text>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <MapPin size={18} color="#16A34A" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.zone')}
            </Text>
          </View>
          <Text
            className="text-white/70 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.zoneBody')}
          </Text>
        </Card>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <HeartPulse size={18} color="#EF4444" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.kit')}
            </Text>
          </View>
          <Text
            className="text-white/70 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.kitBody')}
          </Text>
        </Card>

        <Card variant="emergency" className="mb-4 p-4">
          <View className="flex-row items-center mb-1">
            <PhoneCall size={18} color="#F59E0B" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.phones')}
            </Text>
          </View>
          <Text
            className="text-white/70 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {t('emergency.phonesBody')}
          </Text>
        </Card>

        {isDirigente && activeEvent && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleResolveEmergency}
            disabled={resolving}
            activeOpacity={0.85}
            className="mb-3 bg-emerald-600 rounded-2xl min-h-[48px] px-4 py-3 flex-row items-center justify-center"
          >
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text
              className="text-white ml-2"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {resolving ? 'Cerrando contingencia...' : 'Finalizar Contingencia'}
            </Text>
          </TouchableOpacity>
        )}

        <Button
          title={t('emergency.backButton')}
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

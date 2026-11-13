import { useCallback, useEffect, useState } from 'react';
import { channelName, supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import type { Database } from '../../../types/database';

export type EmergencyEventRow = Database['public']['Tables']['emergency_events']['Row'];

/**
 * Consulta y escucha en tiempo real el evento de emergencia activo para un grupo vecinal.
 */
export function useActiveEmergency(groupId: string | null | undefined) {
  const [activeEvent, setActiveEvent] = useState<EmergencyEventRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(groupId));

  const fetchActive = useCallback(async () => {
    if (!groupId) {
      setActiveEvent(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'ACTIVE')
        .order('activated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) {
        setActiveEvent(data ?? null);
      }
    } catch {
      // Fallback silencioso ante modo offline
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void fetchActive();
    if (!groupId) return;

    const channel = supabase
      .channel(channelName(`emergency-events-${groupId}`))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_events',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const row = payload.new as EmergencyEventRow | undefined;
          if (!row) {
            void fetchActive();
            return;
          }
          if (row.status === 'ACTIVE') {
            setActiveEvent(row);
          } else if (row.status === 'RESOLVED') {
            setActiveEvent((prev) => (prev?.id === row.id ? null : prev));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [groupId, fetchActive]);

  const resolveEmergency = useCallback(async (eventId: string) => {
    const { error } = await supabase
      .from('emergency_events')
      .update({ status: 'RESOLVED' })
      .eq('id', eventId);
    if (error) throw error;
    setActiveEvent(null);
  }, []);

  return { activeEvent, loading, refetch: fetchActive, resolveEmergency };
}

export interface ZoneEmergencyInfo {
  id: string;
  group_id: string;
  group_name: string;
  event_type: string;
  description: string | null;
  activated_at: string;
}

/**
 * Detecta en vivo si existe una emergencia activa en la comunidad del usuario
 * o en cualquier comunidad cuya zona compuesta de influencia cubra su hogar.
 */
export function useZoneEmergency() {
  const { profile, session } = useAuth();
  const [zoneEmergency, setZoneEmergency] = useState<ZoneEmergencyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(session));

  const fetchZoneEmergency = useCallback(async () => {
    if (!session || profile?.lat === null || profile?.lat === undefined || profile?.lng === null || profile?.lng === undefined) {
      setZoneEmergency(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.rpc('get_active_zone_emergency', {
        user_home_lat: profile.lat,
        user_home_lng: profile.lng,
        radius_meters: 500,
      });
      if (!error) {
        setZoneEmergency(data?.[0] ?? null);
      }
    } catch {
      // Fallback silencioso ante modo offline
    } finally {
      setLoading(false);
    }
  }, [session, profile?.lat, profile?.lng]);

  useEffect(() => {
    void fetchZoneEmergency();
    if (!session) return;

    const channel = supabase
      .channel(channelName('zone-emergency-events'))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_events' },
        () => {
          void fetchZoneEmergency();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session, fetchZoneEmergency]);

  return { zoneEmergency, loading, refetch: fetchZoneEmergency };
}

/**
 * Listener global para RootContent en app/_layout.tsx.
 * No saca al usuario del flujo principal; solo lo regresa a /(main) si estaba
 * dentro del Tablero de Ayuda Humanitaria cuando la contingencia pasa a RESOLVED.
 */
export function useEmergencyGlobalMutation() {
  const { profile } = useAuth();
  useActiveEmergency(profile?.group_id);
}

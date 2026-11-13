import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../../../services/supabase';
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
      .channel(`emergency-events-${groupId}`)
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

/**
 * Listener global (SPEC-05 §2.2) para RootContent en app/_layout.tsx.
 * Muta automáticamente a /emergency-board cuando se activa una emergencia en el grupo
 * y regresa al flujo normal cuando pasa a RESOLVED.
 */
export function useEmergencyGlobalMutation() {
  const { profile } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { activeEvent } = useActiveEmergency(profile?.group_id);
  const lastNavigatedEventIdRef = useRef<string | null>(null);
  const wasActiveOnBoardRef = useRef(false);

  const isOnEmergencyBoard = segments[0] === 'emergency-board';
  const isInMainFlow = segments[0] === '(main)';

  useEffect(() => {
    if (activeEvent) {
      if (isOnEmergencyBoard) {
        wasActiveOnBoardRef.current = true;
        lastNavigatedEventIdRef.current = activeEvent.id;
        return;
      }

      if (isInMainFlow && lastNavigatedEventIdRef.current !== activeEvent.id) {
        lastNavigatedEventIdRef.current = activeEvent.id;
        wasActiveOnBoardRef.current = true;
        router.push('/emergency-board');
      }
      return;
    }

    // Cuando el evento pasa a RESOLVED y el usuario estaba en el tablero por mutación, volver al flujo normal
    if (wasActiveOnBoardRef.current && isOnEmergencyBoard) {
      wasActiveOnBoardRef.current = false;
      lastNavigatedEventIdRef.current = null;
      router.replace('/(main)');
    } else if (!activeEvent) {
      lastNavigatedEventIdRef.current = null;
      wasActiveOnBoardRef.current = false;
    }
  }, [activeEvent, isOnEmergencyBoard, isInMainFlow, router]);
}

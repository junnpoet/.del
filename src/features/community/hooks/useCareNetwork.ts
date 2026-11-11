import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { parseGeoPoint } from '../../../services/geo';
import type { CareStatus } from '../../../types';
import { CARE_FRESH_DAYS } from '../constants';
import { channelName } from '../utils';

export const CARE_NETWORK_KEY = ['care-network'] as const;

export interface CareAssignment {
  id: string;
  status: CareStatus;
  storedStatus: CareStatus;
  notes: string | null;
  updatedAt: string | null;
  activeSosAt: string | null;
  vulnerable: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    coordinates: { latitude: number; longitude: number } | null;
  };
  /** name null = sin padrino visible; la UI lo traduce. */
  buddy: { id: string; name: string | null; phone: string | null };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Semáforo efectivo (SPEC-04 §2.3):
 * 🔴 si la persona tiene un SOS activo (o el padrino marcó alerta),
 * 🟡 si se pidió seguimiento o pasaron más de 7 días sin contacto,
 * 🟢 en otro caso.
 */
function effectiveStatus(stored: CareStatus, updatedAt: string | null, hasActiveSos: boolean): CareStatus {
  if (hasActiveSos || stored === 'ALERTA_ACTIVA') return 'ALERTA_ACTIVA';
  if (stored === 'SEGUIMIENTO_REQUERIDO') return 'SEGUIMIENTO_REQUERIDO';
  if (!updatedAt || Date.now() - new Date(updatedAt).getTime() > CARE_FRESH_DAYS * DAY_MS) {
    return 'SEGUIMIENTO_REQUERIDO';
  }
  return 'AL_DIA';
}

/**
 * Red de Acompañamiento. La RLS ya restringe las filas: el padrino solo ve sus
 * asignaciones y el dirigente ve todas. Si la consulta vuelve vacía para un
 * vecino común, la capa simplemente no se muestra.
 */
export function useCareNetwork(enabled: boolean) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !session) return;
    // Requiere que sos_alerts y care_assignments estén en la publicación
    // supabase_realtime (migración 20261108160000_spec04_capa_privada.sql).
    const channel = supabase
      .channel(channelName('care-network-live'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_assignments' }, () => {
        queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, session, queryClient]);

  const query = useQuery<CareAssignment[]>({
    queryKey: [...CARE_NETWORK_KEY, session?.user.id],
    enabled: enabled && Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_assignments')
        .select(
          'id, status, notes, updated_at, vulnerable:profiles!care_assignments_vulnerable_profile_id_fkey(id, full_name, home_address, phone, home_location), buddy:profiles!care_assignments_buddy_profile_id_fkey(id, full_name, phone)'
        )
        .order('updated_at', { ascending: true });
      if (error) throw error;

      const { data: alerts, error: sosError } = await supabase
        .from('sos_alerts')
        .select('sender_id, created_at')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });
      if (sosError) throw sosError;

      const activeSos = new Map<string, string | null>();
      (alerts ?? []).forEach((alert) => {
        if (!activeSos.has(alert.sender_id)) activeSos.set(alert.sender_id, alert.created_at);
      });

      const rows = (data ?? []).flatMap((row) => {
        const vulnerable = row.vulnerable;
        if (!vulnerable) return [];
        const stored = (row.status ?? 'AL_DIA') as CareStatus;
        const point = parseGeoPoint(vulnerable.home_location);
        const sosAt = activeSos.get(vulnerable.id) ?? null;
        const assignment: CareAssignment = {
          id: row.id,
          storedStatus: stored,
          status: effectiveStatus(stored, row.updated_at, activeSos.has(vulnerable.id)),
          notes: row.notes,
          updatedAt: row.updated_at,
          activeSosAt: sosAt,
          vulnerable: {
            id: vulnerable.id,
            name: vulnerable.full_name,
            address: vulnerable.home_address,
            phone: vulnerable.phone,
            coordinates: point ? { latitude: point.lat, longitude: point.lng } : null,
          },
          buddy: {
            id: row.buddy?.id ?? '',
            name: row.buddy?.full_name ?? null,
            phone: row.buddy?.phone ?? null,
          },
        };
        return [assignment];
      });

      const priority: Record<CareStatus, number> = {
        ALERTA_ACTIVA: 0,
        SEGUIMIENTO_REQUERIDO: 1,
        AL_DIA: 2,
      };
      return rows.sort((a, b) => priority[a.status] - priority[b.status]);
    },
  });

  /** "Registrar visita realizada": vuelve a 🟢 y da por atendido cualquier SOS activo. */
  const registerVisit = useMutation({
    mutationFn: async ({ assignment, note }: { assignment: CareAssignment; note?: string }) => {
      const { error } = await supabase
        .from('care_assignments')
        .update({
          status: 'AL_DIA',
          notes: note?.trim() || assignment.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment.id);
      if (error) throw error;

      if (assignment.activeSosAt) {
        const { error: sosError } = await supabase
          .from('sos_alerts')
          .update({ status: 'ATTENDED' })
          .eq('sender_id', assignment.vulnerable.id)
          .eq('status', 'ACTIVE');
        if (sosError) throw sosError;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY }),
  });

  const requestFollowUp = useMutation({
    mutationFn: async (assignment: CareAssignment) => {
      const { error } = await supabase
        .from('care_assignments')
        .update({ status: 'SEGUIMIENTO_REQUERIDO', updated_at: new Date().toISOString() })
        .eq('id', assignment.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY }),
  });

  return {
    assignments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    registerVisit,
    requestFollowUp,
  };
}

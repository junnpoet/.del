import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { NEWS_QUERY_KEY } from '../../public/hooks/useNews';
import { CARE_NETWORK_KEY } from './useCareNetwork';
import { channelName } from '../utils';
import { tr } from '../../../i18n';

const JOIN_REQUESTS_KEY = ['leader', 'join-requests'] as const;
const REPORTS_KEY = ['leader', 'service-reports'] as const;
const PEOPLE_KEY = ['leader', 'people'] as const;
const MEMBERS_KEY = ['leader', 'members'] as const;
const GROUP_KEY = ['leader', 'group'] as const;

const REPORT_REASONS = ['COBRO_ABUSIVO', 'INCUMPLIMIENTO', 'PERFIL_FALSO', 'FALTA_RESPETO', 'OTRO'] as const;

/** Motivo de denuncia traducido; si llega un valor desconocido se muestra tal cual. */
export function reportReasonLabel(reason: string): string {
  return (REPORT_REASONS as readonly string[]).includes(reason)
    ? tr(`reason.${reason as (typeof REPORT_REASONS)[number]}`)
    : reason;
}

export interface PersonOption {
  id: string;
  name: string;
  address: string;
  role: string | null;
}

/**
 * Solicitudes de unión pendientes del grupo que lidera el usuario, en vivo.
 * Se usa en el panel completo y en el banner del Muro Solidario.
 */
export function useJoinRequests(enabled: boolean) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const active = enabled && Boolean(session);

  useEffect(() => {
    if (!active) return;
    const channel = supabase
      .channel(channelName('join-requests-live'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_join_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: JOIN_REQUESTS_KEY });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [active, queryClient]);

  const requests = useQuery({
    queryKey: [...JOIN_REQUESTS_KEY, userId],
    enabled: active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select('id, full_name, address, whatsapp_phone, is_emergency, is_from_whatsapp, created_at')
        .eq('status', 'PENDING')
        .order('is_emergency', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Aprobar en 1 tap: crea el perfil si viene de WhatsApp y envía mensaje de bienvenida.
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.functions.invoke('approve-join-request', {
        body: { requestId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOIN_REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
      queryClient.invalidateQueries({ queryKey: PEOPLE_KEY });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('group_join_requests')
        .update({ status: 'REJECTED' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: JOIN_REQUESTS_KEY }),
  });

  return { requests, approveRequest, rejectRequest };
}

/** Datos y acciones del Panel de Gestión del Dirigente Barrial (SPEC-04 §2.5). */
export function useLeaderDashboard(enabled: boolean) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const active = enabled && Boolean(session);
  const { requests: joinRequests, approveRequest, rejectRequest } = useJoinRequests(enabled);

  // Grupo que lidera (para el sector de las noticias y filtrar candidatos a padrino).
  const group = useQuery({
    queryKey: [...GROUP_KEY, userId],
    enabled: active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhood_groups')
        .select('id, name, sector_name')
        .eq('leader_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // 2. Bandeja de denuncias comunitarias.
  const reports = useQuery({
    queryKey: [...REPORTS_KEY, userId],
    enabled: active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_reports')
        .select(
          'id, reason, details, status, created_at, service:services(title, category), reporter:profiles!service_reports_reporter_id_fkey(full_name)'
        )
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Requiere la política "Dirigentes actualizan reportes" de la migración SPEC-04.
  const resolveReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'REVIEWED' | 'DISMISSED' }) => {
      const { error } = await supabase.from('service_reports').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
  });

  // 3. Gestión de padrinazgo: personas vulnerables y vecinos candidatos.
  const people = useQuery({
    queryKey: [...PEOPLE_KEY, userId, group.data?.id],
    enabled: active && !group.isLoading,
    queryFn: async () => {
      const { data: vulnerable, error } = await supabase
        .from('profiles')
        .select('id, full_name, home_address, role')
        .eq('is_vulnerable', true)
        .order('full_name');
      if (error) throw error;

      let candidatesQuery = supabase
        .from('profiles')
        .select('id, full_name, home_address, role')
        .eq('is_vulnerable', false)
        .neq('id', userId!)
        .order('full_name')
        .limit(60);
      if (group.data?.id) candidatesQuery = candidatesQuery.eq('group_id', group.data.id);
      const { data: candidates, error: candidatesError } = await candidatesQuery;
      if (candidatesError) throw candidatesError;

      const toOption = (row: {
        id: string;
        full_name: string;
        home_address: string;
        role: string | null;
      }): PersonOption => ({
        id: row.id,
        name: row.full_name,
        address: row.home_address,
        role: row.role,
      });

      return {
        vulnerable: (vulnerable ?? []).map(toOption),
        candidates: (candidates ?? [])
          .map(toOption)
          // Primero quienes ya tienen rol de padrino.
          .sort((a, b) => Number(b.role === 'padrino') - Number(a.role === 'padrino')),
      };
    },
  });

  const assignPadrino = useMutation({
    mutationFn: async ({ vulnerableId, buddyId }: { vulnerableId: string; buddyId: string }) => {
      const { error } = await supabase.from('care_assignments').insert({
        vulnerable_profile_id: vulnerableId,
        buddy_profile_id: buddyId,
        status: 'SEGUIMIENTO_REQUERIDO',
        notes: tr('leader.padrinos.newNote'),
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY }),
  });

  const removeAssignment = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from('care_assignments').delete().eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY }),
  });

  // 4. Publicador de noticias zonales.
  const publishNews = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase.from('neighborhood_news').insert({
        sector_name: group.data?.sector_name ?? 'Sector 4',
        title: title.trim(),
        content: content.trim(),
        source: 'DIRIGENCIA',
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY }),
  });

  // 5. Miembros actuales de la comunidad.
  const members = useQuery({
    queryKey: [...MEMBERS_KEY, userId, group.data?.id],
    enabled: active && Boolean(group.data?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, home_address, role, is_vulnerable')
        .eq('group_id', group.data!.id)
        .order('full_name');
      if (error) throw error;
      return data ?? [];
    },
  });

  const removeMember = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.rpc('remove_group_member', {
        target_user_id: targetUserId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
      queryClient.invalidateQueries({ queryKey: PEOPLE_KEY });
      queryClient.invalidateQueries({ queryKey: CARE_NETWORK_KEY });
    },
  });

  return {
    group: group.data ?? null,
    joinRequests,
    approveRequest,
    rejectRequest,
    members,
    removeMember,
    reports,
    resolveReport,
    people,
    assignPadrino,
    removeAssignment,
    publishNews,
  };
}

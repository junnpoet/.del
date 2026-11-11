import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { parseGeoPoint } from '../../../services/geo';
import type { PostStatus, PostType, UrgencyLevel } from '../../../types';
import { channelName } from '../utils';
import { tr } from '../../../i18n';

export const SOLIDARY_FEED_KEY = ['solidary-feed'] as const;

export interface SolidaryPost {
  id: string;
  postType: PostType;
  category: string;
  description: string;
  urgency: UrgencyLevel;
  status: PostStatus;
  isFromWhatsapp: boolean;
  authorId: string | null;
  /** null si la RLS oculta al autor: la UI muestra "Vecino/a del sector" en el idioma activo. */
  authorName: string | null;
  contactPhone: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  createdAt: string | null;
}

/** Muro Solidario en vivo: lista + suscripción Realtime a solidary_posts. */
export function useSolidaryFeed(enabled: boolean) {
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();
  const groupId = profile?.group_id ?? null;

  useEffect(() => {
    if (!enabled || !session) return;
    const channel = supabase
      .channel(channelName('solidary-feed-live'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solidary_posts' }, () => {
        queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, session, queryClient]);

  return useQuery<SolidaryPost[]>({
    queryKey: [...SOLIDARY_FEED_KEY, groupId],
    enabled: enabled && Boolean(session),
    queryFn: async () => {
      let query = supabase
        .from('solidary_posts')
        .select(
          'id, post_type, category, description, urgency, status, is_from_whatsapp, author_id, whatsapp_sender_name, whatsapp_sender_phone, created_at, author:profiles!solidary_posts_author_id_fkey(full_name, phone, home_location)'
        )
        .neq('status', 'RESOLVED')
        .order('created_at', { ascending: false })
        .limit(100);
      if (groupId) query = query.or(`group_id.eq.${groupId},group_id.is.null`);

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((row) => {
        const author = row.author;
        const point = parseGeoPoint(author?.home_location);
        return {
          id: row.id,
          postType: row.post_type as PostType,
          category: row.category,
          description: row.description,
          urgency: (row.urgency ?? 'MEDIA') as UrgencyLevel,
          status: (row.status ?? 'OPEN') as PostStatus,
          isFromWhatsapp: Boolean(row.is_from_whatsapp),
          authorId: row.author_id,
          authorName: (row.is_from_whatsapp ? row.whatsapp_sender_name : author?.full_name) ?? null,
          contactPhone: row.is_from_whatsapp ? row.whatsapp_sender_phone : author?.phone ?? null,
          coordinates: point ? { latitude: point.lat, longitude: point.lng } : null,
          createdAt: row.created_at,
        };
      });
    },
  });
}

export interface NewSolidaryPost {
  postType: PostType;
  category: string;
  description: string;
  urgency?: UrgencyLevel;
}

/** Publica en el muro. Usa networkMode offlineFirst del queryClient (outbox). */
export function useCreateSolidaryPost() {
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewSolidaryPost) => {
      if (!session) throw new Error(tr('sos.errorLogin'));
      const { error } = await supabase.from('solidary_posts').insert({
        author_id: session.user.id,
        group_id: profile?.group_id ?? null,
        post_type: input.postType,
        category: input.category,
        description: input.description,
        urgency: input.urgency ?? 'MEDIA',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });
}

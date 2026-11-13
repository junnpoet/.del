import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { parseGeoPoint } from '../../../services/geo';
import { resolveAvatarUrl } from '../../../constants/testAvatars';
import type { PostStatus, PostType, UrgencyLevel } from '../../../types';
import { channelName } from '../utils';
import { tr } from '../../../i18n';

export const SOLIDARY_FEED_KEY = ['solidary-feed'] as const;

export interface PostVolunteer {
  id: string;
  userId: string;
  userName: string | null;
  roleNote: string | null;
  createdAt: string | null;
}

export interface SolidaryPost {
  id: string;
  postType: PostType;
  category: string;
  description: string;
  urgency: UrgencyLevel;
  status: PostStatus;
  isFromWhatsapp: boolean;
  isAiVoice: boolean;
  targetVolunteers: number | null;
  acceptedHelperId: string | null;
  authorId: string | null;
  /** null si la RLS oculta al autor: la UI muestra "Vecino/a del sector" en el idioma activo. */
  authorName: string | null;
  authorAvatarUrl: string | null;
  contactPhone: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  commentsCount: number;
  commenterIds: string[];
  volunteers: PostVolunteer[];
  createdAt: string | null;
}

/** Muro Solidario en vivo: lista completa (OPEN, IN_PROGRESS, RESOLVED) + suscripción Realtime. */
export function useSolidaryFeed(enabled: boolean) {
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();
  const groupId = profile?.group_id ?? null;

  useEffect(() => {
    if (!enabled || !session) return;
    const invalidate = () => queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    const channel = supabase
      .channel(channelName('solidary-feed-live'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solidary_posts' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solidary_comments' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, session, queryClient]);

  return useQuery<SolidaryPost[]>({
    queryKey: [...SOLIDARY_FEED_KEY, groupId],
    enabled: enabled && Boolean(session),
    queryFn: async () => {
      const buildQuery = (withAvatar: boolean) => {
        const authorCols = withAvatar
          ? 'full_name, phone, home_location, avatar_url'
          : 'full_name, phone, home_location';
        let query = supabase
          .from('solidary_posts')
          .select(
            `id, post_type, category, description, urgency, status, is_from_whatsapp, is_ai_voice, target_volunteers, accepted_helper_id, author_id, whatsapp_sender_name, whatsapp_sender_phone, created_at, author:profiles!solidary_posts_author_id_fkey(${authorCols}), solidary_comments(id, author_id), volunteers(id, user_id, role_note, created_at, user:profiles!volunteers_user_id_fkey(full_name))`
          )
          .order('created_at', { ascending: false })
          .limit(100);
        if (groupId) query = query.or(`group_id.eq.${groupId},group_id.is.null`);
        return query;
      };

      const initial = await buildQuery(true);
      let rows = initial.data as typeof initial.data | null;
      if (initial.error) {
        if (initial.error.code !== '42703') throw initial.error;
        const fallback = await buildQuery(false);
        if (fallback.error) throw fallback.error;
        rows = fallback.data as unknown as typeof initial.data;
      }

      return (rows ?? []).map((row) => {
        const author = row.author as {
          full_name: string;
          phone: string;
          home_location: unknown;
          avatar_url?: string | null;
        } | null;
        const point = parseGeoPoint(author?.home_location);
        return {
          id: row.id,
          postType: row.post_type as PostType,
          category: row.category,
          description: row.description,
          urgency: (row.urgency ?? 'MEDIA') as UrgencyLevel,
          status: (row.status ?? 'OPEN') as PostStatus,
          isFromWhatsapp: Boolean(row.is_from_whatsapp),
          isAiVoice: Boolean(row.is_ai_voice),
          targetVolunteers: row.target_volunteers ?? null,
          acceptedHelperId: row.accepted_helper_id ?? null,
          authorId: row.author_id,
          authorName: (row.is_from_whatsapp ? row.whatsapp_sender_name : author?.full_name) ?? null,
          authorAvatarUrl: row.is_from_whatsapp
            ? null
            : resolveAvatarUrl(row.author_id, author?.avatar_url),
          contactPhone: row.is_from_whatsapp ? row.whatsapp_sender_phone : author?.phone ?? null,
          coordinates: point ? { latitude: point.lat, longitude: point.lng } : null,
          commentsCount: Array.isArray(row.solidary_comments) ? row.solidary_comments.length : 0,
          commenterIds: Array.isArray(row.solidary_comments)
            ? row.solidary_comments
                .map((c) => (c as { author_id?: string | null }).author_id)
                .filter((id): id is string => Boolean(id))
            : [],
          volunteers: Array.isArray(row.volunteers)
            ? row.volunteers.map((v) => ({
                id: v.id,
                userId: v.user_id,
                userName: v.user?.full_name ?? null,
                roleNote: v.role_note ?? null,
                createdAt: v.created_at ?? null,
              }))
            : [],
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
  isAiVoice?: boolean;
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
        is_ai_voice: Boolean(input.isAiVoice),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });
}

/** Actualiza el estado de un pedido solidario (OPEN / IN_PROGRESS / RESOLVED). */
export function useUpdatePostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: PostStatus }) => {
      const { error } = await supabase
        .from('solidary_posts')
        .update({ status })
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });
}

/** Suma o retira la participación del usuario actual en voluntarios de un post. */
export function useToggleVolunteer() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isJoined,
      roleNote,
    }: {
      postId: string;
      isJoined: boolean;
      roleNote?: string | null;
    }) => {
      if (!session) throw new Error(tr('sos.errorLogin'));
      if (isJoined) {
        const { error } = await supabase
          .from('volunteers')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('volunteers').insert({
          post_id: postId,
          user_id: session.user.id,
          role_note: roleNote ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });
}

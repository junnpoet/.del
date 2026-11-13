import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import type { SolidaryCommentItem } from '../../../types';
import { channelName } from '../utils';
import { SOLIDARY_FEED_KEY } from './useSolidaryFeed';
import { tr } from '../../../i18n';

const COMMENTS_KEY = ['solidary-comments'] as const;

/** Comentarios de coordinación Realtime para una publicación solidaria (SPEC-04 §2.3). */
export function useSolidaryComments(postId: string | null) {
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();
  const active = Boolean(postId && session);

  useEffect(() => {
    if (!active || !postId) return;
    const channel = supabase
      .channel(channelName(`solidary-comments-${postId}`))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solidary_comments', filter: `post_id=eq.${postId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: [...COMMENTS_KEY, postId] });
          queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [active, postId, queryClient]);

  const comments = useQuery<SolidaryCommentItem[]>({
    queryKey: [...COMMENTS_KEY, postId],
    enabled: active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solidary_comments')
        .select('id, post_id, author_id, author_name, whatsapp_sender_phone, content, is_accepted, created_at')
        .eq('post_id', postId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        postId: row.post_id,
        authorId: row.author_id,
        authorName: row.author_name,
        whatsappSenderPhone: row.whatsapp_sender_phone,
        content: row.content,
        isAccepted: Boolean(row.is_accepted),
        createdAt: row.created_at ?? new Date().toISOString(),
      }));
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!session || !postId) throw new Error(tr('sos.errorLogin'));
      const { error } = await supabase.from('solidary_comments').insert({
        post_id: postId,
        author_id: session.user.id,
        author_name: profile?.full_name ?? null,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COMMENTS_KEY, postId] });
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });

  const acceptSupport = useMutation({
    mutationFn: async ({ commentId, helperId }: { commentId: string; helperId: string | null | undefined }) => {
      if (!postId) return;
      const { error: commentError } = await supabase
        .from('solidary_comments')
        .update({ is_accepted: true })
        .eq('id', commentId);
      if (commentError) throw commentError;

      const { error: postError } = await supabase
        .from('solidary_posts')
        .update({
          status: 'IN_PROGRESS',
          accepted_helper_id: helperId ?? null,
        })
        .eq('id', postId);
      if (postError) throw postError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COMMENTS_KEY, postId] });
      queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
    },
  });

  return { comments, addComment, acceptSupport };
}

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { channelName, supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import type { Database } from '../../../types/database';

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ChatConversation = Database['public']['Tables']['chat_conversations']['Row'] & {
  service?: {
    id: string;
    title: string;
    category: string;
    rating_avg: number | null;
    reviews_total: number | null;
  } | null;
  provider?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  client?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
};
export type ServiceReview = Database['public']['Tables']['reviews']['Row'];

export function useServiceChat(conversationId: string) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const conversationQueryKey = ['chat-conversation', conversationId] as const;
  const messagesQueryKey = ['chat-messages', conversationId] as const;
  const reviewQueryKey = ['chat-review', conversationId] as const;

  // 1. Fetch conversation details + profiles
  const conversationQuery = useQuery<ChatConversation | null>({
    queryKey: conversationQueryKey,
    enabled: Boolean(conversationId && userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          service:services(id, title, category, rating_avg, reviews_total),
          provider:profiles!chat_conversations_provider_id_fkey(id, full_name, phone),
          client:profiles!chat_conversations_client_id_fkey(id, full_name, phone)
        `)
        .eq('id', conversationId)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as ChatConversation) ?? null;
    },
  });

  const conversation = conversationQuery.data;

  // 2. Fetch messages
  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: messagesQueryKey,
    enabled: Boolean(conversationId && userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  // 3. Fetch existing review if any
  const reviewQuery = useQuery<ServiceReview | null>({
    queryKey: [...reviewQueryKey, conversation?.service_id, conversation?.client_id],
    enabled: Boolean(conversation?.service_id && conversation?.client_id),
    queryFn: async () => {
      if (!conversation?.service_id || !conversation?.client_id) return null;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('service_id', conversation.service_id)
        .eq('client_id', conversation.client_id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data ?? null;
    },
  });

  // 4. Supabase Realtime for incoming messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(channelName(`chat-room-${conversationId}`))
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          queryClient.setQueryData<ChatMessage[]>(messagesQueryKey, (old = []) => {
            if (old.some((m) => m.id === newMsg.id)) return old;
            return [...old, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: reviewQueryKey });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, messagesQueryKey, queryClient, reviewQueryKey]);

  // 5. Send regular text message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !userId || !conversationId) return;

      try {
        setIsSending(true);
        const { error } = await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: trimmed,
          is_review_request: false,
        });
        if (error) throw error;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, userId]
  );

  // 6. Request Visto Bueno Vecinal (Provider only)
  const requestReview = useCallback(async () => {
    if (!userId || !conversationId) return;

    try {
      setIsSending(true);
      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: 'He solicitado el Visto Bueno Vecinal para este servicio.',
        is_review_request: true,
      });
      if (error) throw error;
    } finally {
      setIsSending(false);
    }
  }, [conversationId, userId]);

  // 7. Submit Visto Bueno (Client only)
  const submitReview = useCallback(
    async (rating: number, comment?: string) => {
      if (!userId || !conversation?.service_id) {
        throw new Error('MISSING_CONTEXT');
      }

      try {
        setIsSubmittingReview(true);
        const { error } = await supabase.from('reviews').insert({
          service_id: conversation.service_id,
          client_id: userId,
          rating,
          comment: comment?.trim() || null,
        });

        if (error) throw error;

        // Also post a confirmation message in the chat
        await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: `Visto Bueno Vecinal otorgado (${rating}/5).`,
          is_review_request: false,
        });

        await queryClient.invalidateQueries({ queryKey: reviewQueryKey });
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [conversation?.service_id, conversationId, queryClient, reviewQueryKey, userId]
  );

  const isProvider = Boolean(userId && conversation?.provider_id === userId);
  const isClient = Boolean(userId && conversation?.client_id === userId);

  return {
    conversation,
    messages: messagesQuery.data ?? [],
    existingReview: reviewQuery.data ?? null,
    isLoading: conversationQuery.isLoading || messagesQuery.isLoading,
    isError: conversationQuery.isError || messagesQuery.isError,
    error: conversationQuery.error || messagesQuery.error,
    isProvider,
    isClient,
    currentUserId: userId,
    sendMessage,
    requestReview,
    submitReview,
    isSending,
    isSubmittingReview,
    refetchMessages: messagesQuery.refetch,
  };
}

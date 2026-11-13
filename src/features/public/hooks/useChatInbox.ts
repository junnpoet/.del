import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';

export interface InboxConversation {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  created_at: string | null;
  service: {
    id: string;
    title: string;
    category: string;
    listing_type: string | null;
  } | null;
  provider: {
    id: string;
    full_name: string;
  } | null;
  client: {
    id: string;
    full_name: string;
  } | null;
  latestMessage: {
    id: string;
    content: string;
    created_at: string | null;
    is_review_request: boolean | null;
    sender_id: string;
  } | null;
}

export const CHAT_INBOX_QUERY_KEY = ['chat-inbox'] as const;

export function useChatInbox() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chat-inbox-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => {
          queryClient.invalidateQueries({ queryKey: CHAT_INBOX_QUERY_KEY });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: CHAT_INBOX_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const query = useQuery<InboxConversation[]>({
    queryKey: [...CHAT_INBOX_QUERY_KEY, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];

      const { data: convs, error: convError } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          service_id,
          client_id,
          provider_id,
          created_at,
          service:services(id, title, category, listing_type),
          provider:profiles!chat_conversations_provider_id_fkey(id, full_name),
          client:profiles!chat_conversations_client_id_fkey(id, full_name)
        `)
        .or(`provider_id.eq.${userId},client_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (convError) throw convError;
      if (!convs?.length) return [];

      const convIds = convs.map((c) => c.id);
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('id, conversation_id, content, created_at, is_review_request, sender_id')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      const latestByConv = new Map<string, InboxConversation['latestMessage']>();
      for (const msg of messages ?? []) {
        if (!latestByConv.has(msg.conversation_id)) {
          latestByConv.set(msg.conversation_id, {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            is_review_request: msg.is_review_request,
            sender_id: msg.sender_id,
          });
        }
      }

      const enriched = (convs as unknown as Omit<InboxConversation, 'latestMessage'>[]).map(
        (conv) => ({
          ...conv,
          latestMessage: latestByConv.get(conv.id) ?? null,
        })
      );

      // Sort by latest message timestamp (or conversation created_at)
      return enriched.sort((a, b) => {
        const timeA = a.latestMessage?.created_at ?? a.created_at ?? '';
        const timeB = b.latestMessage?.created_at ?? b.created_at ?? '';
        return timeB.localeCompare(timeA);
      });
    },
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    isError: query.isError,
    currentUserId: userId,
  };
}

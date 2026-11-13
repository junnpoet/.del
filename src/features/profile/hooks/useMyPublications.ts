import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../services/auth';
import { supabase } from '../../../services/supabase';
import type { Database, ListingType, PostStatus, PostType, UrgencyLevel } from '../../../types';
import { DIRECTORY_QUERY_KEY, normalizeListingType } from '../../public/hooks/useDirectory';
import { SOLIDARY_FEED_KEY } from '../../community/hooks/useSolidaryFeed';

export const MY_PUBLICATIONS_KEY = ['my-publications'] as const;

export interface MyServicePublication {
  id: string;
  providerId: string;
  listingType: ListingType;
  title: string;
  category: string;
  description: string | null;
  createdAt: string;
}

export interface MySolidaryPublication {
  id: string;
  authorId: string;
  postType: PostType;
  category: string;
  description: string;
  urgency: UrgencyLevel;
  status: PostStatus;
  createdAt: string;
}

export function useMyPublications() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: MY_PUBLICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SOLIDARY_FEED_KEY });
  };

  const servicesQuery = useQuery<MyServicePublication[]>({
    queryKey: [...MY_PUBLICATIONS_KEY, 'services', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('id, provider_id, listing_type, title, category, description, created_at')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        providerId: row.provider_id,
        listingType: normalizeListingType(row.listing_type),
        title: row.title,
        category: row.category,
        description: row.description,
        createdAt: row.created_at ?? new Date().toISOString(),
      }));
    },
  });

  const solidaryQuery = useQuery<MySolidaryPublication[]>({
    queryKey: [...MY_PUBLICATIONS_KEY, 'solidary', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('solidary_posts')
        .select('id, author_id, post_type, category, description, urgency, status, created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        authorId: row.author_id ?? userId,
        postType: row.post_type as PostType,
        category: row.category,
        description: row.description,
        urgency: row.urgency as UrgencyLevel,
        status: row.status as PostStatus,
        createdAt: row.created_at ?? new Date().toISOString(),
      }));
    },
  });

  const updateService = useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      category?: string;
      description?: string;
      listingType?: ListingType;
    }) => {
      if (!userId) throw new Error('Inicia sesión para editar tu publicación.');
      const payload: Database['public']['Tables']['services']['Update'] = {};
      if (input.title !== undefined) payload.title = input.title;
      if (input.category !== undefined) payload.category = input.category;
      if (input.description !== undefined) payload.description = input.description;
      if (input.listingType !== undefined) payload.listing_type = input.listingType;

      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', input.id)
        .eq('provider_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!userId) throw new Error('Inicia sesión para eliminar tu publicación.');
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('provider_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const updateSolidaryPost = useMutation({
    mutationFn: async (input: {
      id: string;
      category?: string;
      description?: string;
      urgency?: UrgencyLevel;
      postType?: PostType;
      status?: PostStatus;
    }) => {
      if (!userId) throw new Error('Inicia sesión para editar tu publicación.');
      const payload: Database['public']['Tables']['solidary_posts']['Update'] = {};
      if (input.category !== undefined) payload.category = input.category;
      if (input.description !== undefined) payload.description = input.description;
      if (input.urgency !== undefined) payload.urgency = input.urgency;
      if (input.postType !== undefined) payload.post_type = input.postType;
      if (input.status !== undefined) payload.status = input.status;

      const { error } = await supabase
        .from('solidary_posts')
        .update(payload)
        .eq('id', input.id)
        .eq('author_id', userId);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  return {
    services: servicesQuery.data ?? [],
    solidaryPosts: solidaryQuery.data ?? [],
    isLoading: servicesQuery.isLoading || solidaryQuery.isLoading,
    isRefetching: servicesQuery.isRefetching || solidaryQuery.isRefetching,
    refetch: async () => {
      await Promise.all([servicesQuery.refetch(), solidaryQuery.refetch()]);
    },
    updateService,
    deleteService,
    updateSolidaryPost,
  };
}

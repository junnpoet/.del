import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import type { Database } from '../../../types/database';

export type NeighborhoodNews =
  Database['public']['Tables']['neighborhood_news']['Row'];

export const NEWS_QUERY_KEY = ['neighborhood_news'] as const;

export function useNews() {
  return useQuery<NeighborhoodNews[]>({
    queryKey: NEWS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('neighborhood_news')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

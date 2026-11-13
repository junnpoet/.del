import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelName, supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';

export const FAVORITES_QUERY_KEY = ['user-favorites'] as const;
const STORAGE_PREFIX = '@sumayni/favorites:';

export function useFavorites() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [offlineFavorites, setOfflineFavorites] = useState<string[]>([]);
  const storageKey = userId ? `${STORAGE_PREFIX}${userId}` : null;

  // Load local cache from AsyncStorage on start/user change
  useEffect(() => {
    if (!storageKey) {
      setOfflineFavorites([]);
      return;
    }
    let isMounted = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!isMounted || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setOfflineFavorites(parsed);
          }
        } catch {
          // Ignore invalid JSON
        }
      })
      .catch((err) => console.warn('Error reading favorites from AsyncStorage', err));

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  // Query Supabase favorites when online
  const {
    data: remoteFavorites,
    isLoading: isLoadingRemote,
    refetch,
  } = useQuery<string[]>({
    queryKey: [...FAVORITES_QUERY_KEY, userId],
    enabled: Boolean(userId),
    networkMode: 'offlineFirst',
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('service_id')
        .eq('user_id', userId);
      if (error) throw error;
      const ids = (data ?? []).map((row) => row.service_id);

      // Keep local AsyncStorage cache synchronized
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(ids)).catch(() => {});
      }
      return ids;
    },
  });

  // Keep offlineFavorites in sync with query data
  const currentFavorites = remoteFavorites ?? offlineFavorites;

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(channelName(`favorites-live-${userId}`))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_favorites',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const toggleMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!userId) throw new Error('AUTH_REQUIRED');
      const isFav = currentFavorites.includes(serviceId);
      const nextFavorites = isFav
        ? currentFavorites.filter((id) => id !== serviceId)
        : [...currentFavorites, serviceId];

      // Optimistically update local AsyncStorage
      if (storageKey) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(nextFavorites));
      }
      setOfflineFavorites(nextFavorites);

      if (isFav) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('service_id', serviceId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_favorites').insert({
          user_id: userId,
          service_id: serviceId,
        });
        if (error) throw error;
      }
    },
    onMutate: async (serviceId: string) => {
      await queryClient.cancelQueries({ queryKey: [...FAVORITES_QUERY_KEY, userId] });
      const previous = queryClient.getQueryData<string[]>([...FAVORITES_QUERY_KEY, userId]) ?? currentFavorites;
      const isFav = previous.includes(serviceId);
      const next = isFav ? previous.filter((id) => id !== serviceId) : [...previous, serviceId];
      queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], next);
      return { previous };
    },
    onError: (_err, _serviceId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([...FAVORITES_QUERY_KEY, userId], context.previous);
        if (storageKey) {
          AsyncStorage.setItem(storageKey, JSON.stringify(context.previous)).catch(() => {});
        }
        setOfflineFavorites(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  const isFavorite = useCallback(
    (serviceId: string) => currentFavorites.includes(serviceId),
    [currentFavorites]
  );

  return {
    favorites: currentFavorites,
    isFavorite,
    toggleFavorite: toggleMutation.mutate,
    isTogglingFavorite: toggleMutation.isPending,
    isLoading: isLoadingRemote && offlineFavorites.length === 0,
    refetch,
  };
}

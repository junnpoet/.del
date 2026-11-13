import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { channelName, supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { useFavorites } from './useFavorites';
import type { Database } from '../../../types/database';
import type { ListingType } from '../../../types';

export type NearbyService =
  Database['public']['Functions']['get_nearby_services']['Returns'][number];

export const DIRECTORY_QUERY_KEY = ['nearby-services'] as const;

export function normalizeListingType(value?: string | null): ListingType {
  if (value === 'PRODUCTO' || value === 'AUXILIO') return value;
  return 'SERVICIO';
}

export function useDirectory(radiusMeters: number) {
  const { profile, session } = useAuth();
  const queryClient = useQueryClient();
  const favoritesManager = useFavorites();

  // Hiperlocalidad Sumayni: la distancia y el radio se calculan SIEMPRE
  // desde el hogar registrado en el perfil, nunca desde el GPS transitorio.
  const homeCoordinates =
    profile?.lat !== null &&
    profile?.lat !== undefined &&
    profile?.lng !== null &&
    profile?.lng !== undefined
      ? { latitude: profile.lat, longitude: profile.lng }
      : null;

  const hasLocation = Boolean(homeCoordinates);

  const coordinateKey = homeCoordinates
    ? `${homeCoordinates.latitude.toFixed(4)}-${homeCoordinates.longitude.toFixed(4)}`
    : 'none';

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel(channelName('directory-live'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        queryClient.invalidateQueries({ queryKey: DIRECTORY_QUERY_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, session]);

  const services = useQuery<NearbyService[]>({
    queryKey: [...DIRECTORY_QUERY_KEY, session?.user.id, radiusMeters, coordinateKey],
    enabled: Boolean(session && hasLocation),
    networkMode: 'offlineFirst',
    queryFn: async () => {
      if (!homeCoordinates) return [];
      const { data, error } = await supabase.rpc('get_nearby_services', {
        radius_meters: radiusMeters,
        user_home_lat: homeCoordinates.latitude,
        user_home_lng: homeCoordinates.longitude,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Wave 0: get_nearby_services ya incluye provider_lat y provider_lng
  const locations = useMemo(() => {
    const map: Record<string, { latitude: number; longitude: number }> = {};
    for (const item of services.data ?? []) {
      if (
        typeof item.provider_lat === 'number' &&
        typeof item.provider_lng === 'number' &&
        Number.isFinite(item.provider_lat) &&
        Number.isFinite(item.provider_lng)
      ) {
        map[item.service_id] = {
          latitude: item.provider_lat,
          longitude: item.provider_lng,
        };
      }
    }
    return map;
  }, [services.data]);

  return {
    services: services.data ?? [],
    isLoading: services.isLoading,
    isError: services.isError,
    error: services.error,
    refetch: services.refetch,
    isRefetching: services.isRefetching,
    favorites: favoritesManager.favorites,
    isFavorite: favoritesManager.isFavorite,
    toggleFavorite: favoritesManager.toggleFavorite,
    isTogglingFavorite: favoritesManager.isTogglingFavorite,
    locations,
    hasLocation,
    coordinates: homeCoordinates,
  };
}

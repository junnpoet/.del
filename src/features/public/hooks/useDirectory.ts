import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { parseGeoPoint } from '../../../services/geo';
import { useFavorites } from './useFavorites';
import type { Database } from '../../../types/database';

type NearbyService = Database['public']['Functions']['get_nearby_services']['Returns'][number];

export const DIRECTORY_QUERY_KEY = ['nearby-services'] as const;

export function useDirectory(radiusMeters: number) {
  const { profile, session } = useAuth();
  const queryClient = useQueryClient();
  const favoritesManager = useFavorites();

  // Hiperlocalidad Sumayni: la distancia y el radio se calculan SIEMPRE
  // desde el hogar registrado en el perfil, nunca desde el GPS transitorio.
  const homeCoordinates =
    profile?.lat !== null && profile?.lat !== undefined &&
    profile?.lng !== null && profile?.lng !== undefined
      ? { latitude: profile.lat, longitude: profile.lng }
      : null;

  const hasLocation = Boolean(homeCoordinates);

  const coordinateKey = homeCoordinates
    ? `${homeCoordinates.latitude.toFixed(4)}-${homeCoordinates.longitude.toFixed(4)}`
    : 'none';

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel('directory-live')
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

  const locations = useQuery<Record<string, { latitude: number; longitude: number }>>({
    queryKey: ['service-locations', services.data?.map((service) => service.service_id).join(',')],
    enabled: Boolean(services.data?.length),
    queryFn: async () => {
      const providerIds = Array.from(
        new Set((services.data ?? []).map((service) => service.provider_id))
      );
      const { data, error } = await supabase
        .from('profiles')
        .select('id, home_location')
        .in('id', providerIds);
      if (error) throw error;

      const byProvider: Record<string, { latitude: number; longitude: number }> = {};
      (data ?? []).forEach((provider) => {
        const point = parseGeoPoint(provider.home_location);
        if (point) {
          byProvider[provider.id] = { latitude: point.lat, longitude: point.lng };
        }
      });

      return Object.fromEntries(
        (services.data ?? [])
          .filter((service) => byProvider[service.provider_id])
          .map((service) => [service.service_id, byProvider[service.provider_id]])
      );
    },
  });

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
    locations: locations.data ?? {},
    hasLocation,
    coordinates: homeCoordinates,
  };
}

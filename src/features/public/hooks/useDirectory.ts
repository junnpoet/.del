import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { parseGeoPoint } from '../../../services/geo';
import type { Database } from '../../../types/database';

type NearbyService = Database['public']['Functions']['get_nearby_services']['Returns'][number];

export const DIRECTORY_QUERY_KEY = ['nearby-services'] as const;
export const FAVORITES_QUERY_KEY = ['user-favorites'] as const;

export function useDirectory(radiusMeters: number) {
  const { profile, session } = useAuth();
  const queryClient = useQueryClient();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const fallbackLocation = profile?.lat !== null && profile?.lat !== undefined
    && profile?.lng !== null && profile?.lng !== undefined
    ? { latitude: profile.lat, longitude: profile.lng }
    : null;
  const coordinates = currentLocation ?? fallbackLocation;
  const coordinatesReady = Boolean(coordinates);

  useEffect(() => {
    if (!session) {
      setCurrentLocation(null);
      return;
    }

    let active = true;
    let watcher: Location.LocationSubscription | null = null;

    const trackLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) return;

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (active && lastKnown) {
          setCurrentLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (active) {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }

        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 15000,
          },
          (next) => {
            if (active) {
              setCurrentLocation({
                latitude: next.coords.latitude,
                longitude: next.coords.longitude,
              });
            }
          }
        );
      } catch (error) {
        console.warn('No se pudo obtener la ubicación actual; se usará la del perfil.', error);
      }
    };

    trackLocation();
    return () => {
      active = false;
      watcher?.remove();
    };
  }, [session]);

  const coordinateKey = coordinates
    ? `${coordinates.latitude.toFixed(4)}-${coordinates.longitude.toFixed(4)}`
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_favorites', filter: `user_id=eq.${session.user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, session]);

  const services = useQuery<NearbyService[]>({
    queryKey: [...DIRECTORY_QUERY_KEY, session?.user.id, radiusMeters, coordinateKey],
    enabled: Boolean(session && coordinatesReady),
    queryFn: async () => {
      if (!coordinates) return [];
      const { data, error } = await supabase.rpc('get_nearby_services', {
        radius_meters: radiusMeters,
        user_home_lat: coordinates.latitude,
        user_home_lng: coordinates.longitude,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const favorites = useQuery<string[]>({
    queryKey: [...FAVORITES_QUERY_KEY, session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('service_id')
        .eq('user_id', session!.user.id);
      if (error) throw error;
      return (data ?? []).map((item) => item.service_id);
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

  const favoriteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!session) throw new Error('AUTH_REQUIRED');
      const isFavorite = favorites.data?.includes(serviceId) ?? false;
      const result = isFavorite
        ? await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', session.user.id)
            .eq('service_id', serviceId)
        : await supabase.from('user_favorites').insert({
            user_id: session.user.id,
            service_id: serviceId,
          });
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  return {
    services: services.data ?? [],
    isLoading: services.isLoading,
    isError: services.isError,
    error: services.error,
    refetch: services.refetch,
    isRefetching: services.isRefetching,
    favorites: favorites.data ?? [],
    toggleFavorite: favoriteMutation.mutate,
    isTogglingFavorite: favoriteMutation.isPending,
    locations: locations.data ?? {},
    hasLocation: Boolean(coordinatesReady),
    coordinates,
  };
}

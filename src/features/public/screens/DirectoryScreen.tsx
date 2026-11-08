import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { List, Map as MapIcon, MapPin, Search } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Chip } from '../../../components/ui/Chip';
import { useDirectory } from '../hooks/useDirectory';
import { ServiceCard } from '../components/ServiceCard';
import { EmergencyBanner } from '../../emergency/components/EmergencyBanner';

const CATEGORIES = [
  'Todos',
  'Gasfitería',
  'Electricidad',
  'Cerrajería',
  'Carpintería',
  'Paseador de mascotas',
  'Clases',
];
const RADII = [
  { label: '300m', value: 300 },
  { label: '500m', value: 500 },
  { label: '1 km', value: 1000 },
];

function NativeMap({ latitude, longitude, radius, services, locations }: {
  latitude: number;
  longitude: number;
  radius: number;
  services: ReturnType<typeof useDirectory>['services'];
  locations: ReturnType<typeof useDirectory>['locations'];
}) {
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#E8F0EC] px-8">
        <MapIcon size={42} color="#1E5E45" />
        <Text
          className="mt-3 text-center text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
        >
          El mapa interactivo está disponible en Expo Go
        </Text>
        <Text
          className="mt-2 text-center text-neutral-textMuted"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          En web puedes consultar el directorio en modo lista.
        </Text>
      </View>
    );
  }

  const maps = require('react-native-maps') as typeof import('react-native-maps');
  const MapView = maps.default;
  const radiusDelta = radius === 300 ? 0.006 : radius === 500 ? 0.01 : 0.018;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: radiusDelta,
        longitudeDelta: radiusDelta,
      }}
      showsUserLocation
      customMapStyle={require('../../../theme/cleanMapStyle').CLEAN_NEIGHBORHOOD_MAP_STYLE}
    >
      <maps.Marker coordinate={{ latitude, longitude }} title="Tu ubicación actual" pinColor="#1E5E45" />
      <maps.Circle
        center={{ latitude, longitude }}
        radius={radius}
        strokeColor="#1E5E45"
        fillColor="rgba(30, 94, 69, 0.12)"
      />
      {services.map((service) => {
        const coordinate = locations[service.service_id];
        if (!coordinate) return null;
        return (
          <maps.Marker
            key={service.service_id}
            coordinate={coordinate}
            title={service.title}
            description={`${service.provider_name} · ${Math.round(service.distance_meters)} m`}
            pinColor="#D97706"
          />
        );
      })}
    </MapView>
  );
}

export default function DirectoryScreen() {
  const [radius, setRadius] = useState(500);
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const directory = useDirectory(radius);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directory.services.filter((service) => {
      const matchesCategory = category === 'Todos' || service.category === category;
      const matchesQuery = !normalizedQuery
        || service.title.toLowerCase().includes(normalizedQuery)
        || service.category.toLowerCase().includes(normalizedQuery)
        || service.provider_name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, directory.services, query]);

  if (directory.isLoading && !directory.hasLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-background">
        <ActivityIndicator size="large" color="#1E5E45" />
      </View>
    );
  }

  if (!directory.hasLocation) {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header title="Directorio barrial" subtitle="Oficios cerca de tu hogar" />
        <View className="flex-1 items-center justify-center px-8">
          <MapPin size={42} color="#1E5E45" />
          <Text
            className="mt-3 text-center text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
          >
            Necesitamos la ubicación de tu hogar
          </Text>
          <Text
            className="mt-2 text-center text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 21 }}
          >
            Registra o actualiza tu domicilio para ordenar los oficios por distancia caminable.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-background">
      <Header title="Directorio barrial" subtitle="Oficios cerca de tu hogar" />
      <EmergencyBanner />
      <View className="border-b border-neutral-border/60 bg-neutral-surface px-4 pb-2 pt-3">
        <View className="flex-row items-center rounded-2xl bg-neutral-mutedBg px-3 min-h-[44px]">
          <Search size={18} color="#6C727A" />
          <TextInput
            accessibilityLabel="Buscar oficio o vecino"
            className="ml-2 flex-1 py-2 text-neutral-textMain"
            placeholder="Buscar oficio o vecino"
            placeholderTextColor="#9EA3AE"
            value={query}
            onChangeText={setQuery}
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {RADII.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              isActive={radius === item.value}
              onPress={() => setRadius(item.value)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((item) => (
            <Chip
              key={item}
              label={item}
              isActive={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
        <View className="mt-1 flex-row justify-end">
          <View className="flex-row rounded-xl bg-neutral-mutedBg p-1">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Ver lista de tarjetas"
              accessibilityState={{ selected: view === 'list' }}
              onPress={() => setView('list')}
              className={`h-10 w-11 items-center justify-center rounded-lg ${view === 'list' ? 'bg-white' : ''}`}
            >
              <List size={20} color={view === 'list' ? '#1E5E45' : '#6C727A'} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Ver mapa interactivo"
              accessibilityState={{ selected: view === 'map' }}
              onPress={() => setView('map')}
              className={`h-10 w-11 items-center justify-center rounded-lg ${view === 'map' ? 'bg-white' : ''}`}
            >
              <MapIcon size={20} color={view === 'map' ? '#1E5E45' : '#6C727A'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {view === 'map' ? (
        <NativeMap
          latitude={directory.coordinates!.latitude}
          longitude={directory.coordinates!.longitude}
          radius={radius}
          services={filteredServices}
          locations={directory.locations}
        />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.service_id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              isFavorite={directory.favorites.includes(item.service_id)}
              onToggleFavorite={() => directory.toggleFavorite(item.service_id)}
              onConsult={() => Alert.alert('Consultar', `Puedes consultar a ${item.provider_name}.`)}
              isTogglingFavorite={directory.isTogglingFavorite}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={directory.isRefetching}
              onRefresh={async () => {
                await directory.refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <MapPin size={38} color="#9EA3AE" />
              <Text
                className="mt-3 text-center text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15 }}
              >
                {directory.isError
                  ? 'No pudimos cargar los oficios. Desliza para reintentar.'
                  : 'No encontramos oficios con estos filtros.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

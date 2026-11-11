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
import { useRouter } from 'expo-router';
import { Home, List, Map as MapIcon, MapPin, Search } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Chip } from '../../../components/ui/Chip';
import { useDirectory } from '../hooks/useDirectory';
import { ServiceCard } from '../components/ServiceCard';
import { useI18n } from '../../../i18n';
import { useAuth } from '../../../services/auth';
import { supabase } from '../../../services/supabase';
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

function NativeMap({
  latitude,
  longitude,
  radius,
  services,
  locations,
  onSelectService,
}: {
  latitude: number;
  longitude: number;
  radius: number;
  services: ReturnType<typeof useDirectory>['services'];
  locations: ReturnType<typeof useDirectory>['locations'];
  onSelectService: (service: ReturnType<typeof useDirectory>['services'][number]) => void;
}) {
  const { t } = useI18n();
  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#E8F0EC] px-8">
        <MapIcon size={42} color="#1E5E45" />
        <Text
          className="mt-3 text-center text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
        >
          {t('directory.mapWebTitle')}
        </Text>
        <Text
          className="mt-2 text-center text-neutral-textMuted"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          {t('directory.mapWebBody')}
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
      showsUserLocation={false}
      customMapStyle={require('../../../theme/cleanMapStyle').CLEAN_NEIGHBORHOOD_MAP_STYLE}
    >
      {/* Home Pin (Primary Green) */}
      <maps.Marker
        coordinate={{ latitude, longitude }}
        title={t('directory.yourLocation')}
        description="Centro de cálculo del radio caminable"
        pinColor="#1E5E45"
      />
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
            onCalloutPress={() => onSelectService(service)}
          />
        );
      })}
    </MapView>
  );
}

export default function DirectoryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [radius, setRadius] = useState(500);
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);

  const directory = useDirectory(radius);
  const { t, tCategory } = useI18n();

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directory.services.filter((service) => {
      const matchesCategory = category === 'Todos' || service.category === category;
      const matchesQuery =
        !normalizedQuery ||
        service.title.toLowerCase().includes(normalizedQuery) ||
        service.category.toLowerCase().includes(normalizedQuery) ||
        service.provider_name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, directory.services, query]);

  const handleConsult = async (
    service: ReturnType<typeof useDirectory>['services'][number]
  ) => {
    if (!session?.user?.id) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para consultar y chatear con un prestador.',
        [
          { text: 'Ir a Login', onPress: () => router.push('/(auth)/login') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    if (session.user.id === service.provider_id) {
      Alert.alert('Tu propio oficio', 'Este es tu propio anuncio de servicio.');
      return;
    }

    try {
      setOpeningChatId(service.service_id);

      // Check if conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('service_id', service.service_id)
        .eq('client_id', session.user.id)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existing) {
        router.push(`/chat/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: created, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          service_id: service.service_id,
          provider_id: service.provider_id,
          client_id: session.user.id,
        })
        .select('id')
        .single();

      if (createError) throw createError;

      router.push(`/chat/${created.id}`);
    } catch (err: any) {
      Alert.alert(
        'Error al iniciar chat',
        err?.message ?? 'No se pudo abrir la conversación.'
      );
    } finally {
      setOpeningChatId(null);
    }
  };

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
        <Header title={t('directory.title')} subtitle={t('directory.subtitle')} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
            <Home size={32} color="#1E5E45" />
          </View>
          <Text
            className="mt-4 text-center text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
          >
            {t('directory.needLocation')}
          </Text>
          <Text
            className="mt-2 text-center text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 21 }}
          >
            {t('directory.needLocationBody')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-background">
      <Header title={t('directory.title')} subtitle={t('directory.subtitle')} />
      <EmergencyBanner />
      <View className="border-b border-neutral-border/60 bg-neutral-surface px-4 pb-2 pt-3">
        <View className="flex-row items-center rounded-2xl bg-neutral-mutedBg px-3 min-h-[44px]">
          <Search size={18} color="#6C727A" />
          <TextInput
            accessibilityLabel={t('directory.search')}
            className="ml-2 flex-1 py-2 text-neutral-textMain"
            placeholder={t('directory.search')}
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
              label={tCategory(item)}
              isActive={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
        <View className="mt-1 flex-row justify-end">
          <View className="flex-row rounded-xl bg-neutral-mutedBg p-1">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('directory.viewList')}
              accessibilityState={{ selected: view === 'list' }}
              onPress={() => setView('list')}
              className={`h-10 w-11 items-center justify-center rounded-lg ${
                view === 'list' ? 'bg-white' : ''
              }`}
            >
              <List size={20} color={view === 'list' ? '#1E5E45' : '#6C727A'} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('directory.viewMap')}
              accessibilityState={{ selected: view === 'map' }}
              onPress={() => setView('map')}
              className={`h-10 w-11 items-center justify-center rounded-lg ${
                view === 'map' ? 'bg-white' : ''
              }`}
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
          onSelectService={handleConsult}
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
              onConsult={() => handleConsult(item)}
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
                {directory.isError ? t('directory.loadError') : t('directory.empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

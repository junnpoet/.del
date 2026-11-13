import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Flag,
  Heart,
  Home,
  List,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Chip } from '../../../components/ui/Chip';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { LeafletMap, type LeafletMarkerItem } from '../../../components/ui/LeafletMap';
import {
  normalizeListingType,
  useDirectory,
  type NearbyService,
} from '../hooks/useDirectory';
import { LISTING_TYPE_META, ServiceCard } from '../components/ServiceCard';
import { ReportModal } from '../components/ReportModal';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { MapPointBottomSheet } from '../components/MapPointBottomSheet';
import { useI18n } from '../../../i18n';
import { usePublicI18n } from '../i18n';
import { useAuth } from '../../../services/auth';
import { supabase } from '../../../services/supabase';
import { EmergencyBanner } from '../../emergency/components/EmergencyBanner';
import { LISTING_TYPES, SERVICE_CATEGORIES } from '../../../constants/categories';
import type { ListingType } from '../../../types';

const CATEGORIES = ['Todos', ...SERVICE_CATEGORIES] as const;

const RADII = [
  { label: '300m', value: 300 },
  { label: '500m', value: 500 },
  { label: '1 km', value: 1000 },
];

type TypeFilter = 'ALL' | ListingType;

function NativeMap({
  latitude,
  longitude,
  radius,
  services,
  locations,
  currentUserId,
  selectedService,
  onSelectMarker,
}: {
  latitude: number;
  longitude: number;
  radius: number;
  services: NearbyService[];
  locations: Record<string, { latitude: number; longitude: number }>;
  currentUserId?: string;
  selectedService: NearbyService | null;
  onSelectMarker: (service: NearbyService, pointItems: NearbyService[]) => void;
}) {
  const { t } = useI18n();
  const { tp } = usePublicI18n();

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

  const groupedByHome = new Map<string, { coord: { latitude: number; longitude: number }; items: NearbyService[] }>();
  for (const service of services) {
    const coordinate = locations[service.service_id];
    if (!coordinate) continue;
    const key = `${coordinate.latitude.toFixed(5)},${coordinate.longitude.toFixed(5)}`;
    const existing = groupedByHome.get(key);
    if (existing) {
      existing.items.push(service);
    } else {
      groupedByHome.set(key, { coord: coordinate, items: [service] });
    }
  }

  const selectedCoord = selectedService ? locations[selectedService.service_id] : undefined;
  const selectedHomeKey = selectedCoord
    ? `${selectedCoord.latitude.toFixed(5)},${selectedCoord.longitude.toFixed(5)}`
    : null;

  const mapMarkers: LeafletMarkerItem[] = Array.from(groupedByHome.entries()).map(([key, { coord, items }]) => {
    const primary = items[0];
    const uniqueTypes = Array.from(new Set(items.map((item) => normalizeListingType(item.listing_type))));
    const colors = uniqueTypes.map((typeKey) => LISTING_TYPE_META[typeKey].color);
    const primaryType = uniqueTypes[0];
    const iconType =
      uniqueTypes.length > 1
        ? 'multi'
        : primaryType === 'PRODUCTO'
        ? 'producto'
        : primaryType === 'AUXILIO'
        ? 'auxilio'
        : 'servicio';

    const isOwnHome = Boolean(
      currentUserId && items.some((item) => item.provider_id === currentUserId)
    );

    return {
      id: primary.service_id,
      latitude: coord.latitude,
      longitude: coord.longitude,
      color: colors[0],
      colors,
      iconType,
      count: items.length,
      isHome: isOwnHome,
      selected: selectedHomeKey === key,
      title: items.length > 1 ? `${primary.provider_name} (${items.length} ofertas)` : primary.title,
      subtitle: `${primary.provider_name} · ${Math.round(primary.distance_meters)} m`,
    };
  });

  return (
    <View className="flex-1 relative">
      <LeafletMap
        center={{ latitude, longitude }}
        focus={selectedCoord ?? null}
        radiusMeters={radius}
        showHomePin
        homeTitle={tp('public.homePinTitle')}
        homeSubtitle={tp('public.homePinDesc')}
        markers={mapMarkers}
        onMarkerPress={(id) => {
          const found = services.find((service) => service.service_id === id);
          if (!found) return;
          const coord = locations[found.service_id];
          const key = coord ? `${coord.latitude.toFixed(5)},${coord.longitude.toFixed(5)}` : null;
          const group = (key ? groupedByHome.get(key)?.items : null) ?? [found];
          onSelectMarker(found, group);
        }}
      />
    </View>
  );
}

export default function DirectoryScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { session } = useAuth();
  const [radius, setRadius] = useState(500);
  const [listingTypeFilter, setListingTypeFilter] = useState<TypeFilter>('ALL');
  const [category, setCategory] = useState('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState(filter === 'favorites');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);
  const [selectedMapService, setSelectedMapService] = useState<NearbyService | null>(null);
  const [detailService, setDetailService] = useState<NearbyService | null>(null);
  const [detailPointServices, setDetailPointServices] = useState<NearbyService[]>([]);
  const [reportingService, setReportingService] = useState<NearbyService | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (listingTypeFilter !== 'ALL' ? 1 : 0) +
    (category !== 'Todos' ? 1 : 0) +
    (radius !== 500 ? 1 : 0) +
    (onlyFavorites ? 1 : 0);

  const cycleRadius = () => {
    const idx = RADII.findIndex((r) => r.value === radius);
    const next = RADII[(idx + 1) % RADII.length];
    setRadius(next.value);
  };

  const currentRadiusLabel =
    RADII.find((r) => r.value === radius)?.label ?? `${radius}m`;

  useEffect(() => {
    if (filter === 'favorites') {
      setOnlyFavorites(true);
    }
  }, [filter]);

  const directory = useDirectory(radius);
  const { t } = useI18n();
  const { tp, tpCategory } = usePublicI18n();

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return directory.services.filter((service) => {
      const normalizedType = normalizeListingType(service.listing_type);
      const matchesType =
        listingTypeFilter === 'ALL' || normalizedType === listingTypeFilter;
      const matchesCategory = category === 'Todos' || service.category === category;
      const matchesFavorite =
        !onlyFavorites || directory.favorites.includes(service.service_id);
      const matchesQuery =
        !normalizedQuery ||
        service.title.toLowerCase().includes(normalizedQuery) ||
        service.category.toLowerCase().includes(normalizedQuery) ||
        (service.description ?? '').toLowerCase().includes(normalizedQuery) ||
        service.provider_name.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesCategory && matchesFavorite && matchesQuery;
    });
  }, [
    category,
    directory.favorites,
    directory.services,
    listingTypeFilter,
    onlyFavorites,
    query,
  ]);

  const handleConsult = async (service: NearbyService) => {
    if (openingChatId) return;

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
      Alert.alert(
        'Tu propia publicación',
        'Puedes responder a tus vecinos desde la bandeja de Mensajes.',
        [
          { text: tp('public.inboxButton'), onPress: () => router.push('/chat') },
          { text: 'Cerrar', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      setOpeningChatId(service.service_id);

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

  const inboxAction = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={tp('public.inboxA11y')}
      onPress={() => router.push('/chat')}
      className="min-h-[44px] flex-row items-center rounded-2xl border border-primary/25 bg-[#EDF5F1] px-3"
    >
      <MessageSquare size={17} color="#1E5E45" />
      <Text
        className="ml-1.5 text-primary"
        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
      >
        {tp('public.inboxButton')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title={t('directory.title')}
        subtitle={t('directory.subtitle')}
        rightAction={inboxAction}
      />
      <EmergencyBanner />
      <View className="relative flex-1">
        <View
          pointerEvents="box-none"
          className={`px-4 pb-2.5 pt-2.5 ${
            view === 'list' ? 'border-b border-neutral-border/60 bg-neutral-surface' : ''
          }`}
          style={
            view === 'map'
              ? { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10 }
              : undefined
          }
        >
          {/* Row 1: Search bar + List/Map toggle */}
          <View pointerEvents="box-none" className="flex-row items-center gap-2">
            <View
              className={`h-12 flex-1 flex-row items-center rounded-2xl px-3 ${
                view === 'map' ? 'border border-neutral-border/70' : 'bg-neutral-mutedBg'
              }`}
              style={
                view === 'map'
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.96)', elevation: 3 }
                  : undefined
              }
            >
            <Search size={18} color="#6C727A" />
            <TextInput
              accessibilityLabel={t('directory.search')}
              className="ml-2 flex-1 py-0 text-neutral-textMain"
              placeholder={t('directory.search')}
              placeholderTextColor="#9EA3AE"
              value={query}
              onChangeText={setQuery}
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setQuery('')}
                className="p-1.5"
              >
                <X size={16} color="#6C727A" />
              </TouchableOpacity>
            )}
            <View className="mx-1 h-5 w-[1px] bg-neutral-border/70" />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Filtros"
              onPress={() => setFiltersOpen(true)}
              className={`h-9 flex-row items-center justify-center rounded-xl px-2.5 ${
                activeFilterCount > 0 ? 'bg-[#EDF5F1]' : ''
              }`}
            >
              <SlidersHorizontal
                size={16}
                color={activeFilterCount > 0 ? '#1E5E45' : '#6C727A'}
              />
              {activeFilterCount > 0 && (
                <Text
                  className="ml-1 text-primary"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                >
                  {activeFilterCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>

            <View
              className={`h-12 flex-row items-center rounded-2xl p-1 ${
                view === 'map' ? 'border border-neutral-border/70' : 'bg-neutral-mutedBg'
              }`}
              style={
                view === 'map'
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.96)', elevation: 3 }
                  : undefined
              }
            >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('directory.viewList')}
              accessibilityState={{ selected: view === 'list' }}
              onPress={() => {
                setView('list');
                setSelectedMapService(null);
                setDetailPointServices([]);
              }}
              className={`h-10 w-10 items-center justify-center rounded-xl ${
                view === 'list' ? 'bg-white' : ''
              }`}
            >
              <List size={19} color={view === 'list' ? '#1E5E45' : '#6C727A'} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('directory.viewMap')}
              accessibilityState={{ selected: view === 'map' }}
              onPress={() => setView('map')}
              className={`h-10 w-10 items-center justify-center rounded-xl ${
                view === 'map' ? 'bg-white' : ''
              }`}
            >
              <MapIcon size={19} color={view === 'map' ? '#1E5E45' : '#6C727A'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Single row with Servicios / Productos / Auxilio + compact Favorites */}
        <View pointerEvents="box-none" className="mt-2.5 flex-row items-center gap-1.5">
          {LISTING_TYPES.map((typeKey) => {
            const active = listingTypeFilter === typeKey;
            const meta = LISTING_TYPE_META[typeKey];
            const Icon = meta.Icon;
            return (
              <View
                key={typeKey}
                className="flex-1 overflow-hidden rounded-full border"
                style={{
                  borderColor: active ? meta.color : '#E5E7EB',
                  backgroundColor: active ? meta.color : meta.bg,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() =>
                    setListingTypeFilter((prev) => (prev === typeKey ? 'ALL' : typeKey))
                  }
                  android_ripple={{
                    color: active ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.08)',
                    borderless: false,
                  }}
                  className="min-h-[38px] flex-row items-center justify-center px-2"
                >
                  <Icon size={14} color={active ? '#FFFFFF' : meta.color} />
                  <Text
                    numberOfLines={1}
                    className="ml-1"
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 12,
                      color: active ? '#FFFFFF' : meta.color,
                    }}
                  >
                    {tp(`public.type.${typeKey}`)}
                  </Text>
                </Pressable>
              </View>
            );
          })}

          <View
            className={`overflow-hidden rounded-full border ${
              onlyFavorites
                ? 'border-emergency-alert bg-[#FEE2E2]'
                : 'border-neutral-border bg-neutral-surface'
            }`}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tp('public.favoritesChip')}
              accessibilityState={{ selected: onlyFavorites }}
              onPress={() => setOnlyFavorites((prev) => !prev)}
              android_ripple={{
                color: onlyFavorites ? 'rgba(217,4,41,0.16)' : 'rgba(0,0,0,0.08)',
                borderless: false,
              }}
              className="min-h-[38px] flex-row items-center justify-center px-2.5"
            >
              <Heart
                size={14}
                color={onlyFavorites ? '#D90429' : '#6C727A'}
                fill={onlyFavorites ? '#D90429' : 'none'}
              />
              <Text
                className={`ml-1 ${
                  onlyFavorites ? 'text-emergency-alert' : 'text-neutral-textMain'
                }`}
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
              >
                ({directory.favorites.length})
              </Text>
            </Pressable>
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
          currentUserId={session?.user.id}
          selectedService={selectedMapService}
          onSelectMarker={(svc, pointItems) => {
            setSelectedMapService(svc);
            setDetailPointServices(pointItems);
          }}
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
              onViewMore={() => {
                setDetailPointServices([]);
                setDetailService(item);
              }}
              onReport={() => setReportingService(item)}
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

      {view === 'map' && (
        <MapPointBottomSheet
          visible={Boolean(selectedMapService)}
          service={selectedMapService}
          pointServices={detailPointServices}
          onSelectService={(svc) => setSelectedMapService(svc)}
          onClose={() => {
            setSelectedMapService(null);
            setDetailPointServices([]);
          }}
          onConsult={handleConsult}
          isFavorite={directory.isFavorite}
          onToggleFavorite={directory.toggleFavorite}
          onReport={(svc) => setReportingService(svc)}
        />
      )}
      </View>

      {reportingService && (
        <ReportModal
          visible={Boolean(reportingService)}
          onClose={() => setReportingService(null)}
          serviceId={reportingService.service_id}
          providerName={reportingService.provider_name}
          serviceTitle={reportingService.title}
        />
      )}

      <ServiceDetailModal
        visible={Boolean(detailService)}
        service={detailService}
        pointServices={detailPointServices}
        onSelectService={(svc) => {
          setDetailService(svc);
          if (view === 'map') {
            setSelectedMapService(svc);
          }
        }}
        onClose={() => {
          setDetailService(null);
          setDetailPointServices([]);
          setSelectedMapService(null);
        }}
        onConsult={handleConsult}
        isFavorite={directory.isFavorite}
        onToggleFavorite={directory.toggleFavorite}
        onReport={(svc) => setReportingService(svc)}
      />

      {/* Filters Bottom Sheet Modal */}
      <BottomSheetModal visible={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
          >
            Filtros del directorio
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setFiltersOpen(false)}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
          >
            <X size={18} color="#6C727A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Text
            className="mb-2 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
          >
            RADIO CAMINABLE
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {RADII.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                isActive={radius === item.value}
                onPress={() => setRadius(item.value)}
              />
            ))}
          </View>

          <Text
            className="mb-2 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
          >
            CATEGORÍA
          </Text>
          <View className="mb-5 flex-row flex-wrap gap-1.5">
            {CATEGORIES.map((item) => (
              <Chip
                key={item}
                label={item === 'Todos' ? tp('public.type.ALL') : tpCategory(item)}
                isActive={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </View>
        </ScrollView>

        <View className="flex-row gap-3 pt-2">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              setListingTypeFilter('ALL');
              setCategory('Todos');
              setRadius(500);
              setOnlyFavorites(false);
            }}
            className="min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-neutral-border"
          >
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
            >
              Limpiar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setFiltersOpen(false)}
            className="min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-primary"
          >
            <Text
              className="text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              Ver resultados ({filteredServices.length})
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </View>
  );
}

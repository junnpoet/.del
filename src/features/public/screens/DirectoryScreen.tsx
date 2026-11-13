import React, { useEffect, useMemo, useState } from 'react';
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
  selectedService,
  onSelectMarker,
  onClosePreview,
  onConsult,
  onReport,
  isFavorite,
  onToggleFavorite,
}: {
  latitude: number;
  longitude: number;
  radius: number;
  services: NearbyService[];
  locations: Record<string, { latitude: number; longitude: number }>;
  selectedService: NearbyService | null;
  onSelectMarker: (service: NearbyService) => void;
  onClosePreview: () => void;
  onConsult: (service: NearbyService) => void;
  onReport: (service: NearbyService) => void;
  isFavorite: (serviceId: string) => boolean;
  onToggleFavorite: (serviceId: string) => void;
}) {
  const { t } = useI18n();
  const { tp, tpCategory } = usePublicI18n();

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

  const mapMarkers: LeafletMarkerItem[] = services
    .map((service): LeafletMarkerItem | null => {
      const coordinate = locations[service.service_id];
      if (!coordinate) return null;
      const listingType = normalizeListingType(service.listing_type);
      return {
        id: service.service_id,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        color: LISTING_TYPE_META[listingType].color,
        title: service.title,
        subtitle: `${service.provider_name} · ${Math.round(service.distance_meters)} m`,
      };
    })
    .filter((item): item is LeafletMarkerItem => item !== null);

  const selectedType = selectedService
    ? normalizeListingType(selectedService.listing_type)
    : null;
  const selectedMeta = selectedType ? LISTING_TYPE_META[selectedType] : null;
  const SelectedIcon = selectedMeta?.Icon;

  return (
    <View className="flex-1 relative">
      <LeafletMap
        center={{ latitude, longitude }}
        radiusMeters={radius}
        showHomePin
        homeTitle={tp('public.homePinTitle')}
        homeSubtitle={tp('public.homePinDesc')}
        markers={mapMarkers}
        onMarkerPress={(id) => {
          const found = services.find((service) => service.service_id === id);
          if (found) onSelectMarker(found);
        }}
      />

      {/* Map Floating Preview Card */}
      {selectedService && selectedMeta && selectedType && SelectedIcon && (
        <View className="absolute bottom-24 left-4 right-4 rounded-3xl border border-neutral-border bg-neutral-surface p-4 shadow-xl">
          <View className="flex-row items-center justify-between">
            <View
              className="flex-row items-center rounded-full px-3 py-1"
              style={{ backgroundColor: selectedMeta.bg }}
            >
              <SelectedIcon size={14} color={selectedMeta.color} />
              <Text
                className="ml-1.5"
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 12,
                  color: selectedMeta.color,
                }}
              >
                {tp(`public.type.${selectedType}`)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={tp('public.reportA11y', {
                  name: selectedService.provider_name,
                })}
                onPress={() => onReport(selectedService)}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <Flag size={18} color="#6C727A" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorite(selectedService.service_id)
                    ? t('service.favRemove')
                    : t('service.favAdd')
                }
                onPress={() => onToggleFavorite(selectedService.service_id)}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <Heart
                  size={18}
                  color={isFavorite(selectedService.service_id) ? '#D90429' : '#6C727A'}
                  fill={isFavorite(selectedService.service_id) ? '#D90429' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={tp('public.mapClosePreview')}
                onPress={onClosePreview}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <X size={18} color="#6C727A" />
              </TouchableOpacity>
            </View>
          </View>

          <Text
            numberOfLines={1}
            className="mt-2 text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            {selectedService.title}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {selectedService.provider_name} · {tpCategory(selectedService.category)}
          </Text>

          <View className="mt-2.5 flex-row flex-wrap items-center">
            <View className="mr-3 flex-row items-center">
              <ShieldCheck size={15} color="#1E5E45" />
              <Text
                className="ml-1 text-primary"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
              >
                {t('service.seal')}
              </Text>
            </View>
            <View className="mr-3 flex-row items-center">
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text
                className="ml-1 text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
              >
                {selectedService.rating_avg?.toFixed(1) ?? '0.0'} ({selectedService.reviews_total ?? 0})
              </Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={14} color="#6C727A" />
              <Text
                className="ml-1 text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
              >
                {t('service.distance', { n: Math.round(selectedService.distance_meters) })}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('service.consultA11y', {
              name: selectedService.provider_name,
            })}
            onPress={() => onConsult(selectedService)}
            className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-primary px-4"
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {t('service.consult')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
          className={
            view === 'map'
              ? 'absolute left-0 right-0 top-0 z-10 px-4 pb-2.5 pt-2.5'
              : 'border-b border-neutral-border/60 bg-neutral-surface px-4 pb-2.5 pt-2.5'
          }
        >
          {/* Row 1: Search bar + List/Map toggle */}
          <View pointerEvents="box-none" className="flex-row items-center gap-2">
            <View
              className={`min-h-[48px] flex-1 flex-row items-center rounded-2xl px-3 ${
                view === 'map'
                  ? 'border border-neutral-border/70 bg-white/95 shadow-sm'
                  : 'bg-neutral-mutedBg'
              }`}
            >
            <Search size={18} color="#6C727A" />
            <TextInput
              accessibilityLabel={t('directory.search')}
              className="ml-2 flex-1 py-2 text-neutral-textMain"
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
          </View>

            <View
              className={`flex-row rounded-2xl p-1 ${
                view === 'map'
                  ? 'border border-neutral-border/70 bg-white/95 shadow-sm'
                  : 'bg-neutral-mutedBg'
              }`}
            >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('directory.viewList')}
              accessibilityState={{ selected: view === 'list' }}
              onPress={() => setView('list')}
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

        {/* Row 2: Filter strip filling full width and wrapping if expanded */}
        <View pointerEvents="box-none" className="mt-2.5 flex-row flex-wrap items-center gap-2">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setFiltersOpen(true)}
            className={`min-h-[40px] flex-grow flex-row items-center justify-center rounded-full border px-3.5 ${
              activeFilterCount > 0
                ? 'border-primary bg-[#EDF5F1]'
                : 'border-neutral-border bg-neutral-surface'
            }`}
          >
            <SlidersHorizontal
              size={15}
              color={activeFilterCount > 0 ? '#1E5E45' : '#6C727A'}
            />
            <Text
              className={`ml-1.5 ${
                activeFilterCount > 0 ? 'text-primary' : 'text-neutral-textMain'
              }`}
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              {category !== 'Todos' ? tpCategory(category) : 'Filtros'}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={cycleRadius}
            className="min-h-[40px] flex-grow flex-row items-center justify-center rounded-full border border-neutral-border bg-neutral-mutedBg px-3.5"
          >
            <MapPin size={14} color="#1E5E45" />
            <Text
              className="ml-1 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              {currentRadiusLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: onlyFavorites }}
            onPress={() => setOnlyFavorites((prev) => !prev)}
            className={`min-h-[40px] flex-grow flex-row items-center justify-center rounded-full border px-3.5 ${
              onlyFavorites
                ? 'border-emergency-alert bg-[#FEE2E2]'
                : 'border-neutral-border bg-neutral-surface'
            }`}
          >
            <Heart
              size={14}
              color={onlyFavorites ? '#D90429' : '#6C727A'}
              fill={onlyFavorites ? '#D90429' : 'none'}
            />
            <Text
              className={`ml-1.5 ${
                onlyFavorites ? 'text-emergency-alert' : 'text-neutral-textMain'
              }`}
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {tp('public.favoritesChip')} ({directory.favorites.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 3: Quick type selectors (Servicios / Productos / Auxilio) */}
        <View pointerEvents="box-none" className="mt-2 flex-row items-center gap-2">
          {LISTING_TYPES.map((typeKey) => {
            const active = listingTypeFilter === typeKey;
            const meta = LISTING_TYPE_META[typeKey];
            const Icon = meta.Icon;
            return (
              <TouchableOpacity
                key={typeKey}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() =>
                  setListingTypeFilter((prev) => (prev === typeKey ? 'ALL' : typeKey))
                }
                className="min-h-[38px] flex-1 flex-row items-center justify-center rounded-full border px-2"
                style={{
                  borderColor: active ? meta.color : '#E5E7EB',
                  backgroundColor: active ? meta.color : meta.bg,
                }}
              >
                <Icon size={14} color={active ? '#FFFFFF' : meta.color} />
                <Text
                  numberOfLines={1}
                  className="ml-1.5"
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 12.5,
                    color: active ? '#FFFFFF' : meta.color,
                  }}
                >
                  {tp(`public.type.${typeKey}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {view === 'map' ? (
        <NativeMap
          latitude={directory.coordinates!.latitude}
          longitude={directory.coordinates!.longitude}
          radius={radius}
          services={filteredServices}
          locations={directory.locations}
          selectedService={selectedMapService}
          onSelectMarker={(svc) => setSelectedMapService(svc)}
          onClosePreview={() => setSelectedMapService(null)}
          onConsult={handleConsult}
          onReport={(svc) => setReportingService(svc)}
          isFavorite={directory.isFavorite}
          onToggleFavorite={directory.toggleFavorite}
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

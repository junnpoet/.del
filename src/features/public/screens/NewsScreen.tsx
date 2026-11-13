import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AlertTriangle, Droplets, Hammer, Megaphone, Newspaper } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { useNews, NeighborhoodNews } from '../hooks/useNews';
import { useZoneEmergency } from '../../emergency/hooks/useEmergencyRealtime';
import { useI18n, type TranslationKey } from '../../../i18n';

const SOURCE_META: Record<
  string,
  { label?: TranslationKey; customLabel?: string; color: string; bg: string; Icon: typeof Megaphone }
> = {
  MUNICIPAL: { label: 'news.source.MUNICIPAL', color: '#1E5E45', bg: '#EDF5F1', Icon: Megaphone },
  SERVICIOS_PUBLICOS: { label: 'news.source.SERVICIOS_PUBLICOS', color: '#92400E', bg: '#FEF3C7', Icon: Droplets },
  DIRIGENCIA: { label: 'news.source.DIRIGENCIA', color: '#583018', bg: '#FBF3EE', Icon: Hammer },
  EMERGENCIA: { customLabel: 'Emergencia', color: '#DC2626', bg: '#FEE2E2', Icon: AlertTriangle },
};
const FALLBACK_META = SOURCE_META.MUNICIPAL;
const ALL_SECTORS = '__ALL__';
const EMERGENCY_FILTER = '__EMERGENCY__';
const EMERGENCY_KEYWORDS = /(emergencia|contingencia|sismo|terremoto|huaico|incendio|evacuaci[oó]n|alerta|auxilio)/i;

function isEmergencyNews(item: NeighborhoodNews): boolean {
  return (
    item.source === 'EMERGENCIA' ||
    EMERGENCY_KEYWORDS.test(item.title) ||
    EMERGENCY_KEYWORDS.test(item.content)
  );
}

function formatDate(iso: string | null, numeric: boolean): string {
  if (!iso) return '';
  // Los navegadores no traen nombres de meses en quechua: en ese idioma se usa la fecha numérica.
  return new Date(iso).toLocaleDateString('es-PE', {
    day: numeric ? '2-digit' : 'numeric',
    month: numeric ? '2-digit' : 'short',
    year: 'numeric',
  });
}

function NewsCard({ item }: { item: NeighborhoodNews }) {
  const { t, language } = useI18n();
  const meta = (item.source && SOURCE_META[item.source]) || FALLBACK_META;
  const { Icon } = meta;
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={14} color={meta.color} />
          <Text
            className="ml-1.5"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: meta.color }}
          >
            {meta.label ? t(meta.label) : meta.customLabel}
          </Text>
        </View>
        <Text
          className="text-neutral-textLight"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
        >
          {formatDate(item.created_at, language === 'qu')}
        </Text>
      </View>
      <Text
        className="text-neutral-textMain"
        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
      >
        {item.title}
      </Text>
      <Text
        className="text-neutral-textMuted mt-1"
        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 20 }}
      >
        {item.content}
      </Text>
      <Text
        className="text-neutral-textLight mt-2"
        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
      >
        {item.sector_name}
      </Text>
    </Card>
  );
}

export default function NewsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useNews();
  const { zoneEmergency } = useZoneEmergency();
  const { t } = useI18n();
  const [sector, setSector] = useState<string>(ALL_SECTORS);
  const [onlyEmergency, setOnlyEmergency] = useState(false);

  const sectors = useMemo(
    () => [ALL_SECTORS, ...Array.from(new Set((data ?? []).map((n) => n.sector_name)))],
    [data]
  );

  const emergencySyntheticNews = useMemo<NeighborhoodNews[]>(() => {
    if (!zoneEmergency) return [];
    return [
      {
        id: `active-emergency-${zoneEmergency.id}`,
        title: `Contingencia activa: ${zoneEmergency.event_type}`,
        content:
          zoneEmergency.description ||
          `${zoneEmergency.group_name} activó el protocolo de emergencia en tu zona de influencia. Revisa puntos seguros y avisos oficiales.`,
        sector_name: zoneEmergency.group_name,
        source: 'EMERGENCIA',
        created_at: zoneEmergency.activated_at,
      },
    ];
  }, [zoneEmergency]);

  const combinedData = useMemo(
    () => [...emergencySyntheticNews, ...(data ?? [])],
    [emergencySyntheticNews, data]
  );

  const filtered = useMemo(() => {
    return combinedData.filter((n) => {
      if (onlyEmergency && !isEmergencyNews(n)) return false;
      if (sector !== ALL_SECTORS && n.sector_name !== sector) return false;
      return true;
    });
  }, [combinedData, onlyEmergency, sector]);

  return (
    <View className="flex-1 bg-neutral-background">
      <Header title={t('news.title')} subtitle={t('news.subtitle')} />

      {zoneEmergency && !onlyEmergency && (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.88}
          onPress={() => {
            setSector(ALL_SECTORS);
            setOnlyEmergency(true);
          }}
          className="mx-5 mt-3 flex-row items-center justify-between rounded-2xl border border-red-200 bg-[#FEE2E2] px-3.5 py-2.5"
        >
          <View className="flex-1 flex-row items-center pr-2">
            <AlertTriangle size={16} color="#DC2626" />
            <Text
              numberOfLines={1}
              className="ml-2 text-[#991B1B]"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
            >
              Emergencia activa ({zoneEmergency.event_type}) en tu zona
            </Text>
          </View>
          <Text
            className="text-[#DC2626]"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12 }}
          >
            Filtrar
          </Text>
        </TouchableOpacity>
      )}

      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          <Chip
            key={EMERGENCY_FILTER}
            label="Emergencia"
            isActive={onlyEmergency}
            onPress={() => setOnlyEmergency((prev) => !prev)}
          />
          {sectors.length > 2 &&
            sectors.map((s) => (
              <Chip
                key={s}
                label={s === ALL_SECTORS ? t('common.all') : s}
                isActive={!onlyEmergency && s === sector}
                onPress={() => {
                  setOnlyEmergency(false);
                  setSector(s);
                }}
              />
            ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E5E45" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={async () => {
                await refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Newspaper size={40} color="#9EA3AE" />
              <Text
                className="text-neutral-textMuted mt-3 text-center"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15 }}
              >
                {isError ? t('news.loadError') : t('news.empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

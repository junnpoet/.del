import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Droplets, Hammer, Megaphone, Newspaper } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { useNews, NeighborhoodNews } from '../hooks/useNews';

const SOURCE_META: Record<
  string,
  { label: string; color: string; bg: string; Icon: typeof Megaphone }
> = {
  MUNICIPAL: { label: 'Municipalidad', color: '#1E5E45', bg: '#EDF5F1', Icon: Megaphone },
  SERVICIOS_PUBLICOS: { label: 'Servicios públicos', color: '#92400E', bg: '#FEF3C7', Icon: Droplets },
  DIRIGENCIA: { label: 'Dirigencia', color: '#583018', bg: '#FBF3EE', Icon: Hammer },
};
const FALLBACK_META = SOURCE_META.MUNICIPAL;

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function NewsCard({ item }: { item: NeighborhoodNews }) {
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
            {meta.label}
          </Text>
        </View>
        <Text
          className="text-neutral-textLight"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
        >
          {formatDate(item.created_at)}
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
  const [sector, setSector] = useState<string>('Todos');

  const sectors = useMemo(
    () => ['Todos', ...Array.from(new Set((data ?? []).map((n) => n.sector_name)))],
    [data]
  );

  const filtered = useMemo(
    () => (sector === 'Todos' ? data ?? [] : (data ?? []).filter((n) => n.sector_name === sector)),
    [data, sector]
  );

  return (
    <View className="flex-1 bg-neutral-background">
      <Header title="Noticias de la zona" subtitle="Avisos de tu barrio" />

      {sectors.length > 2 && (
        <View className="py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {sectors.map((s) => (
              <Chip key={s} label={s} isActive={s === sector} onPress={() => setSector(s)} />
            ))}
          </ScrollView>
        </View>
      )}

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
                {isError
                  ? 'No pudimos cargar las noticias. Desliza para reintentar.'
                  : 'Aún no hay noticias en tu zona.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

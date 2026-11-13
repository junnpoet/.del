import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Map as MapIcon } from 'lucide-react-native';
import { useI18n } from '../../../i18n';
import { LeafletMap, type LeafletMarkerItem } from '../../../components/ui/LeafletMap';
import {
  CARE_STATUS_META,
  careStatusKey,
  DEFAULT_REGION,
  POST_TYPE_META,
  postTypeKey,
} from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import type { CareAssignment } from '../hooks/useCareNetwork';

interface Props {
  posts?: SolidaryPost[];
  /** Capa protegida: solo se pasa si el usuario es dirigente o padrino. */
  careAssignments?: CareAssignment[];
  center?: { latitude: number; longitude: number } | null;
  currentUserId?: string | null;
  searchZoneGeoJson?: Record<string, unknown> | null;
  onSelectPost?: (post: SolidaryPost) => void;
  webHint?: string;
}

/** Mapa Barrial del Muro Solidario con la misma presentación, zona de comunidad y pines agrupados del Directorio. */
export function NeighborhoodMap({
  posts = [],
  careAssignments,
  center,
  currentUserId = null,
  searchZoneGeoJson = null,
  onSelectPost,
  webHint,
}: Props) {
  const { t, tCategory } = useI18n();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focusCoord, setFocusCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const mapCenter = center ?? {
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  };

  const { markers, groupedPosts } = useMemo(() => {
    const grouped = new Map<
      string,
      { coord: { latitude: number; longitude: number }; items: SolidaryPost[] }
    >();

    for (const post of posts) {
      if (!post.coordinates) continue;
      const key = `${post.coordinates.latitude.toFixed(5)},${post.coordinates.longitude.toFixed(5)}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.items.push(post);
      } else {
        grouped.set(key, { coord: post.coordinates, items: [post] });
      }
    }

    const postMarkers: LeafletMarkerItem[] = Array.from(grouped.entries()).map(
      ([key, { coord, items }]) => {
        const primary = items[0];
        const uniqueTypes = Array.from(new Set(items.map((item) => item.postType)));
        const colors = uniqueTypes.map((typeKey) => POST_TYPE_META[typeKey].color);
        const primaryType = uniqueTypes[0];
        const iconType =
          uniqueTypes.length > 1
            ? 'multi'
            : primaryType === 'AYUDA'
            ? 'auxilio'
            : primaryType === 'DONACION' || primaryType === 'PRESTAMO'
            ? 'producto'
            : 'servicio';

        const isOwnHome = Boolean(
          currentUserId && items.some((item) => item.authorId === currentUserId)
        );
        const badgeText = t(postTypeKey(primary.postType));

        return {
          id: `post-${primary.id}`,
          latitude: coord.latitude,
          longitude: coord.longitude,
          color: colors[0],
          colors,
          iconType,
          count: items.length,
          isHome: isOwnHome,
          selected: selectedKey === key,
          badgeText,
          title:
            items.length > 1
              ? `${primary.authorName ?? t('post.anonymous')} (${items.length} publicaciones)`
              : tCategory(primary.category),
          subtitle: `${badgeText} · ${primary.authorName ?? t('post.anonymous')}`,
        };
      }
    );

    const careMarkers: LeafletMarkerItem[] = (careAssignments ?? [])
      .filter((item) => item.vulnerable.coordinates)
      .map((item) => {
        const meta = CARE_STATUS_META[item.status];
        const label = t(careStatusKey(item.status));
        return {
          id: `care-${item.id}`,
          latitude: item.vulnerable.coordinates!.latitude,
          longitude: item.vulnerable.coordinates!.longitude,
          color: meta.color,
          iconType: 'auxilio',
          badgeText: label,
          title: item.vulnerable.name,
          subtitle: `${label} · ${t('map.padrino', { name: item.buddy.name ?? t('care.noPadrino') })}`,
        };
      });

    return {
      markers: [...postMarkers, ...careMarkers],
      groupedPosts: grouped,
    };
  }, [careAssignments, currentUserId, posts, selectedKey, t, tCategory]);

  const webFallback = (
    <View className="flex-1 rounded-3xl items-center justify-center bg-[#E8F0EC] px-8 min-h-[260px]">
      <MapIcon size={42} color="#1E5E45" />
      <Text
        className="mt-3 text-center text-neutral-textMain"
        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
      >
        {t('map.webTitle')}
      </Text>
      <Text
        className="mt-2 text-center text-neutral-textMuted"
        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
      >
        {webHint ?? t('map.webDefault')}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 overflow-hidden min-h-[260px]">
      <LeafletMap
        center={mapCenter}
        focus={focusCoord}
        zoom={15}
        radiusMeters={500}
        searchZoneGeoJson={searchZoneGeoJson}
        showHomePin={Boolean(center)}
        homeTitle="Tu ubicación"
        homeSubtitle="Zona activa de tu comunidad"
        markers={markers}
        onMarkerPress={(id) => {
          if (!id.startsWith('post-')) return;
          const postId = id.slice(5);
          const found = posts.find((p) => p.id === postId);
          if (!found || !found.coordinates) return;
          const key = `${found.coordinates.latitude.toFixed(5)},${found.coordinates.longitude.toFixed(5)}`;
          setSelectedKey(key);
          setFocusCoord(found.coordinates);
          const group = groupedPosts.get(key)?.items;
          onSelectPost?.(group?.[0] ?? found);
        }}
        webFallback={webFallback}
      />
    </View>
  );
}

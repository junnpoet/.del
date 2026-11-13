import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Map as MapIcon } from 'lucide-react-native';
import { useI18n } from '../../../i18n';
import { LeafletMap, type LeafletMarkerItem } from '../../../components/ui/LeafletMap';
import { DEFAULT_REGION, CARE_STATUS_META, careStatusKey, postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import type { CareAssignment } from '../hooks/useCareNetwork';

interface Props {
  posts?: SolidaryPost[];
  /** Capa protegida: solo se pasa si el usuario es dirigente o padrino. */
  careAssignments?: CareAssignment[];
  center?: { latitude: number; longitude: number } | null;
  webHint?: string;
}

/** Mapa Barrial con publicaciones solidarias y, si corresponde, la Red de Cuidado. */
export function NeighborhoodMap({ posts = [], careAssignments, center, webHint }: Props) {
  const { t, tCategory } = useI18n();
  const mapCenter = center ?? {
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  };

  const markers = useMemo<LeafletMarkerItem[]>(() => {
    const postMarkers: LeafletMarkerItem[] = posts
      .filter((post) => post.coordinates)
      .map((post) => {
        const badgeText = t(postTypeKey(post.postType));
        return {
          id: `post-${post.id}`,
          latitude: post.coordinates!.latitude,
          longitude: post.coordinates!.longitude,
          color: post.postType === 'AYUDA' ? '#D90429' : '#1E5E45',
          badgeText,
          title: tCategory(post.category),
          subtitle: `${badgeText} · ${post.authorName ?? t('post.anonymous')}`,
        };
      });

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
          badgeText: label,
          title: item.vulnerable.name,
          subtitle: `${label} · ${t('map.padrino', { name: item.buddy.name ?? t('care.noPadrino') })}`,
        };
      });

    return [...postMarkers, ...careMarkers];
  }, [careAssignments, posts, t, tCategory]);

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
    <View className="flex-1 rounded-3xl overflow-hidden min-h-[260px]">
      <LeafletMap
        center={mapCenter}
        zoom={15}
        markers={markers}
        webFallback={webFallback}
      />
    </View>
  );
}

import React from 'react';
import { Platform, Text, View } from 'react-native';
import { Heart, Map as MapIcon } from 'lucide-react-native';
import { useI18n } from '../../../i18n';
import { DEFAULT_REGION, CARE_STATUS_META, careStatusKey, postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import type { CareAssignment } from '../hooks/useCareNetwork';

// react-native-maps solo existe en iOS/Android: en web no se carga (rompería el bundle).
type MapsModule = typeof import('react-native-maps');
const Maps: MapsModule | null =
  Platform.OS === 'web' ? null : (require('react-native-maps') as MapsModule);

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

  if (!Maps) {
    return (
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
  }

  const MapView = Maps.default;
  const Marker = Maps.Marker;
  const region = center ? { ...DEFAULT_REGION, ...center } : DEFAULT_REGION;

  return (
    <View className="flex-1 rounded-3xl overflow-hidden min-h-[260px]">
      <MapView style={{ width: '100%', height: '100%' }} initialRegion={region}>
        {posts
          .filter((post) => post.coordinates)
          .map((post) => (
            <Marker
              key={post.id}
              coordinate={post.coordinates!}
              title={tCategory(post.category)}
              description={`${t(postTypeKey(post.postType))} · ${post.authorName ?? t('post.anonymous')}`}
            >
              <View
                className={`px-2.5 py-1.5 rounded-2xl border border-white ${
                  post.postType === 'AYUDA' ? 'bg-emergency-alert' : 'bg-primary'
                }`}
              >
                <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
                  {t(postTypeKey(post.postType))}
                </Text>
              </View>
            </Marker>
          ))}

        {careAssignments
          ?.filter((item) => item.vulnerable.coordinates)
          .map((item) => {
            const meta = CARE_STATUS_META[item.status];
            const label = t(careStatusKey(item.status));
            return (
              <Marker
                key={item.id}
                coordinate={item.vulnerable.coordinates!}
                title={item.vulnerable.name}
                description={`${label} · ${t('map.padrino', { name: item.buddy.name ?? t('care.noPadrino') })}`}
              >
                <View
                  className="px-2.5 py-1 rounded-full border-2 border-white flex-row items-center"
                  style={{ backgroundColor: meta.color }}
                >
                  <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text className="text-white ml-1" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
                    {label}
                  </Text>
                </View>
              </Marker>
            );
          })}
      </MapView>
    </View>
  );
}

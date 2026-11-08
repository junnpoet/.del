import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Heart, MessageCircle, ShieldCheck, Star, MapPin } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import type { Database } from '../../../types/database';
import { useI18n } from '../../../i18n';

type NearbyService = Database['public']['Functions']['get_nearby_services']['Returns'][number];

interface ServiceCardProps {
  service: NearbyService;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onConsult: () => void;
  isTogglingFavorite?: boolean;
}

export function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
  onConsult,
  isTogglingFavorite = false,
}: ServiceCardProps) {
  const { t, tCategory } = useI18n();
  return (
    <Card className="mb-3">
      <View className="flex-row items-start">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Text
            className="text-primary"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
          >
            {service.provider_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            {service.title}
          </Text>
          <Text
            className="mt-0.5 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {service.provider_name} · {tCategory(service.category)}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? t('service.favRemove') : t('service.favAdd')}
          accessibilityState={{ busy: isTogglingFavorite }}
          disabled={isTogglingFavorite}
          onPress={onToggleFavorite}
          hitSlop={10}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-mutedBg"
        >
          <Heart size={20} color={isFavorite ? '#D90429' : '#6C727A'} fill={isFavorite ? '#D90429' : 'none'} />
        </TouchableOpacity>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center">
        <View className="mr-3 flex-row items-center">
          <ShieldCheck size={16} color="#1E5E45" />
          <Text
            className="ml-1 text-primary"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
          >
            {t('service.seal')}
          </Text>
        </View>
        <View className="mr-3 flex-row items-center">
          <Star size={15} color="#EAB308" fill="#EAB308" />
          <Text
            className="ml-1 text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
          >
            {service.rating_avg?.toFixed(1) ?? '0.0'}
          </Text>
          <Text
            className="ml-1 text-neutral-textLight"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            ({service.reviews_total ?? 0})
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={15} color="#6C727A" />
          <Text
            className="ml-1 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
          >
            {t('service.distance', { n: Math.round(service.distance_meters) })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('service.consultA11y', { name: service.provider_name })}
        onPress={onConsult}
        className="mt-4 min-h-[46px] flex-row items-center justify-center rounded-2xl bg-primary"
      >
        <MessageCircle size={18} color="#FFFFFF" />
        <Text
          className="ml-2 text-white"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
        >
          {t('service.consult')}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

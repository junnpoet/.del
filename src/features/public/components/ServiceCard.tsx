import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  Flag,
  Heart,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Star,
  Wrench,
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import type { Database } from '../../../types/database';
import type { ListingType } from '../../../types';
import { useI18n } from '../../../i18n';
import { usePublicI18n } from '../i18n';
import { normalizeListingType } from '../hooks/useDirectory';

type NearbyService = Database['public']['Functions']['get_nearby_services']['Returns'][number];

export const LISTING_TYPE_META: Record<
  ListingType,
  { color: string; bg: string; Icon: typeof Wrench }
> = {
  SERVICIO: { color: '#1E5E45', bg: '#EDF5F1', Icon: Wrench },
  PRODUCTO: { color: '#0284C7', bg: '#E0F2FE', Icon: ShoppingBag },
  AUXILIO: { color: '#D97706', bg: '#FEF3C7', Icon: LifeBuoy },
};

interface ServiceCardProps {
  service: NearbyService;
  isOwn?: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onConsult: () => void;
  onViewMore?: () => void;
  onReport?: () => void;
  onEdit?: () => void;
  isTogglingFavorite?: boolean;
}

export function ServiceCard({
  service,
  isOwn = false,
  isFavorite,
  onToggleFavorite,
  onConsult,
  onViewMore,
  onReport,
  onEdit,
  isTogglingFavorite = false,
}: ServiceCardProps) {
  const { t } = useI18n();
  const { tp, tpCategory } = usePublicI18n();

  const listingType = normalizeListingType(service.listing_type);
  const meta = LISTING_TYPE_META[listingType];
  const TypeIcon = meta.Icon;

  const hasExtraDescription =
    Boolean(service.description?.trim()) &&
    service.description.trim() !== service.title.trim();

  return (
    <Card className="mb-3">
      {/* Tricolor type badge */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: meta.bg }}
        >
          <TypeIcon size={14} color={meta.color} />
          <Text
            className="ml-1.5"
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 12,
              color: meta.color,
            }}
          >
            {tp(`public.type.${listingType}`)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          {isOwn ? (
            onEdit && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Edición"
                onPress={onEdit}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <Pencil size={18} color="#1A1D20" />
              </TouchableOpacity>
            )
          ) : (
            <>
              {onReport && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tp('public.reportA11y', { name: service.provider_name })}
                  onPress={onReport}
                  className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
                >
                  <Flag size={18} color="#6C727A" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? t('service.favRemove') : t('service.favAdd')}
                accessibilityState={{ busy: isTogglingFavorite }}
                disabled={isTogglingFavorite}
                onPress={onToggleFavorite}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <Heart
                  size={20}
                  color={isFavorite ? '#D90429' : '#6C727A'}
                  fill={isFavorite ? '#D90429' : 'none'}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="flex-row items-start">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: meta.bg }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 18,
              color: meta.color,
            }}
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
            {service.provider_name} · {tpCategory(service.category)}
          </Text>
        </View>
      </View>

      {hasExtraDescription && (
        <Text
          numberOfLines={2}
          className="mt-2.5 text-neutral-textMuted"
          style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
        >
          {service.description}
        </Text>
      )}

      <View className="mt-3 flex-row flex-wrap items-center gap-y-1.5">
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
        {!isOwn && (
          <View className="flex-row items-center">
            <MapPin size={15} color="#6C727A" />
            <Text
              className="ml-1 text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
            >
              {t('service.distance', { n: Math.round(service.distance_meters) })}
            </Text>
          </View>
        )}
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        {onViewMore && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onViewMore}
            className="min-h-[48px] items-center justify-center rounded-2xl border border-neutral-border bg-neutral-mutedBg px-4"
          >
            <Text
              numberOfLines={1}
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13.5 }}
            >
              Ver más
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            isOwn ? 'Ver Chats' : t('service.consultA11y', { name: service.provider_name })
          }
          onPress={onConsult}
          className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-2xl bg-primary px-4"
        >
          <MessageCircle size={18} color="#FFFFFF" />
          <Text
            numberOfLines={1}
            className="ml-2 text-center text-white"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
          >
            {isOwn ? 'Ver Chats' : t('service.consult')}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

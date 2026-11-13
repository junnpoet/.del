import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react-native';
import { BottomSheetModal } from '../../../components/ui/BottomSheetModal';
import { supabase } from '../../../services/supabase';
import { useI18n } from '../../../i18n';
import { usePublicI18n } from '../i18n';
import { LISTING_TYPE_META } from './ServiceCard';
import { normalizeListingType, type NearbyService } from '../hooks/useDirectory';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author_name: string;
}

export interface ServiceDetailModalProps {
  visible: boolean;
  service: NearbyService | null;
  pointServices?: NearbyService[];
  onSelectService?: (service: NearbyService) => void;
  onClose: () => void;
  onConsult: (service: NearbyService) => void;
  isFavorite?: (serviceId: string) => boolean;
  onToggleFavorite?: (serviceId: string) => void;
  onReport?: (service: NearbyService) => void;
}

export function ServiceDetailModal({
  visible,
  service,
  pointServices = [],
  onSelectService,
  onClose,
  onConsult,
  isFavorite,
  onToggleFavorite,
  onReport,
}: ServiceDetailModalProps) {
  const { t } = useI18n();
  const { tp, tpCategory } = usePublicI18n();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!visible || !service) {
      setReviews([]);
      return;
    }

    let cancelled = false;
    setLoadingReviews(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, profiles:client_id(full_name)')
          .eq('service_id', service.service_id)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (error || !data) {
          setReviews([]);
          return;
        }
        const mapped: ReviewItem[] = data.map((row: any) => ({
          id: row.id,
          rating: row.rating ?? 5,
          comment: row.comment ?? null,
          created_at: row.created_at,
          author_name: row.profiles?.full_name || 'Vecino de Urb. Bellamar',
        }));
        setReviews(mapped);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, service?.service_id]);

  if (!service) return null;

  const listingType = normalizeListingType(service.listing_type);
  const meta = LISTING_TYPE_META[listingType];
  const TypeIcon = meta.Icon;
  const photos: string[] = Array.isArray((service as any).photos)
    ? (service as any).photos
    : [];

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="88%">
      <View className="mb-3 flex-row items-center justify-between">
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
          {onReport && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tp('public.reportA11y', { name: service.provider_name })}
              onPress={() => {
                onClose();
                onReport(service);
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
            >
              <Flag size={17} color="#6C727A" />
            </TouchableOpacity>
          )}
          {isFavorite && onToggleFavorite && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite(service.service_id) ? t('service.favRemove') : t('service.favAdd')
              }
              onPress={() => onToggleFavorite(service.service_id)}
              className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
            >
              <Heart
                size={17}
                color={isFavorite(service.service_id) ? '#D90429' : '#6C727A'}
                fill={isFavorite(service.service_id) ? '#D90429' : 'none'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar detalle"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-mutedBg"
          >
            <X size={18} color="#6C727A" />
          </TouchableOpacity>
        </View>
      </View>

      {pointServices.length > 1 && onSelectService && (
        <View className="mb-3">
          <Text
            className="mb-1.5 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
          >
            OFRECIDO EN ESTE PUNTO ({pointServices.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pointServices.map((item) => {
              const active = item.service_id === service.service_id;
              const itemType = normalizeListingType(item.listing_type);
              const itemMeta = LISTING_TYPE_META[itemType];
              const ItemIcon = itemMeta.Icon;
              return (
                <TouchableOpacity
                  key={item.service_id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => onSelectService(item)}
                  className="mr-2 flex-row items-center rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: active ? itemMeta.color : '#E5E7EB',
                    backgroundColor: active ? itemMeta.bg : '#F9FAFB',
                    maxWidth: 210,
                  }}
                >
                  <ItemIcon size={13} color={itemMeta.color} />
                  <Text
                    numberOfLines={1}
                    className="ml-1.5"
                    style={{
                      fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                      fontSize: 12,
                      color: active ? itemMeta.color : '#374151',
                    }}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
        <Text
          className="text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 19 }}
        >
          {service.title}
        </Text>
        <Text
          className="mt-1 text-neutral-textMuted"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13.5 }}
        >
          {service.provider_name} · {tpCategory(service.category)}
        </Text>

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
              {service.rating_avg?.toFixed(1) ?? '0.0'} ({service.reviews_total ?? reviews.length})
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

        {/* Full Description */}
        <View className="mt-4 rounded-2xl bg-neutral-mutedBg p-3.5">
          <Text
            className="mb-1 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
          >
            DESCRIPCIÓN
          </Text>
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13.5, lineHeight: 20 }}
          >
            {service.description || service.title}
          </Text>
        </View>

        {/* Photos Section */}
        <View className="mt-4">
          <Text
            className="mb-2 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
          >
            FOTOGRAFÍAS
          </Text>
          {photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {photos.map((uri, idx) => (
                <Image
                  key={`${uri}-${idx}`}
                  source={{ uri }}
                  className="mr-2.5 h-32 w-44 rounded-2xl bg-neutral-mutedBg"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-row items-center rounded-2xl border border-dashed border-neutral-border bg-neutral-mutedBg/50 px-3.5 py-3">
              <Camera size={18} color="#6C727A" />
              <Text
                className="ml-2.5 flex-1 text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5 }}
              >
                El vecino aún no ha adjuntado fotografías de referencia.
              </Text>
            </View>
          )}
        </View>

        {/* Reviews / Comments Section */}
        <View className="mt-4 mb-2">
          <Text
            className="mb-2 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
          >
            COMENTARIOS DE VECINOS ({reviews.length})
          </Text>

          {loadingReviews ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#1E5E45" />
            </View>
          ) : reviews.length === 0 ? (
            <View className="rounded-2xl bg-neutral-mutedBg/60 px-3.5 py-3">
              <Text
                className="text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5 }}
              >
                Aún no hay comentarios registrados para esta publicación.
              </Text>
            </View>
          ) : (
            reviews.map((rev) => (
              <View
                key={rev.id}
                className="mb-2 rounded-2xl border border-neutral-border/70 bg-neutral-surface p-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-neutral-textMain"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    {rev.author_name}
                  </Text>
                  <View className="flex-row items-center">
                    <Star size={13} color="#EAB308" fill="#EAB308" />
                    <Text
                      className="ml-1 text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                    >
                      {rev.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                {Boolean(rev.comment) && (
                  <Text
                    className="mt-1 text-neutral-textMuted"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 18 }}
                  >
                    {rev.comment}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          onClose();
          onConsult(service);
        }}
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
    </BottomSheetModal>
  );
}

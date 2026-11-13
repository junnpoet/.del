import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Camera,
  Check,
  ChevronDown,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react-native';
import { supabase } from '../../../services/supabase';
import { useDemo } from '../../../services/demoStore';
import { QuickPublishFAB } from '../../../components/ui/QuickPublishFAB';
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

export interface MapPointBottomSheetProps {
  visible: boolean;
  service: NearbyService | null;
  pointServices: NearbyService[];
  onSelectService: (service: NearbyService) => void;
  onClose: () => void;
  onConsult: (service: NearbyService) => void;
  isFavorite: (serviceId: string) => boolean;
  onToggleFavorite: (serviceId: string) => void;
  onReport: (service: NearbyService) => void;
}

/**
 * Google-Maps-style peekable and draggable bottom sheet for map pins.
 * Opens without a dark backdrop in a compact peeked state (with an icon-only
 * consult button) so the selected pin stays visible, and smoothly expands on
 * drag to reveal description, photos, comments, and the full consult button.
 */
export function MapPointBottomSheet({
  visible,
  service,
  pointServices,
  onSelectService,
  onClose,
  onConsult,
  isFavorite,
  onToggleFavorite,
  onReport,
}: MapPointBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const { setHideGlobalFAB } = useDemo();
  const { t } = useI18n();
  const { tp, tpCategory } = usePublicI18n();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setDropdownOpen(false);
  }, [visible, service?.service_id]);

  useEffect(() => {
    setHideGlobalFAB(rendered && Boolean(service));
    return () => {
      setHideGlobalFAB(false);
    };
  }, [rendered, service, setHideGlobalFAB]);

  const hasMultipleAtPoint = pointServices.length > 1;
  const expandedHeight = Math.min(Math.round(windowHeight * 0.76), 600);
  const peekHeight = 204;
  const peekOffset = Math.max(0, expandedHeight - peekHeight);
  const closedOffset = expandedHeight + 48;

  const translateY = useRef(new Animated.Value(closedOffset)).current;
  const currentOffsetRef = useRef(closedOffset);
  const dragStartOffsetRef = useRef(peekOffset);
  const peekOffsetRef = useRef(peekOffset);
  const closedOffsetRef = useRef(closedOffset);
  peekOffsetRef.current = peekOffset;
  closedOffsetRef.current = closedOffset;

  useEffect(() => {
    const listenerId = translateY.addListener(({ value }) => {
      currentOffsetRef.current = value;
    });
    return () => {
      translateY.removeListener(listenerId);
    };
  }, [translateY]);

  const snapTo = (target: 'peek' | 'expanded' | 'closed') => {
    const toValue =
      target === 'expanded'
        ? 0
        : target === 'peek'
        ? peekOffsetRef.current
        : closedOffsetRef.current;

    if (target === 'expanded') setIsExpanded(true);
    if (target === 'peek') setIsExpanded(false);

    if (target === 'closed') {
      Animated.timing(translateY, {
        toValue,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setRendered(false);
          setIsExpanded(false);
        }
      });
      return;
    }

    Animated.spring(translateY, {
      toValue,
      damping: 24,
      stiffness: 260,
      mass: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (visible && service) {
      if (!wasOpenRef.current) {
        wasOpenRef.current = true;
        setRendered(true);
        translateY.setValue(closedOffsetRef.current);
        setIsExpanded(false);
        Animated.spring(translateY, {
          toValue: peekOffsetRef.current,
          damping: 24,
          stiffness: 260,
          mass: 0.85,
          useNativeDriver: true,
        }).start();
      }
    } else if (wasOpenRef.current || rendered) {
      wasOpenRef.current = false;
      snapTo('closed');
    }
  }, [visible, Boolean(service)]);

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

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation((val) => {
            currentOffsetRef.current = val;
            dragStartOffsetRef.current = val;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(
            0,
            Math.min(closedOffsetRef.current, dragStartOffsetRef.current + gesture.dy)
          );
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const next = Math.max(
            0,
            Math.min(closedOffsetRef.current, dragStartOffsetRef.current + gesture.dy)
          );
          const pOffset = peekOffsetRef.current;

          if (gesture.vy < -0.35 || next < pOffset * 0.55) {
            snapTo('expanded');
          } else if (
            (gesture.vy > 0.55 && next > pOffset + 32) ||
            next > pOffset + 110
          ) {
            onCloseRef.current();
          } else {
            snapTo('peek');
          }
        },
      }),
    [translateY]
  );

  if (!rendered || !service) return null;

  const listingType = normalizeListingType(service.listing_type);
  const meta = LISTING_TYPE_META[listingType];
  const TypeIcon = meta.Icon;
  const photos: string[] = Array.isArray((service as any).photos)
    ? (service as any).photos
    : [];

  const safePeekRange = Math.max(peekOffset, 1);
  const expandProgress = translateY.interpolate({
    inputRange: [0, safePeekRange],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const peekOnlyOpacity = translateY.interpolate({
    inputRange: [0, safePeekRange * 0.45, safePeekRange],
    outputRange: [0, 0.25, 1],
    extrapolate: 'clamp',
  });
  const peekOnlyScale = translateY.interpolate({
    inputRange: [0, safePeekRange],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });
  const expandedOnlyOpacity = translateY.interpolate({
    inputRange: [0, safePeekRange * 0.55, safePeekRange],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });

  const safePeekOffsetForFab = Math.max(peekOffset, 40);
  const capOffsetForFab = Math.max(16, Math.round(safePeekOffsetForFab * 0.3));
  const capFabLift = -(expandedHeight - capOffsetForFab - 2);
  const peekFabLift = -(peekHeight - 2);
  const fabTranslateY = translateY.interpolate({
    inputRange: [0, capOffsetForFab, safePeekOffsetForFab, closedOffset],
    outputRange: [capFabLift, capFabLift, peekFabLift, 0],
    extrapolate: 'clamp',
  });
  const fadeEndOffset = Math.max(capOffsetForFab, Math.round(safePeekOffsetForFab * 0.55));
  const fadeStartOffset = Math.max(fadeEndOffset + 1, Math.round(safePeekOffsetForFab * 0.88));
  const fabOpacity = translateY.interpolate({
    inputRange: [0, fadeEndOffset, fadeStartOffset, closedOffset],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <QuickPublishFAB
        baseBottom={16}
        animatedTranslateY={fabTranslateY}
        animatedOpacity={fabOpacity}
        zIndex={35}
        pointerEvents={isExpanded ? 'none' : 'auto'}
      />
      <Animated.View
        style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: expandedHeight,
        zIndex: 40,
        transform: [{ translateY }],
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 16,
      }}
      className="rounded-t-3xl border-t border-neutral-border bg-neutral-surface"
    >
      {/* Draggable Handle + Peeked Header */}
      <View {...panResponder.panHandlers} className="px-5 pt-2.5 pb-2">
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Contraer detalles' : 'Expandir detalles'}
          onPress={() => snapTo(isExpanded ? 'peek' : 'expanded')}
          className="items-center pb-2"
        >
          <View className="h-1.5 w-11 rounded-full bg-neutral-border" />
        </TouchableOpacity>

        {/* Top Selector + Count + Actions */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            {hasMultipleAtPoint ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Seleccionar oferta del punto"
                accessibilityState={{ expanded: dropdownOpen }}
                onPress={() => setDropdownOpen((prev) => !prev)}
                className="flex-row items-center rounded-full border px-3 py-1"
                style={{
                  backgroundColor: meta.bg,
                  borderColor: dropdownOpen ? meta.color : 'transparent',
                }}
              >
                <TypeIcon size={14} color={meta.color} />
                <Text
                  className="ml-1.5 mr-1"
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 12,
                    color: meta.color,
                  }}
                >
                  {tp(`public.type.${listingType}`)}
                </Text>
                <ChevronDown size={14} color={meta.color} />
              </TouchableOpacity>
            ) : (
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
            )}

            {hasMultipleAtPoint && (
              <View className="rounded-full bg-neutral-mutedBg px-2.5 py-1">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
                >
                  {Math.max(
                    1,
                    pointServices.findIndex((item) => item.service_id === service.service_id) + 1
                  )}
                  /{pointServices.length}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tp('public.reportA11y', { name: service.provider_name })}
              onPress={() => onReport(service)}
              className="h-9 w-9 items-center justify-center rounded-full bg-neutral-mutedBg"
            >
              <Flag size={16} color="#6C727A" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite(service.service_id) ? t('service.favRemove') : t('service.favAdd')
              }
              onPress={() => onToggleFavorite(service.service_id)}
              className="h-9 w-9 items-center justify-center rounded-full bg-neutral-mutedBg"
            >
              <Heart
                size={16}
                color={isFavorite(service.service_id) ? '#D90429' : '#6C727A'}
                fill={isFavorite(service.service_id) ? '#D90429' : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalle"
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-neutral-mutedBg"
            >
              <X size={17} color="#6C727A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Peeked Summary Row + Icon-only Consult Button */}
        <View className="mt-2.5 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={isExpanded ? 2 : 1}
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17 }}
            >
              {service.title}
            </Text>
            <Text
              numberOfLines={1}
              className="mt-0.5 text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            >
              {service.provider_name} · {tpCategory(service.category)}
            </Text>

            <View className="mt-1.5 flex-row flex-wrap items-center">
              <View className="mr-3 flex-row items-center">
                <ShieldCheck size={14} color="#1E5E45" />
                <Text
                  className="ml-1 text-primary"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}
                >
                  {t('service.seal')}
                </Text>
              </View>
              <View className="mr-3 flex-row items-center">
                <Star size={13.5} color="#EAB308" fill="#EAB308" />
                <Text
                  className="ml-1 text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
                >
                  {service.rating_avg?.toFixed(1) ?? '0.0'} (
                  {service.reviews_total ?? reviews.length})
                </Text>
              </View>
              <View className="flex-row items-center">
                <MapPin size={13.5} color="#6C727A" />
                <Text
                  className="ml-1 text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}
                >
                  {t('service.distance', { n: Math.round(service.distance_meters) })}
                </Text>
              </View>
            </View>
          </View>

          <Animated.View
            pointerEvents={isExpanded ? 'none' : 'auto'}
            style={{
              opacity: peekOnlyOpacity,
              transform: [{ scale: peekOnlyScale }],
            }}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('service.consultA11y', {
                name: service.provider_name,
              })}
              onPress={() => onConsult(service)}
              className="min-h-[44px] flex-row items-center justify-center rounded-2xl bg-primary px-3.5"
            >
              <MessageCircle size={17} color="#FFFFFF" />
              <Text
                numberOfLines={1}
                className="ml-1.5 text-white"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
              >
                {t('service.consult')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {dropdownOpen && hasMultipleAtPoint && (
        <>
          <Pressable
            onPress={() => setDropdownOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 55,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 66,
              left: 20,
              right: 20,
              zIndex: 60,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.16,
              shadowRadius: 12,
              elevation: 18,
            }}
            className="rounded-2xl border border-neutral-border bg-neutral-surface p-1.5"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: isExpanded ? 240 : 126 }}
            >
              {pointServices.map((item, idx) => {
                const active = item.service_id === service.service_id;
                const itemType = normalizeListingType(item.listing_type);
                const itemMeta = LISTING_TYPE_META[itemType];
                const ItemIcon = itemMeta.Icon;
                return (
                  <TouchableOpacity
                    key={item.service_id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      setDropdownOpen(false);
                      onSelectService(item);
                    }}
                    className={`flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
                      active ? 'bg-neutral-mutedBg' : ''
                    }`}
                  >
                    <View className="flex-1 flex-row items-center pr-2">
                      <View
                        className="h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: itemMeta.bg }}
                      >
                        <ItemIcon size={14} color={itemMeta.color} />
                      </View>
                      <View className="ml-2.5 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-neutral-textMain"
                          style={{
                            fontFamily: active
                              ? 'PlusJakartaSans_700Bold'
                              : 'PlusJakartaSans_600SemiBold',
                            fontSize: 13,
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: 'PlusJakartaSans_500Medium',
                            fontSize: 11,
                            color: itemMeta.color,
                          }}
                        >
                          {idx + 1}/{pointServices.length} · {tp(`public.type.${itemType}`)}
                        </Text>
                      </View>
                    </View>
                    {active && <Check size={16} color="#1E5E45" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}

      {/* Expanded Content: Description, Photos, Comments & Full Consult Button */}
      <Animated.View
        pointerEvents={isExpanded ? 'auto' : 'none'}
        style={{ flex: 1, opacity: expandedOnlyOpacity }}
        className="px-5 pb-4"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="mt-2 rounded-2xl bg-neutral-mutedBg p-3.5">
            <Text
              className="mb-1 text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
            >
              DESCRIPCIÓN
            </Text>
            <Text
              className="text-neutral-textMain"
              style={{
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 13.5,
                lineHeight: 20,
              }}
            >
              {service.description || service.title}
            </Text>
          </View>

          <View className="mt-4">
            <Text
              className="mb-2 text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
            >
              FOTOGRAFÍAS
            </Text>
            {photos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

          <View className="mt-4 mb-3">
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
                      style={{
                        fontFamily: 'PlusJakartaSans_400Regular',
                        fontSize: 13,
                        lineHeight: 18,
                      }}
                    >
                      {rev.comment}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <Animated.View
          style={{
            transform: [
              {
                translateY: expandProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onConsult(service)}
            className="mt-2 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-primary px-4"
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {t('service.consult')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
    </>
  );
}

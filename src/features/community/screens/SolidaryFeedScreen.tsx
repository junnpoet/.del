import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Gift,
  HeartHandshake,
  Layers,
  LayoutGrid,
  LifeBuoy,
  Lock,
  LogIn,
  Map as MapIcon,
  Megaphone,
  Pin,
  Repeat,
  Settings,
  Users,
} from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  EditPublicationModal,
  type EditPublicationTarget,
} from '../../../components/ui/EditPublicationModal';
import { useI18n, type TranslationKey } from '../../../i18n';
import {
  CARE_STATUS_META,
  careStatusKey,
  FEED_FILTERS,
  FEED_FILTER_META,
  feedFilterKey,
  isCareVolunteerPost,
  matchesFeedFilter,
  type FeedFilter,
} from '../constants';
import { useMembership } from '../hooks/useMembership';
import {
  type SolidaryPost,
  useSolidaryFeed,
  useToggleVolunteer,
  useUpdatePostStatus,
} from '../hooks/useSolidaryFeed';
import { useCareNetwork } from '../hooks/useCareNetwork';
import { useJoinRequests } from '../hooks/useLeaderDashboard';
import {
  useActiveEmergency,
  usePastEmergencies,
  useZoneEmergency,
} from '../../emergency/hooks/useEmergencyRealtime';
import { EmergencySupportGroupsModal } from '../components/EmergencySupportGroupsModal';
import { SolidaryArchiveModal } from '../components/SolidaryArchiveModal';
import { SolidaryPostCard } from '../components/SolidaryPostCard';
import { CommunityActionCard } from '../components/CommunityActionCard';
import { CareVolunteerCard } from '../components/CareVolunteerCard';
import { SolidaryActionSheet } from '../components/SolidaryActionSheet';
import {
  NeighborhoodNewsModal,
  useNeighborhoodNewsUnread,
} from '../components/NeighborhoodNewsModal';
import { NeighborhoodMap } from '../components/NeighborhoodMap';
import { StateMessage } from '../components/StateMessage';
import { confirmAction, errorMessage, showMessage } from '../utils';
import { supabase } from '../../../services/supabase';
import type { CareStatus } from '../../../types';

const BENEFITS: TranslationKey[] = ['community.benefit1', 'community.benefit2', 'community.benefit3'];

const FILTER_ICONS: Record<FeedFilter, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  TODOS: Layers,
  AYUDA: LifeBuoy,
  PRESTAMO: Repeat,
  DONACION: Gift,
  ACCION_COMUNAL: Users,
};

/** Muro Solidario Unificado (SPEC-04 §2.1 y §2.2). */
export default function SolidaryFeedScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const membership = useMembership();
  const { state, profile, isLeader, isPadrino } = membership;
  const isMember = state === 'MIEMBRO';

  const [view, setView] = useState<'feed' | 'map'>('feed');
  const [filter, setFilter] = useState<FeedFilter>('TODOS');
  const [filterOpen, setFilterOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [supportGroupsOpen, setSupportGroupsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditPublicationTarget | null>(null);
  const [selectedPointPosts, setSelectedPointPosts] = useState<SolidaryPost[]>([]);

  const feed = useSolidaryFeed(isMember);
  const updatePostStatus = useUpdatePostStatus();
  const toggleVolunteer = useToggleVolunteer();
  const { unreadCount, markAllRead } = useNeighborhoodNewsUnread();
  const care = useCareNetwork(isMember);
  const { zoneEmergency } = useZoneEmergency();
  const { resolveEmergency } = useActiveEmergency(profile?.group_id);
  const { pastEvents: pastEmergencies, refetch: refetchPastEmergencies } = usePastEmergencies(
    profile?.group_id
  );
  const { requests } = useJoinRequests(isLeader);
  const canSeeCareLayer = isLeader || isPadrino || care.assignments.length > 0;
  const pendingRequests = requests.data?.length ?? 0;

  // Filtrado en memoria: activas en el muro y resueltas en Archivo.
  const posts = useMemo(() => {
    const all = feed.data ?? [];
    return all.filter((post) => post.status !== 'RESOLVED' && matchesFeedFilter(post.postType, filter));
  }, [feed.data, filter]);

  const resolvedPosts = useMemo(() => {
    const all = feed.data ?? [];
    return all.filter((post) => post.status === 'RESOLVED');
  }, [feed.data]);

  const selectedPost = useMemo(
    () => (selectedPostId ? (feed.data ?? []).find((p) => p.id === selectedPostId) ?? null : null),
    [feed.data, selectedPostId]
  );

  const handleOpenNews = () => {
    setNewsOpen(true);
    markAllRead();
  };

  const handleMarkResolved = async (post: SolidaryPost) => {
    const ok = await confirmAction(
      t('post.markResolvedConfirmTitle'),
      t('post.markResolvedConfirmBody'),
      t('post.markResolved')
    );
    if (!ok) return;
    updatePostStatus.mutate(
      { postId: post.id, status: 'RESOLVED' },
      { onError: (err) => showMessage(t('common.error'), errorMessage(err)) }
    );
  };

  const handleToggleVolunteer = (post: SolidaryPost, isJoined: boolean, roleNote?: string) => {
    toggleVolunteer.mutate(
      { postId: post.id, isJoined, roleNote },
      { onError: (err) => showMessage(t('minka.toggleFailed'), errorMessage(err)) }
    );
  };

  const center =
    profile?.lat !== null && profile?.lat !== undefined && profile?.lng !== null && profile?.lng !== undefined
      ? { latitude: profile.lat, longitude: profile.lng }
      : null;

  const { data: searchZoneGeoJson } = useQuery<Record<string, unknown> | null>({
    queryKey: ['community-search-zone', center?.latitude, center?.longitude],
    enabled: Boolean(center),
    staleTime: 60_000,
    queryFn: async () => {
      if (!center) return null;
      const { data, error } = await supabase.rpc('get_search_zone_geojson', {
        radius_meters: 500,
        user_home_lat: center.latitude,
        user_home_lng: center.longitude,
      });
      if (error) return null;
      return (data as Record<string, unknown> | null) ?? null;
    },
  });

  const handleRequest = async () => {
    try {
      await membership.requestMembership();
      showMessage(t('community.requestSentTitle'), t('community.requestSent'));
    } catch (error) {
      showMessage(t('community.requestFailed'), errorMessage(error));
    }
  };

  const headerActions =
    isMember && isLeader ? (
      <View className="flex-row items-center gap-2">
        {zoneEmergency && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={async () => {
              const ok = await confirmAction(
                'Finalizar contingencia',
                '¿Confirmas que la emergencia en tu zona ha terminado?',
                'Finalizar'
              );
              if (ok) {
                await resolveEmergency(zoneEmergency.id);
                void refetchPastEmergencies();
              }
            }}
            className="min-h-[44px] rounded-2xl border border-red-300 bg-white px-3 items-center justify-center"
          >
            <Text
              className="text-[#991B1B]"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
            >
              Finalizar
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('leader.title')}
          onPress={() => router.push('/leader-dashboard')}
          className="min-h-[44px] min-w-[44px] rounded-2xl border border-emerald-200 bg-emerald-50 items-center justify-center"
        >
          <Settings size={20} color="#065F46" />
        </TouchableOpacity>
      </View>
    ) : undefined;

  /* ---------- Estados previos a la membresía ---------- */
  if (!isMember) {
    return (
      <View className="flex-1 bg-neutral-background">
        <Header title={t('community.title')} subtitle={t('community.lockedSubtitle')} />
        <ScrollView contentContainerClassName="p-5 justify-center flex-grow">
          {state === 'LOADING' ? (
            <StateMessage loading title={t('community.loading')} />
          ) : state === 'NO_SESSION' ? (
            <StateMessage
              icon={<LogIn size={28} color="#1E5E45" />}
              title={t('community.noSession.title')}
              message={t('community.noSession.body')}
              actionLabel={t('community.noSession.action')}
              onAction={() => router.replace('/(auth)/login')}
            />
          ) : state === 'PENDIENTE' ? (
            <StateMessage
              icon={<Clock size={30} color="#D97706" />}
              title={t('community.pending.title')}
              message={t('community.pending.body', {
                address: profile?.home_address ?? t('community.pending.addressFallback'),
              })}
              actionLabel={t('community.pending.refresh')}
              onAction={() => membership.refreshProfile()}
            />
          ) : (
            <Card className="p-6 items-center">
              <View className="w-16 h-16 rounded-full bg-neutral-mutedBg items-center justify-center mb-4">
                <Lock size={28} color="#1E5E45" strokeWidth={2.2} />
              </View>
              <Text
                className="text-neutral-textMain text-center mb-2"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20 }}
              >
                {t('community.locked.title')}
              </Text>
              <Text
                className="text-neutral-textMuted text-center leading-5 mb-5 px-2"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
              >
                {t('community.locked.body')}
              </Text>
              <View className="w-full bg-neutral-mutedBg/60 rounded-2xl p-4 mb-5">
                {BENEFITS.map((benefit) => (
                  <View key={benefit} className="flex-row items-center mb-2">
                    <CheckCircle size={16} color="#1E5E45" strokeWidth={2.2} />
                    <Text
                      className="text-neutral-textMain ml-2.5 flex-1"
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
                    >
                      {t(benefit)}
                    </Text>
                  </View>
                ))}
              </View>
              <Button
                title={t('community.locked.request')}
                onPress={handleRequest}
                isLoading={membership.requesting}
                className="w-full"
              />
            </Card>
          )}
        </ScrollView>
      </View>
    );
  }

  /* ---------- Miembro activo o dirigente ---------- */
  return (
    <View className={`flex-1 ${zoneEmergency ? 'bg-[#FFF7F7]' : 'bg-neutral-background'}`}>
      <Header title={t('community.title')} subtitle={t('community.subtitle')} rightAction={headerActions} />

      {isLeader && pendingRequests > 0 && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push('/leader-dashboard')}
          className="mx-4 mt-3 bg-neutral-surface p-3.5 rounded-2xl border border-emerald-200 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <Settings size={16} color="#065F46" strokeWidth={2.2} />
              <Text className="text-neutral-textMain ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
                {t('leader.title')}
              </Text>
            </View>
            <Text className="text-neutral-textMuted mt-0.5" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
              {pendingRequests === 1
                ? t('community.leaderBannerOne')
                : t('community.leaderBanner', { n: pendingRequests })}
            </Text>
          </View>
          <View className="bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl">
            <Text className="text-[#065F46]" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t('community.review', { n: pendingRequests })}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View className="pt-4 flex-1">
        {/* Accesos comunitarios: Anuncios (solo ícono), Red de Cuidado Vecinal y Archivo */}
        <View className="px-4 flex-row items-center gap-2 pb-3 border-b border-neutral-border/70">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('feed.newsButtonA11y')}
            onPress={handleOpenNews}
            className="w-11 h-11 rounded-2xl border border-neutral-border bg-neutral-surface items-center justify-center relative"
          >
            <Megaphone size={18} color="#1E5E45" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emergency-alert items-center justify-center">
                <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10.5 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {canSeeCareLayer && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('care.title')}
              onPress={() => router.push('/care-network')}
              className="flex-1 min-h-[44px] flex-row items-center justify-center rounded-2xl border border-neutral-border bg-neutral-surface px-3 py-2"
            >
              <HeartHandshake size={16} color="#1E5E45" />
              <Text
                numberOfLines={1}
                className="ml-2 text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12.5 }}
              >
                {t('care.title')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Archivo"
            onPress={() => {
              void refetchPastEmergencies();
              setArchiveOpen(true);
            }}
            className={`${canSeeCareLayer ? 'px-3.5' : 'flex-1'} min-h-[44px] flex-row items-center justify-center rounded-2xl border border-neutral-border bg-neutral-surface py-2`}
          >
            <Archive size={16} color="#4B5563" />
            <Text
              numberOfLines={1}
              className="ml-1.5 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12.5 }}
            >
              Archivo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenedor debajo de la primera fila: en mapa, la barra de filtros flota exactamente a la misma altura */}
        <View className="flex-1 relative">
          <View
            className={
              view === 'map'
                ? 'absolute top-3 left-4 right-4 z-20'
                : 'px-4 pt-3 mb-3'
            }
          >
            <View className="flex-row items-center gap-2">
            <View className="flex-1">
              {(() => {
                const SelectedIcon = FILTER_ICONS[filter];
                const selectedMeta = FEED_FILTER_META[filter];
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{ expanded: filterOpen }}
                    onPress={() => setFilterOpen((prev) => !prev)}
                    className="min-h-[46px] flex-row items-center justify-between rounded-2xl border border-neutral-border bg-neutral-surface px-3 py-1.5"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                        style={{ backgroundColor: selectedMeta.tint }}
                      >
                        <SelectedIcon size={16} color={selectedMeta.color} strokeWidth={2.2} />
                      </View>
                      <Text
                        numberOfLines={1}
                        className="text-neutral-textMain"
                        style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13.5 }}
                      >
                        {t(feedFilterKey(filter))}
                      </Text>
                    </View>
                    {filterOpen ? (
                      <ChevronUp size={18} color="#6C727A" />
                    ) : (
                      <ChevronDown size={18} color="#6C727A" />
                    )}
                  </TouchableOpacity>
                );
              })()}
            </View>

            <View className="flex-row items-center bg-neutral-mutedBg p-1 rounded-2xl">
              {(
                [
                  { key: 'feed', label: t('community.feed'), Icon: LayoutGrid },
                  { key: 'map', label: t('community.map'), Icon: MapIcon },
                ] as const
              ).map(({ key, label, Icon }) => {
                const active = view === key;
                return (
                  <TouchableOpacity
                    key={key}
                    accessibilityRole="tab"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: active }}
                    onPress={() => setView(key)}
                    className={`w-10 h-10 items-center justify-center rounded-xl ${
                      active ? 'bg-neutral-surface' : ''
                    }`}
                  >
                    <Icon size={18} color={active ? '#1A1D20' : '#6C727A'} strokeWidth={2.1} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {filterOpen && (
            <View className="mt-1.5 rounded-2xl border border-neutral-border bg-neutral-surface p-1.5 shadow-sm z-30">
              {FEED_FILTERS.map((value) => {
                const active = filter === value;
                const Icon = FILTER_ICONS[value];
                const meta = FEED_FILTER_META[value];
                return (
                  <TouchableOpacity
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      setFilter(value);
                      setFilterOpen(false);
                    }}
                    className={`flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
                      active ? 'bg-neutral-mutedBg' : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                        style={{ backgroundColor: meta.tint }}
                      >
                        <Icon size={16} color={meta.color} strokeWidth={2.2} />
                      </View>
                      <Text
                        numberOfLines={1}
                        className={active ? 'text-neutral-textMain' : 'text-neutral-textMuted'}
                        style={{
                          fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                          fontSize: 13.5,
                        }}
                      >
                        {t(feedFilterKey(value))}
                      </Text>
                    </View>
                    {active && <Check size={16} color={meta.color} strokeWidth={2.4} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {view === 'feed' ? (
          <ScrollView
            contentContainerClassName="px-4 pb-28 pt-1"
            refreshControl={<RefreshControl refreshing={feed.isRefetching} onRefresh={() => void feed.refetch()} />}
          >
            {zoneEmergency && (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.88}
                onPress={() => setSupportGroupsOpen(true)}
                className="mb-3 rounded-2xl border border-red-200 bg-[#FFF1F2] p-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center rounded-xl bg-red-600 px-2.5 py-1">
                    <Pin size={12} color="#FFFFFF" />
                    <Text
                      className="ml-1.5 text-white uppercase tracking-wider"
                      style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 10.5 }}
                    >
                      Publicación fijada · Emergencia en curso
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-[#7F1D1D]"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                >
                  Grupos de apoyo · {zoneEmergency.event_type}
                </Text>
                {zoneEmergency.description ? (
                  <Text
                    numberOfLines={2}
                    className="text-[#991B1B] mt-1"
                    style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                  >
                    {zoneEmergency.description}
                  </Text>
                ) : null}
                <View className="mt-3 pt-2.5 border-t border-red-200 flex-row items-center justify-between">
                  <Text
                    className="text-[#B91C1C]"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                  >
                    Abrir grupos de apoyo de la emergencia
                  </Text>
                  <ChevronRight size={16} color="#B91C1C" />
                </View>
              </TouchableOpacity>
            )}

            {feed.isLoading ? (
              <StateMessage loading title={t('community.loadingFeed')} />
            ) : feed.isError ? (
              <StateMessage
                title={t('community.loadError')}
                message={errorMessage(feed.error)}
                actionLabel={t('common.retry')}
                onAction={() => feed.refetch()}
              />
            ) : posts.length === 0 ? (
              <StateMessage
                icon={<HeartHandshake size={28} color="#1E5E45" />}
                title={t('community.empty')}
                message={t('community.emptyBody')}
              />
            ) : (
              posts.map((post) => {
                const hasParticipated = Boolean(
                  profile?.id &&
                    (post.acceptedHelperId === profile.id ||
                      post.volunteers?.some((v) => v.userId === profile.id) ||
                      post.commenterIds?.includes(profile.id))
                );
                const canResolve = Boolean(
                  isLeader || (profile?.id && post.authorId === profile.id) || hasParticipated
                );
                if (post.postType === 'VOLUNTARIADO') {
                  return (
                    <CommunityActionCard
                      key={post.id}
                      post={post}
                      currentUserId={profile?.id ?? null}
                      canResolve={canResolve}
                      onCoordinate={(item) => setSelectedPostId(item.id)}
                      onToggleVolunteer={(item, joined) => handleToggleVolunteer(item, joined)}
                      onMarkResolved={handleMarkResolved}
                      busyVolunteer={toggleVolunteer.isPending}
                    />
                  );
                }
                if (isCareVolunteerPost(post.postType, post.category)) {
                  return (
                    <CareVolunteerCard
                      key={post.id}
                      post={post}
                      currentUserId={profile?.id ?? null}
                      canResolve={canResolve}
                      onCoordinate={(item) => setSelectedPostId(item.id)}
                      onToggleVolunteer={(item, joined) =>
                        handleToggleVolunteer(item, joined, t('yanapay.roleNote'))
                      }
                      onMarkResolved={handleMarkResolved}
                      busyVolunteer={toggleVolunteer.isPending}
                    />
                  );
                }
                return (
                  <SolidaryPostCard
                    key={post.id}
                    post={post}
                    canResolve={canResolve}
                    onCoordinate={(item) => setSelectedPostId(item.id)}
                    onMarkResolved={handleMarkResolved}
                    onEdit={
                      post.authorId && post.authorId === profile?.id
                        ? (item) =>
                            setEditTarget({
                              kind: 'solidary',
                              id: item.id,
                              postType: item.postType,
                              category: item.category,
                              description: item.description,
                              urgency: item.urgency,
                            })
                        : undefined
                    }
                  />
                );
              })
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 relative">
            <NeighborhoodMap
              posts={posts}
              careAssignments={canSeeCareLayer ? care.assignments : undefined}
              center={center}
              currentUserId={profile?.id ?? null}
              searchZoneGeoJson={searchZoneGeoJson ?? null}
              onSelectPost={(post, group) => {
                setSelectedPostId(post.id);
                setSelectedPointPosts(group);
              }}
              webHint={t('community.mapWebHint')}
            />
            {canSeeCareLayer && (
              <View className="absolute top-16 left-4 right-4 bg-neutral-surface/95 p-3 rounded-2xl border border-neutral-border/70">
                <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
                  {t('community.careLegend', {
                    title: t('care.title'),
                    view: isLeader ? t('community.careViewLeader') : t('community.careViewPadrino'),
                  })}
                </Text>
                <View className="flex-row items-center justify-between mt-1.5">
                  {(Object.keys(CARE_STATUS_META) as CareStatus[]).map((status) => (
                    <View key={status} className="flex-row items-center">
                      <View
                        className="w-2.5 h-2.5 rounded-full mr-1.5"
                        style={{ backgroundColor: CARE_STATUS_META[status].color }}
                      />
                      <Text
                        className="text-neutral-textMuted"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                      >
                        {t(careStatusKey(status))}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
        </View>
      </View>

      <NeighborhoodNewsModal visible={newsOpen} onClose={() => setNewsOpen(false)} />
      <EmergencySupportGroupsModal
        visible={supportGroupsOpen}
        onClose={() => setSupportGroupsOpen(false)}
        eventId={zoneEmergency?.id}
        eventType={zoneEmergency?.event_type}
        description={zoneEmergency?.description}
      />
      <SolidaryArchiveModal
        visible={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        resolvedPosts={resolvedPosts}
        pastEmergencies={pastEmergencies}
        currentUserId={profile?.id ?? null}
        onCoordinate={(post) => {
          setArchiveOpen(false);
          setSelectedPostId(post.id);
        }}
        onToggleVolunteer={(post, joined) => handleToggleVolunteer(post, joined)}
      />
      <SolidaryActionSheet
        post={selectedPost}
        currentUserId={profile?.id ?? null}
        pointPosts={selectedPointPosts}
        showBackdrop={selectedPointPosts.length === 0}
        onSelectPointPost={(post) => setSelectedPostId(post.id)}
        onClose={() => {
          setSelectedPostId(null);
          setSelectedPointPosts([]);
        }}
      />
      <EditPublicationModal target={editTarget} onClose={() => setEditTarget(null)} />
    </View>
  );
}

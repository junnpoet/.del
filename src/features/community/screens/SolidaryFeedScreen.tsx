import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle,
  Clock,
  HeartHandshake,
  LayoutGrid,
  Lock,
  LogIn,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Chip } from '../../../components/ui/Chip';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useI18n, type TranslationKey } from '../../../i18n';
import { FEED_FILTERS, CARE_STATUS_META, careStatusKey, type FeedFilter } from '../constants';
import { useMembership } from '../hooks/useMembership';
import { useSolidaryFeed } from '../hooks/useSolidaryFeed';
import { useCareNetwork } from '../hooks/useCareNetwork';
import { useJoinRequests } from '../hooks/useLeaderDashboard';
import { SolidaryPostCard } from '../components/SolidaryPostCard';
import { NeighborhoodMap } from '../components/NeighborhoodMap';
import { StateMessage } from '../components/StateMessage';
import { errorMessage, showMessage } from '../utils';
import type { CareStatus } from '../../../types';

const BENEFITS: TranslationKey[] = ['community.benefit1', 'community.benefit2', 'community.benefit3'];

/** Muro Solidario Unificado (SPEC-04 §2.1 y §2.2). */
export default function SolidaryFeedScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const membership = useMembership();
  const { state, profile, isLeader, isPadrino } = membership;
  const isMember = state === 'MIEMBRO';

  const [view, setView] = useState<'feed' | 'map'>('feed');
  const [filter, setFilter] = useState<FeedFilter>('TODOS');

  const feed = useSolidaryFeed(isMember);
  const care = useCareNetwork(isMember);
  const { requests } = useJoinRequests(isLeader);
  const canSeeCareLayer = isLeader || isPadrino || care.assignments.length > 0;
  const pendingRequests = requests.data?.length ?? 0;

  // Filtrado en memoria: cambiar de chip no recarga ni vuelve a consultar.
  const posts = useMemo(() => {
    const all = feed.data ?? [];
    return filter === 'TODOS' ? all : all.filter((post) => post.postType === filter);
  }, [feed.data, filter]);

  const center =
    profile?.lat !== null && profile?.lat !== undefined && profile?.lng !== null && profile?.lng !== undefined
      ? { latitude: profile.lat, longitude: profile.lng }
      : null;

  const handleRequest = async () => {
    try {
      await membership.requestMembership();
      showMessage(t('community.requestSentTitle'), t('community.requestSent'));
    } catch (error) {
      showMessage(t('community.requestFailed'), errorMessage(error));
    }
  };

  const headerActions = isMember ? (
    <View className="flex-row">
      {canSeeCareLayer && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('care.title')}
          onPress={() => router.push('/care-network')}
          className="h-10 w-10 rounded-2xl bg-neutral-mutedBg items-center justify-center"
        >
          <HeartHandshake size={20} color="#1E5E45" />
        </TouchableOpacity>
      )}
      {isLeader && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('leader.title')}
          onPress={() => router.push('/leader-dashboard')}
          className="h-10 w-10 rounded-2xl bg-primary items-center justify-center ml-2"
        >
          <ShieldCheck size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    <View className="flex-1 bg-neutral-background">
      <Header title={t('community.title')} subtitle={t('community.subtitle')} rightAction={headerActions} />

      {isLeader && pendingRequests > 0 && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push('/leader-dashboard')}
          className="mx-4 mt-3 bg-neutral-surface p-3.5 rounded-2xl border border-primary/20 flex-row items-center justify-between"
        >
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <ShieldCheck size={16} color="#1E5E45" strokeWidth={2.2} />
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
          <View className="bg-primary px-3 py-2 rounded-xl">
            <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t('community.review', { n: pendingRequests })}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View className="px-4 pt-4 flex-1">
        {/* Selector [ Muro Feed | Mapa Barrial ] */}
        <View className="flex-row bg-neutral-mutedBg p-1 rounded-2xl mb-3">
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
                accessibilityState={{ selected: active }}
                onPress={() => setView(key)}
                className={`flex-1 flex-row items-center justify-center min-h-[40px] rounded-xl ${
                  active ? 'bg-neutral-surface' : ''
                }`}
              >
                <Icon size={16} color={active ? '#1A1D20' : '#6C727A'} strokeWidth={2} />
                <Text
                  className={`ml-1.5 ${active ? 'text-neutral-textMain' : 'text-neutral-textMuted'}`}
                  style={{
                    fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                    fontSize: 14,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chips de filtrado rápido */}
        <View className="mb-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FEED_FILTERS.map((value) => (
              <Chip
                key={value}
                label={t(`filter.${value}`)}
                isActive={filter === value}
                onPress={() => setFilter(value)}
              />
            ))}
          </ScrollView>
        </View>

        {view === 'feed' ? (
          <ScrollView
            contentContainerClassName="pb-28 pt-1"
            refreshControl={<RefreshControl refreshing={feed.isRefetching} onRefresh={() => void feed.refetch()} />}
          >
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
              posts.map((post) => (
                <SolidaryPostCard key={post.id} post={post} isOwnPost={post.authorId === profile?.id} />
              ))
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 pb-28 relative">
            <NeighborhoodMap
              posts={posts}
              careAssignments={canSeeCareLayer ? care.assignments : undefined}
              center={center}
              webHint={t('community.mapWebHint')}
            />
            {canSeeCareLayer && (
              <View className="absolute top-3 left-3 right-3 bg-neutral-surface/95 p-3 rounded-2xl">
                <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
                  {t('community.careLegend', {
                    title: t('care.title'),
                    view: isLeader ? t('community.careViewLeader') : t('community.careViewPadrino'),
                  })}
                </Text>
                <View className="flex-row items-center justify-between mt-1.5">
                  {(Object.keys(CARE_STATUS_META) as CareStatus[]).map((status) => (
                    <Text
                      key={status}
                      className="text-neutral-textMuted"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                    >
                      {CARE_STATUS_META[status].emoji} {t(careStatusKey(status))}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

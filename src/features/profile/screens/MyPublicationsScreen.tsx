import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import {
  EditPublicationModal,
  type EditPublicationTarget,
} from '../../../components/ui/EditPublicationModal';
import { Header } from '../../../components/ui/Header';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, POST_TYPE_META, postStatusKey, postTypeKey } from '../../community/constants';
import { errorMessage, showMessage, timeAgo } from '../../community/utils';
import { LISTING_TYPE_META } from '../../public/components/ServiceCard';
import { usePublicI18n } from '../../public/i18n';
import {
  useMyPublications,
  type MyServicePublication,
  type MySolidaryPublication,
} from '../hooks/useMyPublications';

type ScopeFilter = 'ALL' | 'DIRECTORY' | 'SOLIDARY';

export function MyPublicationsScreen() {
  const { t, tCategory } = useI18n();
  const { tp, tpCategory } = usePublicI18n();
  const {
    services,
    solidaryPosts,
    isLoading,
    isRefetching,
    refetch,
    updateService,
    deleteService,
    updateSolidaryPost,
  } = useMyPublications();

  const [scope, setScope] = useState<ScopeFilter>('ALL');
  const [editTarget, setEditTarget] = useState<EditPublicationTarget | null>(null);

  const showDirectory = scope === 'ALL' || scope === 'DIRECTORY';
  const showSolidary = scope === 'ALL' || scope === 'SOLIDARY';

  const visibleCount =
    (showDirectory ? services.length : 0) + (showSolidary ? solidaryPosts.length : 0);

  const handleDeleteService = (item: MyServicePublication) => {
    Alert.alert(
      'Eliminar publicación',
      `¿Seguro que deseas eliminar "${item.title}" del directorio?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteService.mutate(item.id, {
              onError: (err) => showMessage(t('common.attention'), errorMessage(err)),
            });
          },
        },
      ]
    );
  };

  const handleResolveSolidary = (item: MySolidaryPublication) => {
    updateSolidaryPost.mutate(
      { id: item.id, status: 'RESOLVED' },
      { onError: (err) => showMessage(t('common.attention'), errorMessage(err)) }
    );
  };

  return (
    <View className="flex-1 bg-neutral-background">
      <Header
        title="Mis publicaciones"
        subtitle="Gestiona tus servicios, productos y avisos"
        showBack
      />

      <View className="px-4 pt-3 pb-2 flex-row gap-2">
        {(
          [
            { key: 'ALL', label: `Todas (${services.length + solidaryPosts.length})` },
            { key: 'DIRECTORY', label: `Directorio (${services.length})` },
            { key: 'SOLIDARY', label: `Muro (${solidaryPosts.length})` },
          ] as const
        ).map((tab) => {
          const active = scope === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setScope(tab.key)}
              className={`px-3.5 py-2 rounded-full border ${
                active
                  ? 'bg-primary border-primary'
                  : 'bg-neutral-surface border-neutral-border'
              }`}
            >
              <Text
                className={active ? 'text-white' : 'text-neutral-textMain'}
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12.5 }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1E5E45" />
        }
      >
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#1E5E45" />
          </View>
        ) : visibleCount === 0 ? (
          <Card className="p-6 items-center">
            <Text
              className="text-neutral-textMain text-center"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              Aún no tienes publicaciones aquí
            </Text>
            <Text
              className="text-neutral-textMuted text-center mt-1.5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
            >
              Usa el botón + de Publicación Rápida para ofrecer un servicio, producto o pedir apoyo.
            </Text>
          </Card>
        ) : (
          <>
            {showDirectory &&
              services.map((item) => {
                const meta = LISTING_TYPE_META[item.listingType];
                const TypeIcon = meta.Icon;
                return (
                  <Card key={`service-${item.id}`} className="mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <View
                        className="flex-row items-center rounded-full px-3 py-1"
                        style={{ backgroundColor: meta.bg }}
                      >
                        <TypeIcon size={14} color={meta.color} />
                        <Text
                          className="ml-1.5"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: meta.color }}
                        >
                          {tp(`public.type.${item.listingType}`)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={13} color="#9EA3AE" />
                        <Text
                          className="text-neutral-textLight ml-1"
                          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                        >
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-neutral-textMuted mt-0.5"
                      style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                    >
                      {tpCategory(item.category)}
                    </Text>
                    {Boolean(item.description?.trim()) && (
                      <Text
                        numberOfLines={2}
                        className="text-neutral-textMuted mt-2 leading-5"
                        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                      >
                        {item.description}
                      </Text>
                    )}

                    <View className="mt-3.5 flex-row items-center gap-2">
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() =>
                          setEditTarget({
                            kind: 'service',
                            id: item.id,
                            listingType: item.listingType,
                            title: item.title,
                            category: item.category,
                            description: item.description ?? item.title,
                          })
                        }
                        className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-xl border border-neutral-border bg-neutral-mutedBg px-3"
                      >
                        <Pencil size={15} color="#1A1D20" />
                        <Text
                          className="ml-1.5 text-neutral-textMain"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                        >
                          Edición
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar publicación"
                        disabled={deleteService.isPending}
                        onPress={() => handleDeleteService(item)}
                        className="min-w-[44px] min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-red-50"
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}

            {showSolidary &&
              solidaryPosts.map((item) => {
                const typeMeta = POST_TYPE_META[item.postType];
                const statusMeta = POST_STATUS_META[item.status];
                const isResolved = item.status === 'RESOLVED';

                return (
                  <Card key={`solidary-${item.id}`} className={`mb-3 ${isResolved ? 'opacity-80' : ''}`}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View
                        className="flex-row items-center rounded-full px-3 py-1"
                        style={{ backgroundColor: typeMeta.bg }}
                      >
                        <Text
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: typeMeta.color }}
                        >
                          {t(postTypeKey(item.postType))}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: statusMeta.tint }}>
                          <Text
                            style={{ color: statusMeta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
                          >
                            {t(postStatusKey(item.status))}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Clock size={13} color="#9EA3AE" />
                          <Text
                            className="text-neutral-textLight ml-1"
                            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                          >
                            {timeAgo(item.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text
                      className="text-neutral-textMain"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                    >
                      {tCategory(item.category)}
                    </Text>
                    <Text
                      numberOfLines={3}
                      className="text-neutral-textMuted mt-1.5 leading-5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
                    >
                      {item.description}
                    </Text>

                    <View className="mt-3.5 flex-row items-center gap-2">
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() =>
                          setEditTarget({
                            kind: 'solidary',
                            id: item.id,
                            postType: item.postType,
                            category: item.category,
                            description: item.description,
                            urgency: item.urgency,
                          })
                        }
                        className="min-h-[44px] flex-1 flex-row items-center justify-center rounded-xl border border-neutral-border bg-neutral-mutedBg px-3"
                      >
                        <Pencil size={15} color="#1A1D20" />
                        <Text
                          className="ml-1.5 text-neutral-textMain"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                        >
                          Edición
                        </Text>
                      </TouchableOpacity>

                      {!isResolved && (
                        <TouchableOpacity
                          accessibilityRole="button"
                          disabled={updateSolidaryPost.isPending}
                          onPress={() => handleResolveSolidary(item)}
                          className="min-h-[44px] flex-row items-center justify-center rounded-xl border border-primary bg-neutral-surface px-3.5"
                        >
                          <CheckCircle2 size={16} color="#1E5E45" />
                          <Text
                            className="ml-1.5 text-primary-dark"
                            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                          >
                            Resolver
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Card>
                );
              })}
          </>
        )}
      </ScrollView>

      <EditPublicationModal target={editTarget} onClose={() => setEditTarget(null)} />
    </View>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Megaphone, X } from 'lucide-react-native';
import { useNews } from '../../public/hooks/useNews';
import { useI18n, type TranslationKey } from '../../../i18n';
import { Card } from '../../../components/ui/Card';
import { timeAgo } from '../utils';

const NEWS_SEEN_KEY = '@sumayni_neighborhood_news_seen_at';

/** Calcula avisos vecinales no leídos desde la última apertura del modal. */
export function useNeighborhoodNewsUnread() {
  const news = useNews();
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(NEWS_SEEN_KEY)
      .then((value) => setLastSeenAt(value))
      .catch(() => undefined);
  }, []);

  const unreadCount = useMemo(() => {
    const items = news.data ?? [];
    if (!lastSeenAt) return items.length;
    const seenMs = new Date(lastSeenAt).getTime();
    return items.filter((item) => item.created_at && new Date(item.created_at).getTime() > seenMs).length;
  }, [news.data, lastSeenAt]);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    AsyncStorage.setItem(NEWS_SEEN_KEY, now).catch(() => undefined);
  }, []);

  return { news, unreadCount, markAllRead };
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SOURCE_KEYS: Record<string, TranslationKey> = {
  MUNICIPAL: 'news.source.MUNICIPAL',
  SERVICIOS_PUBLICOS: 'news.source.SERVICIOS_PUBLICOS',
  DIRIGENCIA: 'news.source.DIRIGENCIA',
};

/** Modal de Comunicados Oficiales del Barrio (SPEC-04 §2.1). */
export function NeighborhoodNewsModal({ visible, onClose }: Props) {
  const { t } = useI18n();
  const { data = [], isLoading, isError, refetch } = useNews();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/45 justify-end">
        <View className="bg-neutral-background rounded-t-3xl max-h-[82%] px-4 pt-5 pb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-2xl bg-primary-tint items-center justify-center mr-3">
                <Megaphone size={20} color="#1E5E45" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-neutral-textMain"
                  style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
                >
                  {t('feed.newsModalTitle')}
                </Text>
                <Text
                  className="text-neutral-textMuted"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  {t('feed.newsModalSubtitle')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('common.closeModal')}
              onPress={onClose}
              className="min-w-[48px] min-h-[48px] rounded-2xl bg-neutral-surface border border-neutral-border items-center justify-center"
            >
              <X size={20} color="#1A1D20" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#1E5E45" />
              </View>
            ) : isError ? (
              <Card className="p-4 items-center">
                <Text
                  className="text-neutral-textMuted text-center mb-3"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
                >
                  {t('news.loadError')}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => refetch()}
                  className="min-h-[48px] px-5 bg-primary rounded-xl items-center justify-center"
                >
                  <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>
                    {t('common.retry')}
                  </Text>
                </TouchableOpacity>
              </Card>
            ) : data.length === 0 ? (
              <Card className="p-6 items-center">
                <Text
                  className="text-neutral-textMuted text-center"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
                >
                  {t('news.empty')}
                </Text>
              </Card>
            ) : (
              data.map((item) => {
                const sourceKey = SOURCE_KEYS[item.source ?? 'DIRIGENCIA'] ?? 'news.source.DIRIGENCIA';
                return (
                  <Card key={item.id} className="mb-3 p-4">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="px-2.5 py-1 rounded-lg bg-primary-tint">
                        <Text
                          className="text-primary-dark"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                        >
                          {t(sourceKey)} · {item.sector_name}
                        </Text>
                      </View>
                      <Text
                        className="text-neutral-textMuted"
                        style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                      >
                        {timeAgo(item.created_at)}
                      </Text>
                    </View>
                    <Text
                      className="text-neutral-textMain mb-1"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-neutral-textMuted leading-5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                    >
                      {item.content}
                    </Text>
                  </Card>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

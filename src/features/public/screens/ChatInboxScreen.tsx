import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useChatInbox, type InboxConversation } from '../hooks/useChatInbox';
import { usePublicI18n } from '../i18n';

type RoleFilter = 'ALL' | 'PROVIDER' | 'CLIENT';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatInboxScreen() {
  const router = useRouter();
  const { serviceId, serviceTitle: filteredServiceTitle } = useLocalSearchParams<{
    serviceId?: string;
    serviceTitle?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { tp } = usePublicI18n();
  const {
    conversations,
    isLoading,
    isRefetching,
    refetch,
    currentUserId,
  } = useChatInbox();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const filtered = useMemo(() => {
    if (!currentUserId) return [];
    const byService = serviceId
      ? conversations.filter((c) => c.service_id === serviceId)
      : conversations;
    if (roleFilter === 'PROVIDER') {
      return byService.filter((c) => c.provider_id === currentUserId);
    }
    if (roleFilter === 'CLIENT') {
      return byService.filter((c) => c.client_id === currentUserId);
    }
    return byService;
  }, [conversations, currentUserId, roleFilter, serviceId]);

  const filterTabs: { key: RoleFilter; label: string }[] = [
    { key: 'ALL', label: tp('inbox.filterAll') },
    { key: 'PROVIDER', label: tp('inbox.filterProvider') },
    { key: 'CLIENT', label: tp('inbox.filterClient') },
  ];

  const renderItem = ({ item }: { item: InboxConversation }) => {
    const isAsProvider = item.provider_id === currentUserId;
    const counterpartName = isAsProvider
      ? item.client?.full_name ?? tp('chat.defaultClient')
      : item.provider?.full_name ?? tp('chat.defaultProvider');
    const serviceTitle = item.service?.title ?? tp('chat.defaultService');
    const preview = item.latestMessage?.content ?? tp('inbox.noMessagesYet');
    const timestamp = formatRelativeTime(
      item.latestMessage?.created_at ?? item.created_at
    );
    const hasReviewRequest = Boolean(item.latestMessage?.is_review_request);

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${counterpartName} - ${serviceTitle}`}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.85}
      >
        <Card className="mb-3">
          <View className="flex-row items-center">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isAsProvider ? '#EDF5F1' : '#E0F2FE' }}
            >
              {isAsProvider ? (
                <Wrench size={20} color="#1E5E45" />
              ) : (
                <User size={20} color="#0284C7" />
              )}
            </View>

            <View className="ml-3 flex-1">
              <View className="flex-row items-center justify-between">
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{
                    backgroundColor: isAsProvider ? '#EDF5F1' : '#E0F2FE',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 12,
                      color: isAsProvider ? '#1E5E45' : '#0284C7',
                    }}
                  >
                    {isAsProvider ? tp('inbox.roleProvider') : tp('inbox.roleClient')}
                  </Text>
                </View>

                {timestamp ? (
                  <Text
                    className="text-neutral-textLight"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                  >
                    {timestamp}
                  </Text>
                ) : null}
              </View>

              <Text
                numberOfLines={1}
                className="mt-1.5 text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
              >
                {counterpartName}
              </Text>
              <Text
                numberOfLines={1}
                className="text-primary"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
              >
                {serviceTitle}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
              >
                {preview}
              </Text>

              {hasReviewRequest && (
                <View className="mt-2 flex-row items-center">
                  <ShieldCheck size={14} color="#D97706" />
                  <Text
                    className="ml-1 text-[#92400E]"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                  >
                    {tp('inbox.reviewRequestedBadge')}
                  </Text>
                </View>
              )}
            </View>

            <ChevronRight size={20} color="#9EA3AE" />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="flex-1 bg-neutral-background"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      {/* Header */}
      <View className="border-b border-neutral-border/70 bg-neutral-surface px-4 pb-3 pt-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={tp('chat.backA11y')}
            onPress={() => router.back()}
            className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
          >
            <ArrowLeft size={20} color="#1A1D20" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
            >
              {tp('inbox.title')}
            </Text>
            <Text
              numberOfLines={1}
              className="text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
            >
              {serviceId
                ? `Chats de: ${filteredServiceTitle ?? 'esta publicación'}`
                : tp('inbox.subtitle')}
            </Text>
          </View>
        </View>

        {/* Role filter pills */}
        <View className="mt-3 flex-row gap-2">
          {filterTabs.map((tab) => {
            const active = roleFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setRoleFilter(tab.key)}
                className={`min-h-[48px] flex-1 items-center justify-center rounded-2xl px-3 ${
                  active ? 'bg-primary' : 'bg-neutral-mutedBg'
                }`}
              >
                <Text
                  numberOfLines={1}
                  className={active ? 'text-white' : 'text-neutral-textMain'}
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!currentUserId ? (
        <View className="flex-1 items-center justify-center px-8">
          <MessageCircle size={38} color="#9EA3AE" />
          <Text
            className="mt-3 text-center text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
          >
            {tp('inbox.authRequired')}
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E5E45" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={async () => {
                await refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-20">
              <MessageCircle size={38} color="#9EA3AE" />
              <Text
                className="mt-3 text-center text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
              >
                {tp('inbox.emptyTitle')}
              </Text>
              <Text
                className="mt-1.5 text-center text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 19 }}
              >
                {tp('inbox.emptyBody')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default ChatInboxScreen;

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Mic,
  Smartphone,
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, postStatusKey, postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { timeAgo } from '../utils';

interface Props {
  post: SolidaryPost;
  canResolve: boolean;
  onCoordinate: (post: SolidaryPost) => void;
  onMarkResolved: (post: SolidaryPost) => void;
}

/** Tarjeta de publicación solidaria con ciclo de vida completo (SPEC-04 §2.2). */
export function SolidaryPostCard({ post, canResolve, onCoordinate, onMarkResolved }: Props) {
  const { t, tCategory } = useI18n();
  const isHelp = post.postType === 'AYUDA';
  const name = post.authorName ?? t('post.anonymous');
  const category = tCategory(post.category);
  const statusMeta = POST_STATUS_META[post.status];
  const isResolved = post.status === 'RESOLVED';

  return (
    <Card className={`mb-3 p-4 ${isResolved ? 'opacity-80' : ''}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 flex-wrap gap-1.5">
          <View className={`px-2.5 py-1 rounded-xl ${isHelp ? 'bg-emergency-tint' : 'bg-neutral-mutedBg'}`}>
            <Text
              className={isHelp ? 'text-emergency-alert' : 'text-neutral-textMain'}
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              {t(postTypeKey(post.postType))}
            </Text>
          </View>

          <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: statusMeta.tint }}>
            <Text style={{ color: statusMeta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t(postStatusKey(post.status))}
            </Text>
          </View>

          {post.urgency === 'ALTA_CRITICA' && (
            <View className="px-2.5 py-1 rounded-lg bg-emergency-alert">
              <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
                {t('post.urgent')}
              </Text>
            </View>
          )}

          {post.isFromWhatsapp && (
            <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-[#DCF8C6]">
              <Smartphone size={13} color="#075E54" />
              <Text className="ml-1 text-[#075E54]" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                {t('post.whatsappBadge')}
              </Text>
            </View>
          )}

          {post.isAiVoice && (
            <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-sun-tint">
              <Mic size={13} color="#B45309" />
              <Text className="ml-1 text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                {t('post.aiVoiceBadge')}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center ml-2">
          <Clock size={13} color="#9EA3AE" />
          <Text className="text-neutral-textLight ml-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text className="text-neutral-textMain leading-6" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
        {category}
      </Text>
      <Text className="text-neutral-textMuted mb-2" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}>
        {t('post.by', { name })}
      </Text>
      <Text className="text-neutral-textMain leading-5 mb-3" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}>
        {post.description}
      </Text>

      <View className="pt-2.5 border-t border-neutral-border/50 flex-row items-center gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="flex-1 min-h-[48px] px-3 bg-primary rounded-xl flex-row items-center justify-center"
        >
          <MessageCircle size={16} color="#FFFFFF" />
          <Text
            numberOfLines={1}
            className="text-white ml-1.5"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
          >
            {t('post.coordinate', { n: post.commentsCount })}
          </Text>
        </TouchableOpacity>

        {canResolve && !isResolved && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onMarkResolved(post)}
            className="min-h-[48px] px-3 bg-neutral-surface border border-primary rounded-xl flex-row items-center justify-center"
          >
            <CheckCircle2 size={16} color="#1E5E45" />
            <Text
              numberOfLines={1}
              className="text-primary-dark ml-1.5"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
            >
              {t('post.markResolved')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

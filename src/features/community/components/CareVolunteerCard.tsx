import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, HeartHandshake, MessageCircle, Mic, Smartphone } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, postStatusKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { timeAgo } from '../utils';

interface Props {
  post: SolidaryPost;
  currentUserId: string | null;
  canResolve: boolean;
  onCoordinate: (post: SolidaryPost) => void;
  onToggleVolunteer: (post: SolidaryPost, isJoined: boolean) => void;
  onMarkResolved: (post: SolidaryPost) => void;
  busyVolunteer?: boolean;
}

/** Tarjeta abierta de Cuidado Vecinal / Yanapay para postular como acompañante (SPEC-04 §2.5). */
export function CareVolunteerCard({
  post,
  currentUserId,
  canResolve,
  onCoordinate,
  onToggleVolunteer,
  onMarkResolved,
  busyVolunteer = false,
}: Props) {
  const { t, tCategory } = useI18n();
  const isJoined = Boolean(currentUserId && post.volunteers.some((v) => v.userId === currentUserId));
  const statusMeta = POST_STATUS_META[post.status];
  const isResolved = post.status === 'RESOLVED';

  return (
    <Card className={`mb-3 p-4 ${isResolved ? 'opacity-80' : ''}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-wrap gap-1.5 flex-1 mr-2">
          <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-sun-tint">
            <HeartHandshake size={14} color="#B45309" />
            <Text className="text-sun-dark ml-1" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t('yanapay.badge')}
            </Text>
          </View>
          <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: statusMeta.tint }}>
            <Text style={{ color: statusMeta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t(postStatusKey(post.status))}
            </Text>
          </View>
          {post.isFromWhatsapp && (
            <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-[#E7F6EC]">
              <Smartphone size={13} color="#075E54" />
              <Text className="ml-1 text-[#075E54]" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                {t('post.whatsappBadge')}
              </Text>
            </View>
          )}
          {post.isAiVoice && (
            <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-primary-tint">
              <Mic size={13} color="#1E5E45" />
              <Text className="ml-1 text-primary-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                {t('post.aiVoiceBadge')}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-neutral-textMuted" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
          {timeAgo(post.createdAt)}
        </Text>
      </View>

      <Text className="text-neutral-textMain mb-0.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
        {tCategory(post.category)}
      </Text>
      <Text className="text-neutral-textMuted mb-2" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}>
        {post.authorName ?? t('post.anonymous')}
      </Text>
      <Text className="text-neutral-textMain leading-5 mb-2.5" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}>
        {post.description}
      </Text>

      <Text className="text-neutral-textMuted mb-3" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>
        {t('yanapay.companions', { n: post.volunteers.length })}
      </Text>

      {!isResolved && (
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busyVolunteer}
          onPress={() => onToggleVolunteer(post, isJoined)}
          className={`min-h-[48px] rounded-xl flex-row items-center justify-center px-4 mb-2 ${
            isJoined ? 'bg-primary-tint border border-primary' : 'bg-primary'
          }`}
        >
          {busyVolunteer ? (
            <ActivityIndicator size="small" color={isJoined ? '#1E5E45' : '#FFFFFF'} />
          ) : (
            <>
              <HeartHandshake size={18} color={isJoined ? '#1E5E45' : '#FFFFFF'} />
              <Text
                className={`ml-2 ${isJoined ? 'text-primary-dark' : 'text-white'}`}
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
              >
                {isJoined ? t('yanapay.applied') : t('yanapay.apply')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="flex-1 min-h-[48px] bg-neutral-mutedBg rounded-xl flex-row items-center justify-center px-3"
        >
          <MessageCircle size={16} color="#1A1D20" />
          <Text
            numberOfLines={1}
            className="text-neutral-textMain ml-1.5"
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

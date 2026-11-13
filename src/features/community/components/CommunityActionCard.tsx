import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, Clock, MessageCircle, Mic, Users } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, POST_TYPE_META, postStatusKey } from '../constants';
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

/** Tarjeta de Acción Comunal / Minka alineada con el estilo visual del directorio. */
export function CommunityActionCard({
  post,
  currentUserId,
  canResolve,
  onCoordinate,
  onToggleVolunteer,
  onMarkResolved,
  busyVolunteer = false,
}: Props) {
  const { t, tCategory } = useI18n();
  const target = post.targetVolunteers && post.targetVolunteers > 0 ? post.targetVolunteers : 5;
  const count = post.volunteers.length;
  const progress = Math.min(100, Math.round((count / target) * 100));
  const isJoined = Boolean(currentUserId && post.volunteers.some((v) => v.userId === currentUserId));
  const statusMeta = POST_STATUS_META[post.status];
  const typeMeta = POST_TYPE_META.VOLUNTARIADO;
  const isResolved = post.status === 'RESOLVED';
  const authorName = post.authorName ?? t('post.anonymous');

  return (
    <Card className={`mb-3 ${isResolved ? 'opacity-80' : ''}`}>
      {/* Fila superior: píldora de tipo + estado y tiempo */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: typeMeta.bg }}
        >
          <Users size={14} color={typeMeta.color} />
          <Text
            className="ml-1.5"
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 12,
              color: typeMeta.color,
            }}
          >
            {t('minka.badge')}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: statusMeta.tint }}>
            <Text style={{ color: statusMeta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}>
              {t(postStatusKey(post.status))}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={13} color="#9EA3AE" />
            <Text className="text-neutral-textLight ml-1" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}>
              {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bloque Avatar + Título + Autor */}
      <View className="flex-row items-start">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: typeMeta.bg }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 18,
              color: typeMeta.color,
            }}
          >
            {authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            {tCategory(post.category)}
          </Text>
          <Text
            className="mt-0.5 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {authorName}
          </Text>
        </View>
      </View>

      <Text
        className="mt-2.5 text-neutral-textMuted"
        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
      >
        {post.description}
      </Text>

      {post.isAiVoice && (
        <View className="mt-2 flex-row items-center">
          <View className="flex-row items-center px-2.5 py-1 rounded-full bg-sun-tint">
            <Mic size={12} color="#B45309" />
            <Text className="ml-1 text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}>
              {t('post.aiVoiceBadge')}
            </Text>
          </View>
        </View>
      )}

      {/* Meta colectiva */}
      <View className="bg-neutral-mutedBg rounded-2xl p-3 mt-3">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center">
            <Users size={15} color="#1E5E45" />
            <Text className="text-neutral-textMain ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
              {t('minka.goal', { count, target })}
            </Text>
          </View>
          <Text className="text-primary-dark" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
            {progress}%
          </Text>
        </View>
        <View className="h-2.5 rounded-full bg-neutral-border overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </View>
        {post.volunteers.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {post.volunteers.slice(0, 6).map((vol) => {
              const volName = vol.userName ?? t('post.anonymous');
              return (
                <View key={vol.id} className="px-2.5 py-1 rounded-full bg-neutral-surface border border-neutral-border">
                  <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                    {volName}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {!isResolved && (
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busyVolunteer}
          onPress={() => onToggleVolunteer(post, isJoined)}
          className={`min-h-[48px] rounded-2xl flex-row items-center justify-center px-4 mt-3 ${
            isJoined ? 'bg-neutral-mutedBg border border-neutral-border' : 'bg-primary'
          }`}
        >
          {busyVolunteer ? (
            <ActivityIndicator size="small" color={isJoined ? '#1E5E45' : '#FFFFFF'} />
          ) : (
            <Text
              className={isJoined ? 'text-neutral-textMain' : 'text-white'}
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {isJoined ? t('minka.leave') : t('minka.join')}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <View className="mt-2.5 flex-row items-center gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="flex-1 h-12 bg-neutral-mutedBg border border-neutral-border rounded-2xl flex-row items-center justify-center px-3"
        >
          <MessageCircle size={16} color="#1A1D20" />
          <Text
            numberOfLines={1}
            className="text-neutral-textMain ml-1.5"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13.5 }}
          >
            {t('post.coordinate', { n: post.commentsCount })}
          </Text>
        </TouchableOpacity>
        {canResolve && !isResolved && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('post.markResolved')}
            onPress={() => onMarkResolved(post)}
            className="w-12 h-12 bg-neutral-surface border border-primary rounded-2xl items-center justify-center"
          >
            <CheckCircle2 size={20} color="#1E5E45" />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

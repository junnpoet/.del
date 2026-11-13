import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, MessageCircle, Mic, Share2, Users } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, postStatusKey, postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { shareViaWhatsapp, timeAgo } from '../utils';

interface Props {
  post: SolidaryPost;
  currentUserId: string | null;
  canResolve: boolean;
  onCoordinate: (post: SolidaryPost) => void;
  onToggleVolunteer: (post: SolidaryPost, isJoined: boolean) => void;
  onMarkResolved: (post: SolidaryPost) => void;
  busyVolunteer?: boolean;
}

/** Tarjeta de Acción Comunal / Minka con meta colectiva y adhesión en 1 tap (SPEC-04 §2.4). */
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
  const isResolved = post.status === 'RESOLVED';

  const handleDiffuse = () => {
    void shareViaWhatsapp(
      t('post.diffuseText', {
        type: t(postTypeKey(post.postType)),
        category: tCategory(post.category),
        description: post.description,
      })
    );
  };

  return (
    <Card className={`mb-3 p-4 ${isResolved ? 'opacity-80' : ''}`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-wrap gap-1.5 flex-1 mr-2">
          <View className="px-2.5 py-1 rounded-lg bg-primary-tint">
            <Text className="text-primary-dark" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t('minka.badge')}
            </Text>
          </View>
          <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: statusMeta.tint }}>
            <Text style={{ color: statusMeta.color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}>
              {t(postStatusKey(post.status))}
            </Text>
          </View>
          {post.isAiVoice && (
            <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-sun-tint">
              <Mic size={13} color="#B45309" />
              <Text className="ml-1 text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
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
      <Text className="text-neutral-textMain leading-5 mb-3" style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}>
        {post.description}
      </Text>

      {/* Meta colectiva */}
      <View className="bg-neutral-mutedBg rounded-2xl p-3 mb-3">
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
              const name = vol.userName ?? t('post.anonymous');
              return (
                <View key={vol.id} className="px-2.5 py-1 rounded-full bg-neutral-surface border border-neutral-border">
                  <Text className="text-neutral-textMain" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                    {name}
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
          className={`min-h-[48px] rounded-xl flex-row items-center justify-center px-4 mb-2 ${
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

      <View className="flex-row flex-wrap gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="flex-1 min-w-[140px] min-h-[48px] bg-primary-tint rounded-xl flex-row items-center justify-center px-3"
        >
          <MessageCircle size={16} color="#1E5E45" />
          <Text className="text-primary-dark ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
            {t('post.coordinate', { n: post.commentsCount })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleDiffuse}
          className="min-h-[48px] px-3.5 bg-neutral-mutedBg rounded-xl flex-row items-center justify-center"
        >
          <Share2 size={16} color="#1A1D20" />
          <Text className="text-neutral-textMain ml-1.5" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>
            {t('post.diffuse')}
          </Text>
        </TouchableOpacity>
        {canResolve && !isResolved && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onMarkResolved(post)}
            className="min-h-[48px] px-3.5 bg-neutral-surface border border-primary rounded-xl flex-row items-center justify-center"
          >
            <CheckCircle2 size={16} color="#1E5E45" />
            <Text className="text-primary-dark ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
              {t('post.markResolved')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

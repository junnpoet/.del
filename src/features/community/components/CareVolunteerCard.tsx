import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckCircle2, Clock, HeartHandshake, MessageCircle, Mic, Smartphone } from 'lucide-react-native';
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

/** Tarjeta abierta de Cuidado Vecinal / Yanapay alineada con el estilo visual del directorio. */
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
  const authorName = post.authorName ?? t('post.anonymous');
  const typeBg = '#FEF3C7';
  const typeColor = '#D97706';

  return (
    <Card className={`mb-3 ${isResolved ? 'opacity-80' : ''}`}>
      {/* Fila superior: píldora de tipo + estado y tiempo */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: typeBg }}
        >
          <HeartHandshake size={14} color={typeColor} />
          <Text
            className="ml-1.5"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: typeColor }}
          >
            {t('yanapay.badge')}
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
          style={{ backgroundColor: typeBg }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 18,
              color: typeColor,
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
            {authorName} · {t('yanapay.companions', { n: post.volunteers.length })}
          </Text>
        </View>
      </View>

      <Text
        className="mt-2.5 text-neutral-textMuted"
        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
      >
        {post.description}
      </Text>

      {(post.isFromWhatsapp || post.isAiVoice) && (
        <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
          {post.isFromWhatsapp && (
            <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#E7F6EC]">
              <Smartphone size={12} color="#075E54" />
              <Text className="ml-1 text-[#075E54]" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}>
                {t('post.whatsappBadge')}
              </Text>
            </View>
          )}
          {post.isAiVoice && (
            <View className="flex-row items-center px-2.5 py-1 rounded-full bg-primary-tint">
              <Mic size={12} color="#1E5E45" />
              <Text className="ml-1 text-primary-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}>
                {t('post.aiVoiceBadge')}
              </Text>
            </View>
          )}
        </View>
      )}

      {!isResolved && (
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busyVolunteer}
          onPress={() => onToggleVolunteer(post, isJoined)}
          className={`min-h-[48px] rounded-2xl flex-row items-center justify-center px-4 mt-3 ${
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

      <View className="mt-2.5 flex-row items-center gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="flex-1 min-h-[48px] bg-neutral-mutedBg border border-neutral-border rounded-2xl flex-row items-center justify-center px-3"
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
            onPress={() => onMarkResolved(post)}
            className="min-h-[48px] px-3.5 bg-neutral-surface border border-primary rounded-2xl flex-row items-center justify-center"
          >
            <CheckCircle2 size={16} color="#1E5E45" />
            <Text
              numberOfLines={1}
              className="text-primary-dark ml-1.5"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              {t('post.markResolved')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

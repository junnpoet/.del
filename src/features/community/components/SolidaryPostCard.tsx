import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  CheckCircle2,
  Clock,
  Gift,
  LifeBuoy,
  MessageCircle,
  Mic,
  Pencil,
  Repeat,
  Smartphone,
  Users,
} from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import type { PostType } from '../../../types';
import { POST_STATUS_META, POST_TYPE_META, postStatusKey, postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { timeAgo } from '../utils';

interface Props {
  post: SolidaryPost;
  canResolve: boolean;
  onCoordinate: (post: SolidaryPost) => void;
  onMarkResolved: (post: SolidaryPost) => void;
  onEdit?: (post: SolidaryPost) => void;
}

const POST_TYPE_ICONS: Record<PostType, typeof LifeBuoy> = {
  AYUDA: LifeBuoy,
  PRESTAMO: Repeat,
  DONACION: Gift,
  TRUEQUE: Repeat,
  VOLUNTARIADO: Users,
};

/** Tarjeta de publicación solidaria alineada con el estilo visual del directorio. */
export function SolidaryPostCard({ post, canResolve, onCoordinate, onMarkResolved, onEdit }: Props) {
  const { t, tCategory } = useI18n();
  const name = post.authorName ?? t('post.anonymous');
  const category = tCategory(post.category);
  const statusMeta = POST_STATUS_META[post.status];
  const typeMeta = POST_TYPE_META[post.postType];
  const TypeIcon = POST_TYPE_ICONS[post.postType];
  const isResolved = post.status === 'RESOLVED';

  return (
    <Card className={`mb-3 ${isResolved ? 'opacity-80' : ''}`}>
      {/* Fila superior: píldora de tipo + estado y tiempo */}
      <View className="mb-2.5 flex-row items-center justify-between">
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: typeMeta.bg }}
        >
          <TypeIcon size={14} color={typeMeta.color} />
          <Text
            className="ml-1.5"
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 12,
              color: typeMeta.color,
            }}
          >
            {t(postTypeKey(post.postType))}
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
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            {category}
          </Text>
          <Text
            className="mt-0.5 text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {t('post.by', { name })}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      <Text
        className="mt-2.5 text-neutral-textMuted"
        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19 }}
      >
        {post.description}
      </Text>

      {/* Badges contextuales (urgencia, WhatsApp, Voz IA) */}
      {(post.urgency === 'ALTA_CRITICA' || post.isFromWhatsapp || post.isAiVoice) && (
        <View className="mt-2.5 flex-row flex-wrap items-center gap-1.5">
          {post.urgency === 'ALTA_CRITICA' && (
            <View className="px-2.5 py-1 rounded-full bg-emergency-alert">
              <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}>
                {t('post.urgent')}
              </Text>
            </View>
          )}
          {post.isFromWhatsapp && (
            <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#DCF8C6]">
              <Smartphone size={12} color="#075E54" />
              <Text className="ml-1 text-[#075E54]" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}>
                {t('post.whatsappBadge')}
              </Text>
            </View>
          )}
          {post.isAiVoice && (
            <View className="flex-row items-center px-2.5 py-1 rounded-full bg-sun-tint">
              <Mic size={12} color="#B45309" />
              <Text className="ml-1 text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11.5 }}>
                {t('post.aiVoiceBadge')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Acciones en una sola línea */}
      <View className="mt-4 flex-row items-center gap-2">
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onCoordinate(post)}
          className="h-12 flex-1 flex-row items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4"
        >
          <MessageCircle size={18} color="#065F46" />
          <Text
            numberOfLines={1}
            className="ml-2 text-[#065F46]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13.5 }}
          >
            {post.postType === 'PRESTAMO'
              ? `Solicitar préstamo (${post.commentsCount})`
              : t('post.coordinate', { n: post.commentsCount })}
          </Text>
        </TouchableOpacity>

        {onEdit && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edición"
            onPress={() => onEdit(post)}
            className="h-12 flex-row items-center justify-center rounded-2xl border border-neutral-border bg-neutral-mutedBg px-3.5"
          >
            <Pencil size={16} color="#1A1D20" />
            <Text
              numberOfLines={1}
              className="ml-1.5 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              Edición
            </Text>
          </TouchableOpacity>
        )}

        {canResolve && !isResolved && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('post.markResolved')}
            onPress={() => onMarkResolved(post)}
            className="w-12 h-12 items-center justify-center rounded-2xl border border-primary bg-neutral-surface"
          >
            <CheckCircle2 size={20} color="#1E5E45" />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

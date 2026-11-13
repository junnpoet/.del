import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, MessageCircle, Mic, Send, Smartphone, X } from 'lucide-react-native';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, postStatusKey, postTypeKey } from '../constants';
import { useSolidaryComments } from '../hooks/useSolidaryComments';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { errorMessage, openWhatsapp, showMessage, timeAgo } from '../utils';

interface Props {
  post: SolidaryPost | null;
  currentUserId: string | null;
  onClose: () => void;
}

/** Panel inferior de coordinación en tiempo real para un pedido solidario (SPEC-04 §2.3). */
export function SolidaryActionSheet({ post, currentUserId, onClose }: Props) {
  const { t, tCategory } = useI18n();
  const [draft, setDraft] = useState('');
  const { comments, addComment, acceptSupport } = useSolidaryComments(post?.id ?? null);

  if (!post) return null;

  const isAuthor = Boolean(currentUserId && post.authorId === currentUserId);
  const statusMeta = POST_STATUS_META[post.status];
  const items = comments.data ?? [];

  const handleSend = () => {
    const clean = draft.trim();
    if (!clean) return;
    addComment.mutate(clean, {
      onSuccess: () => setDraft(''),
      onError: (err) => showMessage(t('sheet.sendFailed'), errorMessage(err)),
    });
  };

  const handleAccept = (commentId: string, helperId: string | null | undefined) => {
    acceptSupport.mutate(
      { commentId, helperId },
      {
        onError: (err) => showMessage(t('sheet.acceptFailed'), errorMessage(err)),
      }
    );
  };

  return (
    <Modal visible={Boolean(post)} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-black/45 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="bg-neutral-background rounded-t-3xl max-h-[88%] px-4 pt-5 pb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text
                className="text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
              >
                {t('sheet.title')}
              </Text>
              <Text
                className="text-neutral-textMuted mt-0.5"
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
              >
                {t(postTypeKey(post.postType))} · {tCategory(post.category)}
              </Text>
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

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="bg-neutral-surface border border-neutral-border rounded-2xl p-3.5 mb-3">
              <View className="flex-row flex-wrap items-center gap-1.5 mb-2">
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
                  <View className="flex-row items-center px-2.5 py-1 rounded-lg bg-sun-tint">
                    <Mic size={13} color="#B45309" />
                    <Text className="ml-1 text-sun-dark" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}>
                      {t('post.aiVoiceBadge')}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className="text-neutral-textMain leading-5"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
              >
                {post.description}
              </Text>

              {post.isFromWhatsapp && post.contactPhone && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() =>
                    openWhatsapp(
                      post.contactPhone,
                      t('post.greeting', {
                        name: post.authorName ?? t('post.anonymous'),
                        category: tCategory(post.category),
                      })
                    )
                  }
                  className="mt-3 min-h-[48px] bg-[#075E54] rounded-xl flex-row items-center justify-center px-4"
                >
                  <MessageCircle size={18} color="#FFFFFF" />
                  <Text className="text-white ml-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>
                    {t('sheet.replyWhatsapp')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text
              className="text-neutral-textMain mb-2"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('sheet.commentsTitle', { n: items.length })}
            </Text>

            {comments.isLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#1E5E45" />
              </View>
            ) : items.length === 0 ? (
              <View className="bg-neutral-surface border border-neutral-border rounded-2xl p-4 mb-3">
                <Text
                  className="text-neutral-textMuted text-center"
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
                >
                  {t('sheet.commentsEmpty')}
                </Text>
              </View>
            ) : (
              items.map((comment) => {
                const canAccept =
                  isAuthor &&
                  post.status !== 'RESOLVED' &&
                  !comment.isAccepted &&
                  comment.authorId !== currentUserId;
                return (
                  <View
                    key={comment.id}
                    className={`rounded-2xl p-3.5 mb-2.5 border ${
                      comment.isAccepted
                        ? 'bg-primary-tint border-primary'
                        : 'bg-neutral-surface border-neutral-border'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text
                        className="text-neutral-textMain"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
                      >
                        {comment.authorName ?? t('post.anonymous')}
                      </Text>
                      <Text
                        className="text-neutral-textMuted"
                        style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 }}
                      >
                        {timeAgo(comment.createdAt)}
                      </Text>
                    </View>
                    <Text
                      className="text-neutral-textMain leading-5"
                      style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 }}
                    >
                      {comment.content}
                    </Text>

                    {comment.isAccepted && (
                      <View className="flex-row items-center mt-2">
                        <CheckCircle2 size={15} color="#1E5E45" />
                        <Text
                          className="text-primary-dark ml-1.5"
                          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                        >
                          {t('sheet.supportAccepted')}
                        </Text>
                      </View>
                    )}

                    {canAccept && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        disabled={acceptSupport.isPending}
                        onPress={() => handleAccept(comment.id, comment.authorId)}
                        className="mt-2.5 min-h-[48px] bg-primary rounded-xl flex-row items-center justify-center px-3"
                      >
                        <CheckCircle2 size={16} color="#FFFFFF" />
                        <Text className="text-white ml-1.5" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}>
                          {t('sheet.acceptSupport')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          {post.status !== 'RESOLVED' && (
            <View className="flex-row items-center gap-2 pt-3 border-t border-neutral-border/70">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={t('sheet.placeholder')}
                placeholderTextColor="#9EA3AE"
                className="flex-1 min-h-[48px] bg-neutral-surface border border-neutral-border rounded-xl px-3.5 text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('sheet.send')}
                disabled={addComment.isPending || !draft.trim()}
                onPress={handleSend}
                className="min-w-[48px] min-h-[48px] px-4 bg-primary rounded-xl flex-row items-center justify-center"
              >
                {addComment.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

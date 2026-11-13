import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, MessageCircle, Mic, Send, Smartphone, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../i18n';
import { POST_STATUS_META, postStatusKey, postTypeKey } from '../constants';
import { useSolidaryComments } from '../hooks/useSolidaryComments';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { errorMessage, openWhatsapp, showMessage, timeAgo } from '../utils';

interface Props {
  post: SolidaryPost | null;
  currentUserId: string | null;
  pointPosts?: SolidaryPost[];
  showBackdrop?: boolean;
  onSelectPointPost?: (post: SolidaryPost) => void;
  onClose: () => void;
}

/** Panel inferior de coordinación en tiempo real para un pedido solidario (SPEC-04 §2.3). */
export function SolidaryActionSheet({
  post,
  currentUserId,
  pointPosts = [],
  showBackdrop = false,
  onSelectPointPost,
  onClose,
}: Props) {
  const { t, tCategory } = useI18n();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(480)).current;
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const { comments, addComment, acceptSupport } = useSolidaryComments(post?.id ?? null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (post) {
      sheetTranslateY.setValue(480);
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: showBackdrop ? 1 : 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(480);
    }
  }, [post, showBackdrop, backdropOpacity, sheetTranslateY]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 480,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

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

  const windowHeight = Dimensions.get('window').height;
  const isKeyboardOpen = keyboardHeight > 0;
  const maxSheetHeight = isKeyboardOpen
    ? Math.max(220, windowHeight - keyboardHeight - insets.top - 28)
    : Math.round(windowHeight * 0.84);
  const commentsMaxHeight = isKeyboardOpen
    ? Math.max(72, maxSheetHeight - 260)
    : Math.min(250, Math.round(windowHeight * 0.32));
  const androidKeyboardLift =
    Platform.OS === 'android' && isKeyboardOpen ? keyboardHeight + 12 : 0;

  return (
    <Modal visible={Boolean(post)} animationType="none" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        {showBackdrop && (
          <Animated.View
            style={{ opacity: backdropOpacity }}
            className="absolute inset-0 bg-black/45"
            pointerEvents="none"
          />
        )}
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable className="flex-1" onPress={handleClose} />
          <Animated.View
            className="bg-neutral-background rounded-t-3xl px-4 pt-4 border-t border-neutral-border shadow-2xl"
            style={{
              maxHeight: maxSheetHeight,
              overflow: 'hidden',
              marginBottom: androidKeyboardLift,
              paddingBottom: isKeyboardOpen ? 10 : Math.max(insets.bottom + 14, 24),
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text
                className="text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
              >
                {post.postType === 'PRESTAMO' ? 'Solicitar préstamo' : t('sheet.title')}
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
              onPress={handleClose}
              className="min-w-[48px] min-h-[48px] rounded-2xl bg-neutral-surface border border-neutral-border items-center justify-center"
            >
              <X size={20} color="#1A1D20" />
            </TouchableOpacity>
          </View>

          {!isKeyboardOpen && pointPosts.length > 1 && onSelectPointPost && (
            <View className="mb-2.5">
              <Text
                className="text-neutral-textMuted mb-1.5"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
              >
                Publicaciones en este hogar ({pointPosts.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {pointPosts.map((item) => {
                  const active = item.id === post.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => onSelectPointPost(item)}
                      className={`rounded-xl border px-3 py-2 ${
                        active
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-neutral-border bg-neutral-surface'
                      }`}
                    >
                      <Text
                        numberOfLines={1}
                        className={active ? 'text-[#065F46]' : 'text-neutral-textMain'}
                        style={{
                          fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                          fontSize: 12.5,
                        }}
                      >
                        {t(postTypeKey(item.postType))} · {tCategory(item.category)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View
            className={`bg-neutral-surface border border-neutral-border rounded-2xl ${
              isKeyboardOpen ? 'p-2.5 mb-2' : 'p-3 mb-2.5'
            }`}
          >
            <View className="flex-row flex-wrap items-center gap-1.5 mb-1.5">
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
              numberOfLines={isKeyboardOpen ? 1 : undefined}
              className="text-neutral-textMain leading-5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13.5 }}
            >
              {post.description}
            </Text>

            {post.isFromWhatsapp && post.contactPhone && !isKeyboardOpen && (
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
                className="mt-2.5 min-h-[44px] bg-[#075E54] rounded-xl flex-row items-center justify-center px-4"
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
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14.5 }}
          >
            {t('sheet.commentsTitle', { n: items.length })}
          </Text>

          <ScrollView
            ref={scrollRef}
            style={{ flexShrink: 1, maxHeight: commentsMaxHeight }}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >

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
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

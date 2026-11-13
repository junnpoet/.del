import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Flag,
  Send,
  ShieldCheck,
  Star,
} from 'lucide-react-native';
import {
  useServiceChat,
  ChatMessage,
  ServiceReview,
} from '../hooks/useServiceChat';
import { ReportModal } from '../components/ReportModal';
import { usePublicI18n } from '../i18n';

function formatMessageTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ReviewRequestCardProps {
  providerName: string;
  isClient: boolean;
  isProvider: boolean;
  existingReview: ServiceReview | null;
  onSubmitReview: (rating: number, comment?: string) => Promise<void>;
  isSubmitting: boolean;
}

function ReviewRequestCard({
  providerName,
  isClient,
  isProvider,
  existingReview,
  onSubmitReview,
  isSubmitting,
}: ReviewRequestCardProps) {
  const { tp } = usePublicI18n();
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  if (existingReview) {
    return (
      <View className="my-2 rounded-3xl border border-[#1E5E45]/20 bg-[#EDF5F1] p-4 shadow-sm">
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-[#1E5E45]">
            <Check size={18} color="#FFFFFF" />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="text-[#1E5E45]"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {tp('chat.reviewDoneTitle')}
            </Text>
            <View className="mt-0.5 flex-row items-center">
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text
                className="ml-1 text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
              >
                {tp('chat.reviewDoneBody', { rating: existingReview.rating ?? 5 })}
              </Text>
            </View>
          </View>
        </View>
        {existingReview.comment ? (
          <Text
            className="mt-2.5 rounded-xl bg-white/70 p-2.5 text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            {`"${existingReview.comment}"`}
          </Text>
        ) : null}
      </View>
    );
  }

  if (isProvider) {
    return (
      <View className="my-2 rounded-3xl border border-[#D97706]/20 bg-[#FEF3C7] p-4">
        <View className="flex-row items-center">
          <ShieldCheck size={20} color="#D97706" />
          <Text
            className="ml-2 text-[#92400E]"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
          >
            {tp('chat.reviewPendingTitle')}
          </Text>
        </View>
        <Text
          className="mt-1 text-[#92400E]"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, lineHeight: 18 }}
        >
          {tp('chat.reviewPendingBody')}
        </Text>
      </View>
    );
  }

  if (isClient) {
    return (
      <View className="my-3 rounded-3xl border-2 border-primary/30 bg-neutral-surface p-4 shadow-md">
        <View className="flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck size={20} color="#1E5E45" />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="text-primary"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
            >
              {tp('chat.reviewCardTitle')}
            </Text>
            <Text
              className="text-neutral-textMuted"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
            >
              {tp('chat.reviewCardQuestion', { name: providerName })}
            </Text>
          </View>
        </View>

        <Text
          className="mt-3 text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
        >
          {tp('chat.reviewSelectRating')}
        </Text>

        <View className="mt-2 flex-row items-center justify-center gap-2 py-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= selectedRating;
            return (
              <TouchableOpacity
                key={star}
                accessibilityRole="button"
                accessibilityLabel={tp('chat.reviewStarA11y', { n: star })}
                onPress={() => setSelectedRating(star)}
                className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
              >
                <Star
                  size={24}
                  color={isFilled ? '#EAB308' : '#9EA3AE'}
                  fill={isFilled ? '#EAB308' : 'none'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          accessibilityLabel={tp('chat.reviewCommentPlaceholder')}
          placeholder={tp('chat.reviewCommentPlaceholder')}
          placeholderTextColor="#9EA3AE"
          value={comment}
          onChangeText={setComment}
          className="mt-3 min-h-[48px] rounded-2xl border border-neutral-border bg-neutral-mutedBg/30 px-3 py-2.5 text-neutral-textMain"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={tp('chat.reviewSubmitA11y')}
          disabled={isSubmitting}
          onPress={() => onSubmitReview(selectedRating, comment)}
          className="mt-3 min-h-[48px] flex-row items-center justify-center rounded-2xl bg-primary px-4 shadow-sm active:opacity-90"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <CheckCircle size={18} color="#FFFFFF" />
              <Text
                className="ml-2 text-white"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
              >
                {tp('chat.reviewSubmitBtn', { rating: selectedRating })}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

export function ServiceChatScreen({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tp } = usePublicI18n();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const {
    conversation,
    messages,
    existingReview,
    isLoading,
    isProvider,
    isClient,
    currentUserId,
    sendMessage,
    requestReview,
    submitReview,
    isSending,
    isSubmittingReview,
  } = useServiceChat(conversationId);

  const providerName = conversation?.provider?.full_name ?? tp('chat.defaultProvider');
  const serviceTitle = conversation?.service?.title ?? tp('chat.defaultService');
  const counterpartName = isProvider
    ? conversation?.client?.full_name ?? tp('chat.defaultClient')
    : providerName;

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-background">
        <ActivityIndicator size="large" color="#1E5E45" />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-neutral-background"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      {/* Header */}
      <View className="flex-row items-center border-b border-neutral-border/70 bg-neutral-surface px-4 py-3">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={tp('chat.backA11y')}
          onPress={() => router.back()}
          className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
        >
          <ArrowLeft size={20} color="#1A1D20" />
        </TouchableOpacity>

        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <Text
            className="text-primary"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
          >
            {counterpartName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-neutral-textMain"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
          >
            {counterpartName}
          </Text>
          <Text
            numberOfLines={1}
            className="text-neutral-textMuted"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
          >
            {serviceTitle}
          </Text>
        </View>

        {/* Report Button */}
        {conversation?.service_id && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={tp('chat.reportA11y')}
            onPress={() => setReportModalVisible(true)}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-mutedBg"
          >
            <Flag size={18} color="#D90429" />
          </TouchableOpacity>
        )}
      </View>

      {/* Provider Action Bar: Request Visto Bueno Button */}
      {isProvider && !existingReview && (
        <View className="border-b border-neutral-border/40 bg-[#EDF5F1] px-4 py-2.5">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={tp('chat.requestReviewA11y')}
            onPress={requestReview}
            disabled={isSending}
            className="min-h-[48px] flex-row items-center justify-center rounded-xl bg-primary px-4 shadow-xs"
          >
            <ShieldCheck size={18} color="#FFFFFF" />
            <Text
              className="ml-2 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
            >
              {tp('chat.requestReviewBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }: { item: ChatMessage }) => {
            const isMe = item.sender_id === currentUserId;

            if (item.is_review_request) {
              return (
                <ReviewRequestCard
                  providerName={providerName}
                  isClient={isClient}
                  isProvider={isProvider}
                  existingReview={existingReview}
                  onSubmitReview={submitReview}
                  isSubmitting={isSubmittingReview}
                />
              );
            }

            return (
              <View
                className={`mb-3 max-w-[82%] rounded-3xl px-4 py-2.5 ${
                  isMe
                    ? 'self-end rounded-br-sm bg-primary'
                    : 'self-start rounded-bl-sm border border-neutral-border/60 bg-neutral-surface'
                }`}
              >
                <Text
                  className={isMe ? 'text-white' : 'text-neutral-textMain'}
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 20 }}
                >
                  {item.content}
                </Text>
                <Text
                  className={`mt-1 text-right ${
                    isMe ? 'text-white/80' : 'text-neutral-textLight'
                  }`}
                  style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12 }}
                >
                  {formatMessageTime(item.created_at)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-16">
              <View className="h-14 w-14 items-center justify-center rounded-3xl bg-primary/10">
                <ShieldCheck size={28} color="#1E5E45" />
              </View>
              <Text
                className="mt-3 text-center text-neutral-textMain"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}
              >
                {tp('chat.emptyTitle')}
              </Text>
              <Text
                className="mt-1 text-center text-neutral-textMuted"
                style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 19 }}
              >
                {tp('chat.emptyBody')}
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View
          className="border-t border-neutral-border/60 bg-neutral-surface px-4 py-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-center rounded-2xl bg-neutral-mutedBg pl-3 pr-1.5 py-1">
            <TextInput
              accessibilityLabel={tp('chat.inputA11y')}
              value={inputText}
              onChangeText={setInputText}
              placeholder={tp('chat.inputPlaceholder')}
              placeholderTextColor="#9EA3AE"
              className="min-h-[48px] flex-1 py-2 text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14 }}
              multiline
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tp('chat.sendA11y')}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              className={`h-12 w-12 items-center justify-center rounded-xl ${
                inputText.trim() ? 'bg-primary' : 'bg-neutral-border/50'
              }`}
            >
              <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#9EA3AE'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Report Modal */}
      {conversation?.service_id && (
        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          serviceId={conversation.service_id}
          providerName={providerName}
          serviceTitle={serviceTitle}
        />
      )}
    </View>
  );
}
export default ServiceChatScreen;

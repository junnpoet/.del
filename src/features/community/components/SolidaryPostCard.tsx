import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, HandHeart, MessageCircle, Smartphone } from 'lucide-react-native';
import { Card } from '../../../components/ui/Card';
import { useI18n } from '../../../i18n';
import { postTypeKey } from '../constants';
import type { SolidaryPost } from '../hooks/useSolidaryFeed';
import { callPhone, confirmAction, openWhatsapp, timeAgo } from '../utils';

interface Props {
  post: SolidaryPost;
  isOwnPost: boolean;
}

/** Tarjeta de publicación solidaria (SPEC-04 §2.1). */
export function SolidaryPostCard({ post, isOwnPost }: Props) {
  const { t, tCategory } = useI18n();
  const isHelp = post.postType === 'AYUDA';
  const name = post.authorName ?? t('post.anonymous');
  const category = tCategory(post.category);
  const greeting = t('post.greeting', { name, category });

  const handleOfferHelp = async () => {
    const viaWhatsapp = await confirmAction(
      t('help.offer'),
      t('post.howContact', { name }),
      t('post.viaWhatsapp')
    );
    if (viaWhatsapp) {
      await openWhatsapp(post.contactPhone, greeting);
    } else if (post.contactPhone) {
      const call = await confirmAction(t('common.call'), t('post.callQuestion', { name }), t('common.call'));
      if (call) await callPhone(post.contactPhone);
    }
  };

  return (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 flex-wrap">
          <View className={`px-2.5 py-1 rounded-xl mr-2 ${isHelp ? 'bg-emergency-tint' : 'bg-neutral-mutedBg'}`}>
            <Text
              className={isHelp ? 'text-emergency-alert' : 'text-neutral-textMain'}
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              {t(postTypeKey(post.postType))}
            </Text>
          </View>
          {post.urgency === 'ALTA_CRITICA' && (
            <View className="px-2 py-0.5 rounded-lg bg-emergency-alert mr-2">
              <Text className="text-white" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}>
                {t('post.urgent')}
              </Text>
            </View>
          )}
          {post.isFromWhatsapp && (
            <View className="flex-row items-center px-2 py-0.5 rounded-lg bg-[#DCF8C6]">
              <Smartphone size={12} color="#128C7E" />
              <Text className="ml-1 text-[#075E54]" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}>
                {t('post.fromWhatsapp')}
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

      {!isOwnPost && (
        <View className="pt-2.5 border-t border-neutral-border/50">
          {post.isFromWhatsapp ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('post.whatsappA11y', { name })}
              onPress={() => openWhatsapp(post.contactPhone, greeting)}
              className="min-h-[44px] px-4 bg-[#25D366] rounded-xl flex-row items-center justify-center"
            >
              <MessageCircle size={17} color="#FFFFFF" />
              <Text className="text-white ml-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>
                🟢 {t('help.whatsapp')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('post.offerA11y', { name })}
              onPress={handleOfferHelp}
              className="min-h-[44px] px-4 bg-primary rounded-xl flex-row items-center justify-center"
            >
              <HandHeart size={17} color="#FFFFFF" />
              <Text className="text-white ml-2" style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>
                {t('help.offer')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

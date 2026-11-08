import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  HeartPulse,
  MapPin,
  ChevronLeft,
  PhoneCall,
} from 'lucide-react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { useI18n } from '../src/i18n';

export default function EmergencyBoardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [sosActive, setSosActive] = useState(false);

  const handleTriggerSOS = () => {
    Alert.alert(
      t('emergency.sosConfirmTitle'),
      t('emergency.sosConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('emergency.sosConfirmAction'),
          style: 'destructive',
          onPress: () => {
            setSosActive(true);
            Alert.alert(t('emergency.sosSentTitle'), t('emergency.sosSentBody'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-emergency-background">
      {/* Top Banner */}
      <View className="px-5 pt-3 pb-4 bg-emergency-background border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.backA11y')}
            onPress={() => router.back()}
            className="flex-row items-center min-h-[40px] px-3 py-1.5 bg-white/10 rounded-xl"
          >
            <ChevronLeft size={18} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              className="text-white ml-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {t('emergency.backNormal')}
            </Text>
          </TouchableOpacity>

          <View className="bg-emergency-alert/20 px-3 py-1 rounded-full">
            <Text
              className="text-emergency-alert uppercase"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 }}
            >
              {t('emergency.badge')}
            </Text>
          </View>
        </View>

        <Text
          className="text-white mt-3"
          style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22 }}
        >
          {t('emergency.title')}
        </Text>
        <Text
          className="text-emergency-warning mt-0.5"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          {t('emergency.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-20">
        {/* SOS Central Button */}
        <View className="items-center my-4">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.sosA11y')}
            onPress={handleTriggerSOS}
            activeOpacity={0.85}
            className={`w-32 h-32 rounded-full items-center justify-center shadow-xl ${
              sosActive
                ? 'bg-emergency-warning'
                : 'bg-emergency-alert shadow-emergency-alert/30'
            }`}
          >
            <AlertTriangle size={36} color="#FFFFFF" strokeWidth={2.2} />
            <Text
              className="text-white mt-1 tracking-wider text-center"
              style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 }}
            >
              {sosActive ? t('emergency.sent') : t('sos.button')}
            </Text>
          </TouchableOpacity>
          <Text
            className="text-white/60 text-center mt-3 px-4 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.sosHint')}
          </Text>
        </View>

        {/* Safe Zones & First Aid */}
        <Text
          className="text-white uppercase tracking-wider mb-2.5 mt-2 px-1"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
        >
          {t('emergency.safeTitle')}
        </Text>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <MapPin size={18} color="#16A34A" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.zone')}
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.zoneBody')}
          </Text>
        </Card>

        <Card variant="emergency" className="mb-3 p-4">
          <View className="flex-row items-center mb-1">
            <HeartPulse size={18} color="#EF4444" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.kit')}
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('emergency.kitBody')}
          </Text>
        </Card>

        <Card variant="emergency" className="mb-4 p-4">
          <View className="flex-row items-center mb-1">
            <PhoneCall size={18} color="#F59E0B" strokeWidth={2.2} />
            <Text
              className="text-white ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('emergency.phones')}
            </Text>
          </View>
          <Text
            className="text-white/60 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {t('emergency.phonesBody')}
          </Text>
        </Card>

        <Button
          title={t('emergency.backButton')}
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

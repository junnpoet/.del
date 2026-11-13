import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Home,
  MapPin,
  Bookmark,
  Eye,
  LogOut,
  ChevronRight,
  Shield,
  Users,
  CheckCircle,
  Wrench,
  Heart,
  ShieldCheck,
  FileText,
} from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Header } from '../../src/components/ui/Header';
import { useDemo, type MembershipStatus } from '../../src/services/demoStore';
import { useFavorites } from '../../src/features/public/hooks/useFavorites';
import { useMembership } from '../../src/features/community/hooks/useMembership';
import { useAuth } from '../../src/services/auth';
import { LanguageToggle } from '../../src/i18n/LanguageToggle';
import { useI18n } from '../../src/i18n';
import {
  isAccessibleModeEnabled,
  setAccessibleModeEnabled,
} from '../../src/features/accessible-mode/storage';
import { PublicEmergencyInfoModal } from '../../src/features/emergency/components/PublicEmergencyInfoModal';
import { useZoneEmergency } from '../../src/features/emergency/hooks/useEmergencyRealtime';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser } = useDemo();
  const { favorites } = useFavorites();
  const { signOut, profile } = useAuth();
  const { t } = useI18n();
  const membership = useMembership();
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [emergencyInfoOpen, setEmergencyInfoOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { zoneEmergency } = useZoneEmergency();
  const isLeader = profile?.role === 'dirigente';
  const isPadrino = profile?.role === 'padrino';

  // Con sesión se muestran los datos reales de Supabase; sin sesión, la persona demo.
  const displayName = profile?.full_name ?? currentUser.name;
  const displayAddress = profile?.home_address ?? currentUser.homeAddress;
  const avatarUrl = profile
    ? ((profile as { avatar_url?: string | null }).avatar_url ?? null)
    : (currentUser.avatarUrl ?? null);
  const role = (profile ? profile.role ?? 'vecino' : currentUser.role) as 'vecino' | 'dirigente' | 'padrino';
  const isVulnerable = profile ? Boolean(profile.is_vulnerable) : currentUser.isVulnerable;
  const membershipStatus: MembershipStatus = !profile
    ? currentUser.membershipStatus
    : isLeader
    ? 'DIRIGENTE'
    : membership.state === 'MIEMBRO'
    ? 'MIEMBRO'
    : membership.state === 'PENDIENTE'
    ? 'PENDIENTE'
    : 'NO_SOLICITADO';
  const avatarIcon = !profile
    ? currentUser.avatarIcon
    : isVulnerable
    ? 'heart'
    : isLeader
    ? 'shield'
    : 'user';

  useEffect(() => {
    isAccessibleModeEnabled().then(setAccessibleMode);
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  // SPEC-04 §2.4: al activar el Modo Accesible la app cambia a la vista simple.
  const toggleAccessibleMode = async (value: boolean) => {
    setAccessibleMode(value);
    await setAccessibleModeEnabled(value);
    if (value) router.replace('/accessible');
  };

  const handleLogout = async () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logoutAction'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          await AsyncStorage.removeItem('user_session');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const getPersonaIcon = (avatar: string, color: string) => {
    switch (avatar) {
      case 'wrench':
        return <Wrench size={22} color={color} strokeWidth={2.2} />;
      case 'heart':
        return <Heart size={22} color={color} strokeWidth={2.2} />;
      case 'shield':
        return <ShieldCheck size={22} color={color} strokeWidth={2.2} />;
      default:
        return <User size={22} color={color} strokeWidth={2.2} />;
    }
  };

  return (
    <View className={`flex-1 ${zoneEmergency ? 'bg-[#FFF7F7]' : 'bg-neutral-background'}`} collapsable={false}>
      <Header title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 112 }}>
        {/* Active User Card */}
        <Card className="p-4 mb-3 flex-row items-center shadow-sm">
          <View className="w-14 h-14 rounded-full bg-neutral-mutedBg items-center justify-center mr-3.5 overflow-hidden">
            {avatarUrl && !avatarError ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-14 h-14 rounded-full"
                resizeMode="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              getPersonaIcon(avatarIcon, '#1E5E45')
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-neutral-textMain"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18 }}
            >
              {displayName}
            </Text>
            <Text
              className="text-neutral-textMuted mt-0.5"
              style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
            >
              {isVulnerable ? t('role.vulnerable') : t(`role.${role}`)}
            </Text>
            <View className="mt-1.5 bg-neutral-mutedBg self-start px-2.5 py-0.5 rounded-md flex-row items-center">
              <Text
                className="text-neutral-textMuted uppercase"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11 }}
              >
                {t('profile.membership', {
                  status: t(`membership.${membershipStatus}`),
                })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Registered Home Address */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center mb-1.5">
            <Home size={18} color="#1E5E45" strokeWidth={2.2} />
            <Text
              className="text-neutral-textMain ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
            >
              {t('profile.home')}
            </Text>
          </View>
          <Text
            className="text-neutral-textMuted mb-2.5 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
          >
            {t('profile.homeBody')}
          </Text>
          <View className="bg-neutral-mutedBg p-3 rounded-xl flex-row items-center">
            <MapPin size={18} color="#6C727A" strokeWidth={2} />
            <Text
              className="text-neutral-textMain ml-2 flex-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {displayAddress}
            </Text>
          </View>
        </Card>

        {/* Accessibility Toggle */}
        <Card className="p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <Eye size={18} color="#1E5E45" strokeWidth={2.2} />
                <Text
                  className="text-neutral-textMain ml-2 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
                >
                  {t('profile.accessible')}
                </Text>
              </View>
              <Text
                className="text-neutral-textMuted leading-5"
                style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
              >
                {t('profile.accessibleBody')}
              </Text>
            </View>
            <Switch
              value={accessibleMode}
              onValueChange={toggleAccessibleMode}
              trackColor={{ false: '#E9ECEF', true: '#348B68' }}
              thumbColor={accessibleMode ? '#1E5E45' : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Idioma Español / Quechua (SPEC-04 §2.6) */}
        <Card className="p-4 mb-3">
          <LanguageToggle />
        </Card>

        {/* Accesos de la Capa Privada según rol (SPEC-04 §2.3 y §2.5) */}
        {(isLeader || isPadrino) && (
          <Card className="p-2 mb-3">
            {isLeader && (
              <TouchableOpacity
                className="flex-row items-center justify-between p-3.5 border-b border-neutral-border/50 min-h-[48px]"
                onPress={() => router.push('/leader-dashboard')}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <ShieldCheck size={18} color="#1E5E45" strokeWidth={2} />
                  <Text
                    className="text-neutral-textMain ml-3 flex-1"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                  >
                    {t('leader.title')}
                  </Text>
                </View>
                <ChevronRight size={18} color="#9EA3AE" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-row items-center justify-between p-3.5 min-h-[48px]"
              onPress={() => router.push('/care-network')}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Heart size={18} color="#1E5E45" strokeWidth={2} />
                <Text
                  className="text-neutral-textMain ml-3 flex-1"
                  style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
                >
                  {t('care.title')}
                </Text>
              </View>
              <ChevronRight size={18} color="#9EA3AE" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Quick links */}
        <Card className="p-2 mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3.5 border-b border-neutral-border/50 min-h-[48px]"
            onPress={() => router.push('/my-publications')}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <FileText size={18} color="#1E5E45" strokeWidth={2} />
              <Text
                className="text-neutral-textMain ml-3 flex-1"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                Mis publicaciones
              </Text>
            </View>
            <ChevronRight size={18} color="#9EA3AE" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3.5 border-b border-neutral-border/50 min-h-[48px]"
            onPress={() =>
              router.push({ pathname: '/(main)', params: { filter: 'favorites' } })
            }
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Bookmark size={18} color="#6C727A" strokeWidth={2} />
              <Text
                className="text-neutral-textMain ml-3 flex-1"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                {t('profile.favorites', { n: favorites.length })}
              </Text>
            </View>
            <ChevronRight size={18} color="#9EA3AE" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between p-3.5 min-h-[48px]"
            onPress={() => setEmergencyInfoOpen(true)}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Shield size={18} color="#DC2626" strokeWidth={2} />
              <Text
                className="text-emergency-alert ml-3 flex-1"
                style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14 }}
              >
                {t('profile.emergency')}
              </Text>
            </View>
            <ChevronRight size={18} color="#DC2626" />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title={t('profile.logout')}
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={18} color="#1A1D20" />}
        />
      </ScrollView>
      <PublicEmergencyInfoModal
        visible={emergencyInfoOpen}
        onClose={() => setEmergencyInfoOpen(false)}
        eventType={zoneEmergency?.event_type}
        description={zoneEmergency?.description}
        isMember={membershipStatus === 'MIEMBRO' || membershipStatus === 'DIRIGENTE'}
      />
    </View>
  );
}

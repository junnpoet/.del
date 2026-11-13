import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  HandHelping,
  HeartPulse,
  MapPin,
  Package,
  PhoneCall,
  Plus,
  Send,
  Users,
} from 'lucide-react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { useI18n } from '../src/i18n';
import { useAuth } from '../src/services/auth';
import { channelName, supabase } from '../src/services/supabase';
import { useSosAlert } from '../src/features/accessible-mode/hooks/useSosAlert';
import { useActiveEmergency } from '../src/features/emergency/hooks/useEmergencyRealtime';

interface VolunteerItem {
  id: string;
  user_id: string;
  profile: { full_name: string } | null;
}

interface CriticalPostItem {
  id: string;
  author_id: string;
  post_type: string;
  category: string;
  description: string;
  status: string | null;
  created_at: string | null;
  author: { full_name: string; home_address: string } | null;
  volunteers: VolunteerItem[];
}

const QUICK_CATEGORIES = [
  'Agua y Víveres',
  'Botiquín',
  'Rescate / Herramienta',
  'Traslado Solidario',
] as const;

export default function EmergencyBoardScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { profile, session } = useAuth();
  const { activeEvent, resolveEmergency } = useActiveEmergency(profile?.group_id);
  const { send: sendSos } = useSosAlert();

  const [sosActive, setSosActive] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [criticalPosts, setCriticalPosts] = useState<CriticalPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [actionMode, setActionMode] = useState<'VOLUNTARIADO' | 'DONACION'>('VOLUNTARIADO');
  const [category, setCategory] = useState<string>(QUICK_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);

  const isDirigente = profile?.role === 'dirigente';

  const fetchCriticalPosts = useCallback(async () => {
    if (!profile?.group_id) return;
    setLoadingPosts(true);
    try {
      const { data } = await supabase
        .from('solidary_posts')
        .select(
          'id, author_id, post_type, category, description, status, created_at, author:profiles!solidary_posts_author_id_fkey(full_name, home_address), volunteers(id, user_id, profile:profiles!volunteers_user_id_fkey(full_name))'
        )
        .eq('group_id', profile.group_id)
        .eq('urgency', 'ALTA_CRITICA')
        .neq('status', 'RESOLVED')
        .order('created_at', { ascending: false })
        .limit(15);

      setCriticalPosts((data as unknown as CriticalPostItem[]) ?? []);
    } catch {
      // Fallback silencioso ante desconexión
    } finally {
      setLoadingPosts(false);
    }
  }, [profile?.group_id]);

  useEffect(() => {
    void fetchCriticalPosts();
    if (!profile?.group_id) return;

    const channel = supabase
      .channel(channelName(`emergency-posts-${profile.group_id}`))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solidary_posts',
          filter: `group_id=eq.${profile.group_id}`,
        },
        () => {
          void fetchCriticalPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteers' },
        () => {
          void fetchCriticalPosts();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.group_id, fetchCriticalPosts]);

  const handleCreateCriticalAction = async () => {
    if (!profile?.group_id || !session?.user.id) return;
    if (description.trim().length < 5) {
      Alert.alert('Describe la acción', 'Ingresa al menos unas palabras para coordinar con tus vecinos.');
      return;
    }
    setSubmittingPost(true);
    try {
      const { error } = await supabase.from('solidary_posts').insert({
        group_id: profile.group_id,
        author_id: session.user.id,
        post_type: actionMode,
        category,
        description: description.trim(),
        urgency: 'ALTA_CRITICA',
        status: 'OPEN',
      });
      if (error) throw error;
      setDescription('');
      setComposerOpen(false);
      await fetchCriticalPosts();
    } catch (err) {
      Alert.alert(
        'No se pudo publicar',
        err instanceof Error ? err.message : 'Intenta nuevamente.'
      );
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleVolunteer = async (post: CriticalPostItem) => {
    if (!session?.user.id || busyPostId) return;
    setBusyPostId(post.id);
    try {
      const existing = post.volunteers.find((v) => v.user_id === session.user.id);
      if (existing) {
        const { error } = await supabase.from('volunteers').delete().eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('volunteers').insert({
          post_id: post.id,
          user_id: session.user.id,
          role_note: 'Apoyo en contingencia',
        });
        if (error) throw error;
      }
      await fetchCriticalPosts();
    } catch (err) {
      Alert.alert(
        'Error al coordinar',
        err instanceof Error ? err.message : 'Intenta nuevamente.'
      );
    } finally {
      setBusyPostId(null);
    }
  };

  const handleResolvePost = async (postId: string) => {
    if (busyPostId) return;
    setBusyPostId(postId);
    try {
      const { error } = await supabase
        .from('solidary_posts')
        .update({ status: 'RESOLVED' })
        .eq('id', postId);
      if (error) throw error;
      await fetchCriticalPosts();
    } catch (err) {
      Alert.alert(
        'No se pudo resolver',
        err instanceof Error ? err.message : 'Intenta nuevamente.'
      );
    } finally {
      setBusyPostId(null);
    }
  };

  const handleTriggerSOS = () => {
    Alert.alert(
      t('emergency.sosConfirmTitle'),
      t('emergency.sosConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('emergency.sosConfirmAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              await sendSos.mutateAsync();
              setSosActive(true);

              if (profile?.group_id && session?.user?.id) {
                void supabase.functions.invoke('send-push-alert', {
                  body: {
                    type: 'SOS_ALERT',
                    groupId: profile.group_id,
                    userId: session.user.id,
                    title: 'Alerta SOS Vecinal',
                    body: `${profile.full_name || 'Un vecino'} solicitó auxilio inmediato en tu sector.`,
                  },
                });
              }

              Alert.alert(t('emergency.sosSentTitle'), t('emergency.sosSentBody'));
            } catch (err) {
              Alert.alert(
                t('sos.failedTitle'),
                err instanceof Error ? err.message : t('sos.failedHelp')
              );
            }
          },
        },
      ]
    );
  };

  const handleResolveEmergency = () => {
    if (!activeEvent) return;
    Alert.alert(
      'Finalizar Contingencia',
      'Al cerrar la emergencia, todos los vecinos del sector regresarán al Modo Cotidiano.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Confirmar Cierre',
          style: 'destructive',
          onPress: async () => {
            setResolving(true);
            try {
              await resolveEmergency(activeEvent.id);
              router.replace('/(main)');
            } catch (err) {
              Alert.alert(
                'No se pudo cerrar',
                err instanceof Error ? err.message : 'Intenta nuevamente.'
              );
            } finally {
              setResolving(false);
            }
          },
        },
      ]
    );
  };

  const activatedTime = activeEvent?.activated_at
    ? new Date(activeEvent.activated_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-emergency-background">
      {/* Emergency Header */}
      <View className="px-5 pt-3 pb-4 bg-emergency-background border-b border-white/10">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.backA11y')}
            onPress={() => router.back()}
            className="flex-row items-center bg-white/10 px-3 py-2 rounded-xl min-h-[44px]"
          >
            <ChevronLeft size={18} color="#FFFFFF" />
            <Text
              className="text-white ml-1"
              style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}
            >
              {t('emergency.backNormal')}
            </Text>
          </TouchableOpacity>
          <View className="bg-emergency-alert/20 px-3 py-1.5 rounded-full">
            <Text
              className="text-emergency-alert uppercase"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              {activeEvent?.event_type ?? t('emergency.badge')}
            </Text>
          </View>
        </View>

        <Text
          className="text-white"
          style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22 }}
        >
          {t('emergency.title')}
        </Text>
        <Text
          className="text-emergency-warning mt-0.5"
          style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
        >
          {activeEvent?.description
            ? `${activeEvent.description}${activatedTime ? ` · ${activatedTime}` : ''}`
            : t('emergency.subtitle')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Giant SOS Trigger */}
        <View className="items-center my-3">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('emergency.sosA11y')}
            onPress={handleTriggerSOS}
            activeOpacity={0.85}
            className={`w-44 h-44 rounded-full items-center justify-center shadow-2xl ${
              sosActive
                ? 'bg-emergency-warning'
                : 'bg-emergency-alert shadow-emergency-alert/30'
            }`}
          >
            <View className="w-36 h-36 rounded-full border-4 border-white/30 items-center justify-center">
              {sosActive ? (
                <CheckCircle2 size={46} color="#1A1D20" strokeWidth={2.4} />
              ) : (
                <AlertTriangle size={46} color="#FFFFFF" strokeWidth={2.4} />
              )}
              <Text
                className={`mt-1.5 ${sosActive ? 'text-neutral-textMain' : 'text-white'}`}
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 19 }}
              >
                {sosActive ? t('emergency.sent') : 'SOS'}
              </Text>
            </View>
          </TouchableOpacity>
          <Text
            className="text-white/70 text-center mt-2.5 px-4 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12.5 }}
          >
            {t('emergency.sosHint')}
          </Text>
        </View>

        {/* Joint Coordination Header + Quick Composer Toggle */}
        <View className="flex-row items-center justify-between mb-2.5 mt-3 px-1">
          <Text
            className="text-white uppercase tracking-wider flex-1"
            style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 }}
          >
            Coordinación Conjunta
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setComposerOpen((prev) => !prev)}
            className="flex-row items-center rounded-xl bg-red-600 px-3 py-2"
          >
            <Plus size={15} color="#FFFFFF" />
            <Text
              className="ml-1 text-white"
              style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
            >
              {composerOpen ? 'Cerrar' : 'Coordinar acción'}
            </Text>
          </TouchableOpacity>
        </View>

        {composerOpen && (
          <Card variant="emergency" className="mb-4 p-4 border border-red-500/40">
            <View className="flex-row gap-2 mb-3">
              {(
                [
                  { key: 'VOLUNTARIADO', label: 'Pedir Auxilio / Apoyo' },
                  { key: 'DONACION', label: 'Ofrecer Recurso' },
                ] as const
              ).map((opt) => {
                const active = actionMode === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    accessibilityRole="button"
                    onPress={() => setActionMode(opt.key)}
                    className={`flex-1 py-2.5 px-3 rounded-xl items-center ${
                      active ? 'bg-red-600' : 'bg-white/10'
                    }`}
                  >
                    <Text
                      className="text-white"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {QUICK_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 rounded-full px-3 py-1.5 border ${
                      active ? 'bg-white border-white' : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <Text
                      className={active ? 'text-neutral-textMain' : 'text-white'}
                      style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              placeholder="Ej. Necesitamos bidones de agua o linternas en Mz. O..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={description}
              onChangeText={setDescription}
              multiline
              className="rounded-xl bg-white/10 px-3.5 py-3 text-white min-h-[76px]"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13.5, textAlignVertical: 'top' }}
            />

            <TouchableOpacity
              accessibilityRole="button"
              disabled={submittingPost}
              onPress={handleCreateCriticalAction}
              className="mt-3 min-h-[46px] rounded-xl bg-white flex-row items-center justify-center px-4"
            >
              {submittingPost ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Send size={15} color="#DC2626" />
                  <Text
                    className="ml-2 text-red-700"
                    style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 }}
                  >
                    Publicar en Tablero
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        )}

        {loadingPosts ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : criticalPosts.length > 0 ? (
          criticalPosts.map((post) => {
            const isJoined = Boolean(
              session?.user.id && post.volunteers.some((v) => v.user_id === session.user.id)
            );
            const canResolve = isDirigente || post.author_id === session?.user.id;
            const busy = busyPostId === post.id;
            const volunteerNames = post.volunteers
              .map((v) => v.profile?.full_name)
              .filter(Boolean)
              .join(', ');

            return (
              <Card key={post.id} variant="emergency" className="mb-3 p-4">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Package size={16} color="#F59E0B" strokeWidth={2.2} />
                    <Text
                      className="text-white ml-2"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}
                    >
                      {post.category}
                    </Text>
                  </View>
                  <Text
                    className="text-emergency-alert uppercase"
                    style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11.5 }}
                  >
                    {post.post_type === 'DONACION' ? 'RECURSO' : 'AUXILIO'}
                  </Text>
                </View>

                <Text
                  className="text-white/90 leading-5 mt-1"
                  style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13.5 }}
                >
                  {post.description}
                </Text>

                {post.author && (
                  <Text
                    className="text-white/60 mt-1.5"
                    style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11.5 }}
                  >
                    {post.author.full_name} · {post.author.home_address}
                  </Text>
                )}

                <View className="mt-2.5 flex-row items-center">
                  <Users size={13} color="#FBBF24" />
                  <Text
                    className="ml-1.5 text-amber-300 flex-1"
                    style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 }}
                  >
                    {post.volunteers.length > 0
                      ? `Apoyando (${post.volunteers.length}): ${volunteerNames}`
                      : 'Aún sin vecinos asignados'}
                  </Text>
                </View>

                <View className="mt-3 pt-2.5 border-t border-white/10 flex-row gap-2">
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => handleToggleVolunteer(post)}
                    className={`flex-1 min-h-[42px] rounded-xl flex-row items-center justify-center px-3 ${
                      isJoined ? 'bg-emerald-600' : 'bg-white/15'
                    }`}
                  >
                    <HandHelping size={15} color="#FFFFFF" />
                    <Text
                      className="ml-1.5 text-white"
                      style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
                    >
                      {isJoined ? 'Apoyando' : 'Yo apoyo'}
                    </Text>
                  </TouchableOpacity>

                  {canResolve && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => handleResolvePost(post.id)}
                      className="min-h-[42px] rounded-xl bg-white/10 px-3.5 flex-row items-center justify-center"
                    >
                      <CheckCircle2 size={15} color="#34D399" />
                      <Text
                        className="ml-1.5 text-emerald-300"
                        style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12.5 }}
                      >
                        Resolver
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          <Card variant="emergency" className="mb-3 p-4">
            <Text
              className="text-white/70 leading-5"
              style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13 }}
            >
              No hay acciones críticas registradas aún. Usa "Coordinar acción" para solicitar auxilio o aportar recursos.
            </Text>
          </Card>
        )}

        {/* Safe Zones & First Aid */}
        <Text
          className="text-white uppercase tracking-wider mb-2.5 mt-3 px-1"
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
            className="text-white/70 leading-5"
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
            className="text-white/70 leading-5"
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
            className="text-white/70 leading-5"
            style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13 }}
          >
            {t('emergency.phonesBody')}
          </Text>
        </Card>

        {isDirigente && activeEvent && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleResolveEmergency}
            disabled={resolving}
            activeOpacity={0.85}
            className="mb-3 bg-emerald-600 rounded-2xl min-h-[48px] px-4 py-3 flex-row items-center justify-center"
          >
            {resolving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                className="text-white"
                style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 }}
              >
                Finalizar Contingencia
              </Text>
            )}
          </TouchableOpacity>
        )}

        <Button
          variant="outline"
          title={t('emergency.backButton')}
          onPress={() => router.back()}
          className="border-white/25"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

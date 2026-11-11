import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../services/auth';
import { supabase } from '../../../services/supabase';
import { tr } from '../../../i18n';

export type MembershipState = 'LOADING' | 'NO_SESSION' | 'NO_SOLICITADO' | 'PENDIENTE' | 'MIEMBRO';

const pendingKey = (userId: string) => `@sumayni_join_request_${userId}`;

/**
 * Estado de acceso a la Capa Privada.
 * - MIEMBRO: el perfil ya tiene group_id (lo asigna approve_join_request) o es dirigente.
 * - PENDIENTE: envió solicitud. La RLS no deja al vecino leer su propia solicitud,
 *   por eso se recuerda localmente hasta que el grupo aparezca en su perfil.
 */
export function useMembership() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const [pending, setPending] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const userId = session?.user.id ?? null;

  const role = profile?.role ?? 'vecino';
  const isLeader = role === 'dirigente';
  const isPadrino = role === 'padrino';
  const isMember = Boolean(profile?.group_id) || isLeader;

  useEffect(() => {
    if (!userId) return;
    if (isMember) {
      AsyncStorage.removeItem(pendingKey(userId)).catch(() => undefined);
      setPending(false);
      return;
    }
    AsyncStorage.getItem(pendingKey(userId))
      .then((value) => setPending(value === 'PENDING'))
      .catch(() => undefined);
  }, [userId, isMember]);

  const requestMembership = useCallback(async () => {
    if (!session || !profile) throw new Error(tr('membership.errorLogin'));
    setRequesting(true);
    try {
      let groupId: string | null = null;

      if (profile.lat !== null && profile.lng !== null) {
        const { data } = await supabase.rpc('get_nearby_groups', {
          user_lat: profile.lat,
          user_lng: profile.lng,
          radius_meters: 3000,
        });
        groupId = data?.[0]?.group_id ?? null;
      }
      if (!groupId) {
        const { data } = await supabase.from('neighborhood_groups').select('id').limit(1);
        groupId = data?.[0]?.id ?? null;
      }
      if (!groupId) throw new Error(tr('membership.errorNoGroup'));

      const { error } = await supabase.from('group_join_requests').insert({
        group_id: groupId,
        user_id: session.user.id,
        full_name: profile.full_name,
        address: profile.home_address,
      });
      if (error) throw error;

      await AsyncStorage.setItem(pendingKey(session.user.id), 'PENDING');
      setPending(true);
    } finally {
      setRequesting(false);
    }
  }, [session, profile]);

  let state: MembershipState;
  if (loading || (session && !profile)) state = 'LOADING';
  else if (!session) state = 'NO_SESSION';
  else if (isMember) state = 'MIEMBRO';
  else if (pending) state = 'PENDIENTE';
  else state = 'NO_SOLICITADO';

  return {
    state,
    profile,
    isLeader,
    isPadrino,
    isMember,
    requesting,
    requestMembership,
    refreshProfile,
  };
}

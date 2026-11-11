import { useMutation } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../services/auth';
import { tr } from '../../../i18n';

async function currentCoordinates(fallback: { lat: number | null; lng: number | null }) {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status === Location.PermissionStatus.GRANTED) {
      // No esperar más de 4 s por el GPS: en una emergencia vale más avisar ya.
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      if (position) return { lat: position.coords.latitude, lng: position.coords.longitude };
    }
  } catch {
    // Sin GPS: se usa el hogar registrado.
  }
  if (fallback.lat !== null && fallback.lng !== null) return { lat: fallback.lat, lng: fallback.lng };
  return null;
}

/**
 * Emite un SOS: inserta en sos_alerts con la ubicación (GPS o, si falla, el hogar).
 * Padrinos y dirigentes lo reciben por Realtime en la Red de Cuidado.
 */
export function useSosAlert() {
  const { session, profile } = useAuth();

  const send = useMutation({
    // Un SOS no se encola: si falla, la persona debe saberlo enseguida.
    networkMode: 'always',
    retry: 1,
    mutationFn: async () => {
      if (!session) throw new Error(tr('sos.errorLogin'));
      const coords = await currentCoordinates({ lat: profile?.lat ?? null, lng: profile?.lng ?? null });
      if (!coords) throw new Error(tr('sos.errorLocation'));

      const { data, error } = await supabase
        .from('sos_alerts')
        .insert({
          sender_id: session.user.id,
          group_id: profile?.group_id ?? null,
          location: `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
  });

  const cancel = useMutation({
    networkMode: 'always',
    mutationFn: async (alertId: string) => {
      const { error } = await supabase.from('sos_alerts').update({ status: 'CANCELLED' }).eq('id', alertId);
      if (error) throw error;
    },
  });

  return { send, cancel };
}

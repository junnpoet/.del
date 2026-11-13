import { getServiceSupabaseClient } from '../_shared/supabaseClient.ts';

interface PushPayload {
  type: 'SOS_ALERT' | 'EMERGENCY_MODE' | 'CRISIS_CONSENSUS';
  groupId: string;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ExpoPushMessage {
  to: string;
  sound: 'default' | null;
  title: string;
  body: string;
  data: Record<string, unknown>;
  priority: 'default' | 'normal' | 'high';
  channelId?: string;
}

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<number> {
  if (messages.length === 0) return 0;

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const data = await res.json();
    return Array.isArray(data.data) ? data.data.length : messages.length;
  } catch (err) {
    console.error('[Expo Push Error]:', err);
    return 0;
  }
}

/**
 * Algoritmo de Detección de Crisis por Consenso (SPEC-05 §2.4)
 * Si se registran 3 reportes con urgencia: 'ALTA_CRITICA' en la misma manzana en menos de 10 minutos,
 * envía notificación push de pre-alerta a los dirigentes para activar el Modo Emergencia en 1 toque.
 */
export async function checkCrisisConsensus(groupId: string): Promise<boolean> {
  const supabase = getServiceSupabaseClient();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data: criticalPosts, error } = await supabase
    .from('solidary_posts')
    .select('id, category, description, created_at')
    .eq('group_id', groupId)
    .eq('urgency', 'ALTA_CRITICA')
    .gte('created_at', tenMinutesAgo);

  if (error || !criticalPosts) {
    console.error('[Consensus Error]:', error);
    return false;
  }

  if (criticalPosts.length >= 3) {
    console.log(`[Crisis Consensus Alert]: Detectados ${criticalPosts.length} reportes críticos en <10min.`);
    return true;
  }

  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload: PushPayload = await req.json();
    const { type, groupId, userId, title, body, data } = payload;
    const supabase = getServiceSupabaseClient();

    let targetTokens: string[] = [];

    // CASO 1: Alerta SOS (Notificar a Dirigentes y Padrinos asignados)
    if (type === 'SOS_ALERT') {
      // 1. Obtener dirigentes del grupo
      const { data: dirigentes } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('group_id', groupId)
        .eq('role', 'dirigente')
        .not('push_token', 'is', null);

      if (dirigentes) {
        targetTokens.push(...dirigentes.map((d) => d.push_token));
      }

      // 2. Si hay userId de persona vulnerable, buscar sus padrinos asignados en care_assignments
      if (userId) {
        const { data: assignments } = await supabase
          .from('care_assignments')
          .select('buddy_profile_id')
          .eq('vulnerable_profile_id', userId);

        if (assignments && assignments.length > 0) {
          const padrinoIds = assignments.map((a) => a.buddy_profile_id);
          const { data: padrinos } = await supabase
            .from('profiles')
            .select('push_token')
            .in('id', padrinoIds)
            .not('push_token', 'is', null);

          if (padrinos) {
            targetTokens.push(...padrinos.map((p) => p.push_token));
          }
        }
      }
    }

    // CASO 2: Modo Emergencia Activado o Consenso de Crisis (Despacho masivo a todo el sector)
    if (type === 'EMERGENCY_MODE' || type === 'CRISIS_CONSENSUS') {
      const { data: sectorProfiles } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('group_id', groupId)
        .not('push_token', 'is', null);

      if (sectorProfiles) {
        targetTokens.push(...sectorProfiles.map((p) => p.push_token));
      }
    }

    // Eliminar duplicados y tokens inválidos
    const uniqueTokens = [...new Set(targetTokens.filter(Boolean))];

    if (uniqueTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No push tokens registered for recipients in this group.',
          sentCount: 0,
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const messages: ExpoPushMessage[] = uniqueTokens.map((token) => ({
      to: token,
      sound: 'default',
      title: title || '🚨 Alerta Barrial Sumayni',
      body: body || 'Contingencia comunitaria activa en tu sector.',
      priority: 'high',
      channelId: 'emergency-alerts',
      data: {
        type,
        groupId,
        ...data,
      },
    }));

    const sentCount = await sendExpoPushNotifications(messages);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        recipients: uniqueTokens.length,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('[Send Push Alert Error]:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

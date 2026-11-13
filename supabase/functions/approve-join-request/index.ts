import { getServiceSupabaseClient } from '../_shared/supabaseClient.ts';
import { sendWhatsAppText } from '../_shared/whatsapp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizePhone(input: string): { nationalDigits: string; fullE164: string; authEmail: string } {
  const digits = input.trim().replace(/\D/g, '');
  const nationalDigits = digits.length === 11 && digits.startsWith('51') ? digits.slice(2) : digits;
  const fullE164 = nationalDigits.length === 9 ? `51${nationalDigits}` : digits;
  const authEmail = `${nationalDigits || digits}@sumayni.pe`;
  return { nationalDigits, fullE164, authEmail };
}

async function resolveOrCreateAuthUserId(
  supabase: ReturnType<typeof getServiceSupabaseClient>,
  authEmail: string,
  fullName: string
): Promise<string> {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: authEmail,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      is_from_whatsapp: true,
    },
  });

  if (!createError && created.user?.id) {
    return created.user.id;
  }

  // If the auth user already exists for this phone-derived email, resolve its ID via generateLink.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: authEmail,
  });

  if (linkError || !linkData?.user?.id) {
    throw createError ?? linkError ?? new Error('No se pudo crear ni recuperar el usuario de WhatsApp');
  }

  return linkData.user.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return jsonResponse({ error: 'No autorizado: falta token de sesión' }, 401);
    }

    const supabase = getServiceSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return jsonResponse({ error: 'No autorizado: sesión inválida' }, 401);
    }

    const { requestId } = await req.json();
    if (!requestId || typeof requestId !== 'string') {
      return jsonResponse({ error: 'requestId es obligatorio' }, 400);
    }

    const { data: joinReq, error: reqError } = await supabase
      .from('group_join_requests')
      .select(`
        id,
        group_id,
        user_id,
        whatsapp_phone,
        full_name,
        address,
        latitude,
        longitude,
        status,
        is_from_whatsapp,
        neighborhood_groups!inner (
          id,
          name,
          sector_name,
          leader_id
        )
      `)
      .eq('id', requestId)
      .maybeSingle();

    if (reqError || !joinReq) {
      return jsonResponse({ error: 'Solicitud no encontrada' }, 404);
    }

    // @ts-ignore joined single relation
    const group = joinReq.neighborhood_groups as {
      id: string;
      name: string;
      sector_name: string;
      leader_id: string | null;
    };

    if (group.leader_id !== authData.user.id) {
      return jsonResponse({ error: 'No autorizado: solo el dirigente del grupo puede aprobar solicitudes' }, 403);
    }

    let memberUserId: string | null = joinReq.user_id;

    if (memberUserId) {
      const { error: updateProfileErr } = await supabase
        .from('profiles')
        .update({ group_id: joinReq.group_id })
        .eq('id', memberUserId);
      if (updateProfileErr) throw updateProfileErr;
    } else if (joinReq.whatsapp_phone) {
      const { nationalDigits, fullE164, authEmail } = normalizePhone(joinReq.whatsapp_phone);
      const displayName = joinReq.full_name?.trim() || 'Vecino WhatsApp';

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone.eq.${nationalDigits},phone.eq.${fullE164},phone.eq.${joinReq.whatsapp_phone}`)
        .maybeSingle();

      if (existingProfile?.id) {
        memberUserId = existingProfile.id;
        const { error: updateExistingErr } = await supabase
          .from('profiles')
          .update({ group_id: joinReq.group_id })
          .eq('id', memberUserId);
        if (updateExistingErr) throw updateExistingErr;
      } else {
        memberUserId = await resolveOrCreateAuthUserId(supabase, authEmail, displayName);

        let lat = typeof joinReq.latitude === 'number' ? joinReq.latitude : null;
        let lng = typeof joinReq.longitude === 'number' ? joinReq.longitude : null;

        if (lat === null || lng === null) {
          const { data: centerRows } = await supabase.rpc('get_group_center', {
            p_group_id: joinReq.group_id,
          });
          const center = Array.isArray(centerRows) ? centerRows[0] : centerRows;
          lat = typeof center?.lat === 'number' ? center.lat : -12.0464;
          lng = typeof center?.lng === 'number' ? center.lng : -77.0428;
        }

        const { error: upsertProfileErr } = await supabase.from('profiles').upsert({
          id: memberUserId,
          full_name: displayName,
          phone: nationalDigits || joinReq.whatsapp_phone,
          home_address: joinReq.address?.trim() || group.sector_name,
          home_location: `SRID=4326;POINT(${lng} ${lat})`,
          role: 'vecino',
          group_id: joinReq.group_id,
        });
        if (upsertProfileErr) throw upsertProfileErr;
      }
    }

    const { error: approveErr } = await supabase
      .from('group_join_requests')
      .update({
        status: 'APPROVED',
        user_id: memberUserId,
      })
      .eq('id', requestId);

    if (approveErr) throw approveErr;

    let whatsappNotified = false;
    if (joinReq.whatsapp_phone) {
      const firstName = (joinReq.full_name || 'vecino/a').trim().split(/\s+/)[0];
      const welcomeMsg =
        `🎉 *¡Bienvenido/a a ${group.name}, ${firstName}!* 🏘️\n\n` +
        `Tu dirigente acaba de aprobar tu ingreso a la comunidad de *${group.sector_name}*.\n\n` +
        `Desde ahora ya puedes usar el bot de *Sumayni* por WhatsApp para:\n` +
        `🎙️ *Enviar una nota de voz*: cuéntanos si necesitas ayuda, quieres ofrecer un servicio o reportar algo; la IA lo publica automáticamente en el Muro Barrial.\n` +
        `🔍 *Buscar oficios de confianza*: escribe lo que necesitas (por ejemplo: _"gasfitero"_, _"electricista"_ o _"botiquín"_) y te mostraremos vecinos recomendados.\n` +
        `🚨 *Recibir alertas comunitarias*: te avisaremos por aquí ante cualquier emergencia o aviso importante del barrio.\n\n` +
        `¡También puedes entrar a la app móvil con tu número de WhatsApp cuando quieras! 💛`;

      whatsappNotified = await sendWhatsAppText(joinReq.whatsapp_phone, welcomeMsg);
    }

    return jsonResponse({
      success: true,
      userId: memberUserId,
      whatsappNotified,
    });
  } catch (err) {
    console.error('[approve-join-request] Error:', err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Error interno al aprobar solicitud' },
      500
    );
  }
});

import { getServiceSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  sendWhatsAppText,
  fetchWhatsAppAudioAsBase64,
} from '../_shared/whatsapp.ts';
import {
  transcribeVoiceAudio,
  structureTranscriptToPost,
  interpretWhatsAppTextQuery,
  ParsedVoicePost,
} from '../_shared/gemini.ts';
import { parseIncomingWebhookPayload } from './parser.ts';

async function fetchEvolutionAudioBase64(params: {
  messageId?: string;
  rawKey?: Record<string, unknown>;
  rawMessage?: Record<string, unknown>;
}): Promise<{ base64: string; mimeType: string }> {
  const baseUrl = Deno.env.get('EVOLUTION_API_URL')?.replace(/\s+/g, '').replace(/\/+$/, '');
  const apiKey = Deno.env.get('EVOLUTION_API_KEY')?.trim();
  const instance = Deno.env.get('EVOLUTION_INSTANCE_NAME')?.trim();

  if (!baseUrl || !apiKey || !instance) {
    throw new Error('Evolution API credentials missing for audio download');
  }

  const keyPayload = params.rawKey ?? (params.messageId ? { id: params.messageId } : undefined);
  if (!keyPayload) {
    throw new Error('Missing message key for Evolution audio download');
  }

  const res = await fetch(`${baseUrl}/chat/getBase64FromMediaMessage/${encodeURIComponent(instance)}`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        key: keyPayload,
        ...(params.rawMessage ? { message: params.rawMessage } : {}),
      },
      convertToMp4: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Evolution API media HTTP ${res.status}: ${await res.text()}`);
  }

  const payload = await res.json();
  const base64 = payload?.base64 || payload?.data?.base64;
  if (!base64 || typeof base64 !== 'string') {
    throw new Error(`Evolution API did not return audio base64 (keys: ${Object.keys(payload || {}).join(',')})`);
  }

  return {
    base64,
    mimeType: payload?.mimetype || payload?.data?.mimetype || 'audio/ogg',
  };
}

interface CommunitySearchResults {
  posts: Array<{
    id: string;
    post_type: string;
    category: string;
    description: string;
    whatsapp_sender_name: string | null;
    whatsapp_sender_phone: string | null;
    author?: { full_name?: string | null; phone?: string | null } | null;
  }>;
  services: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    rating_average: number | null;
    reviews_count: number | null;
    profiles?: { full_name?: string | null; phone?: string | null } | null;
  }>;
}

async function searchCommunityResources(
  supabase: ReturnType<typeof getServiceSupabaseClient>,
  groupId: string | null,
  intent: 'SEARCH_SERVICE' | 'SEARCH_POST' | 'SEARCH_BOTH',
  keywords: string[],
  fallbackTerm: string
): Promise<CommunitySearchResults> {
  const safeTerms = keywords
    .map((k) => k.replace(/[,()%*\\]/g, '').trim())
    .filter((k) => k.length >= 2);
  const terms = safeTerms.length > 0 ? safeTerms : [fallbackTerm.replace(/[,()%*\\]/g, '').trim()];

  let posts: CommunitySearchResults['posts'] = [];
  if (intent === 'SEARCH_POST' || intent === 'SEARCH_BOTH') {
    const postOrFilter = terms
      .flatMap((term) => [
        `description.ilike.%${term}%`,
        `category.ilike.%${term}%`,
        `post_type.ilike.%${term}%`,
      ])
      .join(',');

    let postsQuery = supabase
      .from('solidary_posts')
      .select(`
        id,
        post_type,
        category,
        description,
        whatsapp_sender_name,
        whatsapp_sender_phone,
        author:profiles!solidary_posts_author_id_fkey (
          full_name,
          phone
        )
      `)
      .eq('status', 'OPEN')
      .or(postOrFilter)
      .order('created_at', { ascending: false })
      .limit(3);

    if (groupId) {
      postsQuery = postsQuery.eq('group_id', groupId);
    }

    const { data } = await postsQuery;
    // @ts-ignore Supabase joined relation shape
    posts = data ?? [];
  }

  let services: CommunitySearchResults['services'] = [];
  if (intent === 'SEARCH_SERVICE' || intent === 'SEARCH_BOTH') {
    const serviceOrFilter = terms
      .flatMap((term) => [
        `title.ilike.%${term}%`,
        `category.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ])
      .join(',');

    const { data } = await supabase
      .from('services')
      .select(`
        id,
        title,
        category,
        description,
        rating_average,
        reviews_count,
        profiles (
          full_name,
          phone
        )
      `)
      .or(serviceOrFilter)
      .limit(3);

    // @ts-ignore Supabase joined relation shape
    services = data ?? [];
  }

  return { posts, services };
}

function formatSearchMatchesReply(
  summaryForUser: string,
  rawQuery: string,
  results: CommunitySearchResults,
  headerPrefix = ''
): string {
  let reply = `${headerPrefix}🔍 Esto es lo que encontré en tu comunidad sobre *${summaryForUser}*:\n\n`;

  if (results.posts.length > 0) {
    reply += `🤝 *Publicaciones del Muro Barrial:*\n`;
    for (const p of results.posts) {
      const authorName = p.author?.full_name || p.whatsapp_sender_name || 'Vecino';
      const rawPhone = p.author?.phone || p.whatsapp_sender_phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const waPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;

      reply += `• *${p.post_type}* (${p.category}): "${p.description}"\n`;
      reply += `  👤 ${authorName}`;
      if (waPhone) reply += ` · 📞 https://wa.me/${waPhone}`;
      reply += `\n\n`;
    }
  }

  if (results.services.length > 0) {
    reply += `🛠️ *Oficios recomendados:*\n`;
    for (const s of results.services) {
      const providerName = s.profiles?.full_name || 'Vecino Prestador';
      const rawPhone = s.profiles?.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const waPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;

      reply += `• *${s.title}* (${s.category})\n`;
      reply += `  👤 ${providerName} · ⭐ ${s.rating_average ?? '5.0'} (${s.reviews_count ?? 1})\n`;
      if (waPhone) reply += `  📞 https://wa.me/${waPhone}\n`;
      reply += `\n`;
    }
  }

  reply += `💡 Si aún necesitas ayuda y quieres publicarlo en el Muro, escribe:\n_"Publicar: ${rawQuery}"_`;
  return reply;
}

async function fetchMyPostsReply(
  supabase: ReturnType<typeof getServiceSupabaseClient>,
  profileId: string | null,
  fromPhone: string,
  nationalPhone: string,
  headerPrefix = ''
): Promise<string> {
  const filters = [
    `whatsapp_sender_phone.eq.${fromPhone}`,
    `whatsapp_sender_phone.eq.${nationalPhone}`,
  ];
  if (profileId) {
    filters.push(`author_id.eq.${profileId}`);
  }

  const { data: myPosts } = await supabase
    .from('solidary_posts')
    .select('id, post_type, category, description, urgency, status, created_at')
    .or(filters.join(','))
    .order('created_at', { ascending: false })
    .limit(5);

  if (!myPosts || myPosts.length === 0) {
    return (
      `${headerPrefix}📭 Todavía no tienes publicaciones registradas en el *Muro Barrial*.\n\n` +
      `💡 Puedes enviarme una *nota de voz* 🎙️ o escribir _"Publicar: necesito..."_ para crear tu primera publicación.`
    );
  }

  let reply = `${headerPrefix}📋 *Tus últimas publicaciones en el Muro Barrial:*\n\n`;
  for (const p of myPosts) {
    const statusBadge = p.status === 'OPEN' ? '🟢 Abierta' : '✅ Resuelta';
    const dateLabel = p.created_at
      ? new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
      : '';
    reply += `• *${p.post_type}* (${p.category}) · ${statusBadge}${dateLabel ? ` · ${dateLabel}` : ''}\n`;
    reply += `  "${p.description}"\n\n`;
  }

  reply += `💡 Si quieres publicar algo nuevo, envíame una *nota de voz* 🎙️ o escribe _"Publicar: ..."_.`;
  return reply;
}

function formatAlreadyMemberGreeting(
  firstName: string,
  groupName: string,
  sectorName: string,
  prefix = ''
): string {
  return (
    `${prefix}👋 ¡Hola ${firstName}! Ya detecté que tu número está registrado en la app y perteneces a *${groupName}* (${sectorName}). 🏘️✅\n\n` +
    `Ya *no es necesario* autenticarte ni unirte a una comunidad cercana. Puedes usar el bot directamente para:\n` +
    `🔍 *Buscar oficios o recursos*: ej. _"¿Alguien tendrá medicamentos?"_ o _"Necesito un gasfitero"_.\n` +
    `📋 *Ver tus publicaciones*: ej. _"¿Qué publicaciones he hecho?"_.\n` +
    `🎙️ *Enviar una nota de voz*: cuéntame qué necesitas o qué ofreces (primero buscaré si alguien ya lo ofrece).\n` +
    `📝 *Publicar por texto*: escribe _"Publicar: necesito..."_ para pedir apoyo a tus vecinos.`
  );
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // 1. Verificación inicial de Meta (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = Deno.env.get('META_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[WhatsApp Webhook] Meta challenge verified successfully');
      return new Response(challenge ?? '', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new Response('Forbidden', { status: 403 });
  }

  // 2. Recepción de eventos y mensajes (POST: Evolution API v2 o Meta Cloud API)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const message = parseIncomingWebhookPayload(body);

      if (!message) {
        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      const { fromPhone, contactName } = message;
      const nationalPhone = fromPhone.length === 11 && fromPhone.startsWith('51')
        ? fromPhone.slice(2)
        : fromPhone;
      const supabase = getServiceSupabaseClient();

      // Verificar si el vecino ya está registrado en profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, group_id, phone, neighborhood_groups(name, sector_name)')
        .or(`phone.eq.${fromPhone},phone.eq.${nationalPhone}`)
        .maybeSingle();

      // @ts-ignore joined relation
      const memberGroupName: string = profile?.neighborhood_groups?.name || 'tu comunidad';
      // @ts-ignore joined relation
      const memberSectorName: string = profile?.neighborhood_groups?.sector_name || 'tu sector';
      const memberFirstName: string = profile?.full_name?.split(/\s+/)[0] || contactName;

      // CASO A: Onboarding y Admisión para vecinos sin grupo asignado
      if (!profile || !profile.group_id) {
        if (message.type === 'location' && message.location) {
          const { latitude, longitude, address } = message.location;

          let targetGroupId: string | null = null;
          let targetGroupName = 'tu comunidad vecinal';
          let targetSectorName = 'tu sector';
          let distanceMeters: number | null = null;

          // 1. Evaluar la comunidad del miembro más cercano al usuario
          const { data: nearestMemberRows } = await supabase.rpc('get_nearest_member_community', {
            user_lat: latitude,
            user_lng: longitude,
          });
          const nearestMember = Array.isArray(nearestMemberRows) ? nearestMemberRows[0] : nearestMemberRows;

          if (nearestMember?.group_id) {
            targetGroupId = nearestMember.group_id;
            targetGroupName = nearestMember.group_name ?? targetGroupName;
            targetSectorName = nearestMember.sector_name ?? targetSectorName;
            distanceMeters = typeof nearestMember.distance_meters === 'number'
              ? nearestMember.distance_meters
              : null;
          } else {
            // Respaldo: grupo cercano por centroide o primer grupo disponible
            const { data: nearbyGroups } = await supabase.rpc('get_nearby_groups', {
              user_lat: latitude,
              user_lng: longitude,
              radius_meters: 5000,
            });

            if (nearbyGroups && nearbyGroups.length > 0) {
              targetGroupId = nearbyGroups[0].group_id;
              targetGroupName = nearbyGroups[0].name ?? targetGroupName;
              targetSectorName = nearbyGroups[0].sector_name ?? targetSectorName;
              distanceMeters = typeof nearbyGroups[0].distance_meters === 'number'
                ? nearbyGroups[0].distance_meters
                : null;
            } else {
              const { data: fallbackGroups } = await supabase
                .from('neighborhood_groups')
                .select('id, name, sector_name')
                .limit(1);
              if (fallbackGroups && fallbackGroups.length > 0) {
                targetGroupId = fallbackGroups[0].id;
                targetGroupName = fallbackGroups[0].name ?? targetGroupName;
                targetSectorName = fallbackGroups[0].sector_name ?? targetSectorName;
              }
            }
          }

          if (targetGroupId) {
            await supabase.from('whatsapp_onboarding_states').upsert({
              whatsapp_phone: fromPhone,
              group_id: targetGroupId,
              group_name: targetGroupName,
              sector_name: targetSectorName,
              latitude,
              longitude,
              address: address || null,
              contact_name: profile?.full_name ?? contactName,
              updated_at: new Date().toISOString(),
            });

            const distanceHint =
              distanceMeters !== null
                ? ` (a aprox. ${distanceMeters < 1000 ? `${Math.round(distanceMeters)} m` : `${(distanceMeters / 1000).toFixed(1)} km`})`
                : '';

            await sendWhatsAppText(
              fromPhone,
              `📍 ¡Gracias por compartir tu ubicación, ${contactName}!\n\n` +
              `Según el miembro más cercano a ti, la comunidad más próxima se ubica en *${targetSectorName}* (*${targetGroupName}*)${distanceHint}. 🏘️\n\n` +
              `¿Te gustaría formar parte de esta comunidad?\n` +
              `Responde *SÍ* para enviar tu solicitud al dirigente, o *NO* si prefieres cancelar. 😊`
            );
          } else {
            await sendWhatsAppText(
              fromPhone,
              `📍 ¡Ubicación recibida, ${contactName}! Todavía estamos configurando las juntas vecinales en tu zona, pero pronto tendremos novedades para ti. 💛`
            );
          }

          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        if (message.type === 'text') {
          const replyText = (message.text ?? '').trim();

          const { data: pendingState } = await supabase
            .from('whatsapp_onboarding_states')
            .select('group_id, group_name, sector_name, latitude, longitude, address, contact_name')
            .eq('whatsapp_phone', fromPhone)
            .maybeSingle();

          if (pendingState) {
            if (/^(s[ií]|claro|dale|ok|okay|confirmo|quiero|por favor|yes|acepto|1)\b/i.test(replyText)) {
              await supabase.from('group_join_requests').insert({
                group_id: pendingState.group_id,
                user_id: profile?.id ?? null,
                whatsapp_phone: fromPhone,
                full_name: profile?.full_name ?? pendingState.contact_name ?? contactName,
                address: pendingState.address || `Coordenadas: ${pendingState.latitude}, ${pendingState.longitude}`,
                latitude: pendingState.latitude,
                longitude: pendingState.longitude,
                is_from_whatsapp: true,
                status: 'PENDING',
                is_emergency: false,
              });

              await supabase
                .from('whatsapp_onboarding_states')
                .delete()
                .eq('whatsapp_phone', fromPhone);

              await sendWhatsAppText(
                fromPhone,
                `✅ ¡Listo, ${contactName}! Ya enviamos tu solicitud al dirigente de *${pendingState.group_name}* (*${pendingState.sector_name}*). 🙌\n\n` +
                `Te avisaremos por aquí mismo en cuanto te aprueben para darte la bienvenida. ⏳💛`
              );
              return new Response('EVENT_RECEIVED', { status: 200 });
            }

            if (/^(no|cancelar|nel|nop|2)\b/i.test(replyText)) {
              await supabase
                .from('whatsapp_onboarding_states')
                .delete()
                .eq('whatsapp_phone', fromPhone);

              await sendWhatsAppText(
                fromPhone,
                `👌 Entendido, ${contactName}. No enviamos ninguna solicitud.\n\n` +
                `Si deseas buscar otra comunidad más adelante, solo vuelve a compartir tu ubicación cuando gustes. 📍`
              );
              return new Response('EVENT_RECEIVED', { status: 200 });
            }

            await sendWhatsAppText(
              fromPhone,
              `🏘️ La comunidad más cercana que encontramos es *${pendingState.group_name}* en *${pendingState.sector_name}*.\n\n` +
              `¿Confirmas que quieres enviar tu solicitud al dirigente? Responde *SÍ* para enviarla o *NO* para cancelar. 😊`
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          const { data: existingPendingReq } = await supabase
            .from('group_join_requests')
            .select('id, neighborhood_groups(name, sector_name)')
            .eq('whatsapp_phone', fromPhone)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingPendingReq) {
            // @ts-ignore joined relation
            const reqGroupName = existingPendingReq.neighborhood_groups?.name ?? 'tu comunidad';
            await sendWhatsAppText(
              fromPhone,
              `⏳ ¡Hola de nuevo, ${contactName}! Tu solicitud para unirte a *${reqGroupName}* ya está en revisión por el dirigente.\n\n` +
              `Te escribiré por aquí apenas te acepten para contarte todo lo que puedes hacer en Sumayni. 🙌💛`
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          await sendWhatsAppText(
            fromPhone,
            `👋 ¡Hola ${contactName}! Soy *Sumayni*, tu asistente vecinal de confianza. 🏘️✨\n\n` +
            `Para conectarte con la comunidad más cercana a tu casa y acceder a oficios locales, muro solidario y alertas del barrio, por favor compárteme tu ubicación.\n\n` +
            `📍 Toca el ícono de *adjuntar (📎 o ➕) → Ubicación → Enviar mi ubicación actual* en WhatsApp.`
          );
          return new Response('EVENT_RECEIVED', { status: 200 });
        }
      }

      // Si ya pertenece a una comunidad y comparte ubicación, confirmarle que ya está activo
      if (message.type === 'location' && message.location) {
        await sendWhatsAppText(
          fromPhone,
          formatAlreadyMemberGreeting(
            memberFirstName,
            memberGroupName,
            memberSectorName,
            '📍 ¡Recibí tu ubicación!\n\n'
          )
        );
        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      // CASO B: Nota de voz recibida (Publicación asistida por IA Gemini)
      if (message.type === 'audio' && message.audio) {
        await sendWhatsAppText(fromPhone, '🎙️ ¡Audio recibido! Estoy procesando tu nota de voz con Inteligencia Artificial...');

        try {
          let audioBase64 = message.audio.base64;
          let mimeType = message.audio.mimeType || 'audio/ogg';

          if (!audioBase64) {
            if (message.source === 'evolution' && (message.audio.id || message.audio.rawKey)) {
              const evoAudio = await fetchEvolutionAudioBase64({
                messageId: message.audio.id,
                rawKey: message.audio.rawKey,
                rawMessage: message.audio.rawMessage,
              });
              audioBase64 = evoAudio.base64;
              mimeType = evoAudio.mimeType;
            } else if (message.audio.id) {
              const metaAudio = await fetchWhatsAppAudioAsBase64(message.audio.id);
              audioBase64 = metaAudio.base64;
              mimeType = metaAudio.mimeType;
            }
          }

          if (!audioBase64) {
            throw new Error('No audio payload available');
          }

          const transcript = await transcribeVoiceAudio(audioBase64, mimeType);
          const interpreted = await interpretWhatsAppTextQuery(transcript);

          if (interpreted.intent === 'GREETING_HELP') {
            await sendWhatsAppText(
              fromPhone,
              formatAlreadyMemberGreeting(
                memberFirstName,
                memberGroupName,
                memberSectorName,
                `🎙️ Escuché: _"${transcript}"_\n\n`
              )
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          if (interpreted.intent === 'MY_POSTS') {
            await sendWhatsAppText(
              fromPhone,
              await fetchMyPostsReply(
                supabase,
                profile?.id ?? null,
                fromPhone,
                nationalPhone,
                `🎙️ Escuché: _"${transcript}"_\n\n`
              )
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          if (interpreted.intent !== 'PUBLISH_POST') {
            const searchIntent =
              interpreted.intent === 'SEARCH_SERVICE' ||
              interpreted.intent === 'SEARCH_POST' ||
              interpreted.intent === 'SEARCH_BOTH'
                ? interpreted.intent
                : 'SEARCH_BOTH';

            const results = await searchCommunityResources(
              supabase,
              profile?.group_id ?? null,
              searchIntent,
              interpreted.keywords,
              transcript
            );

            if (results.posts.length > 0 || results.services.length > 0) {
              await sendWhatsAppText(
                fromPhone,
                formatSearchMatchesReply(
                  interpreted.summaryForUser,
                  transcript,
                  results,
                  `🎙️ Escuché: _"${transcript}"_\n\n`
                )
              );
              return new Response('EVENT_RECEIVED', { status: 200 });
            }
          }

          const parsedPost: ParsedVoicePost =
            interpreted.postDraft ?? (await structureTranscriptToPost(transcript));

          if (parsedPost.urgencia === 'ALTA_CRITICA') {
            await supabase.from('solidary_posts').insert({
              author_id: profile?.id ?? null,
              group_id: profile?.group_id ?? null,
              whatsapp_sender_phone: fromPhone,
              whatsapp_sender_name: profile?.full_name ?? contactName,
              post_type: parsedPost.tipo,
              category: parsedPost.categoria,
              description: parsedPost.resumen,
              urgency: parsedPost.urgencia,
              is_from_whatsapp: true,
              is_ai_voice: true,
              status: 'OPEN',
            });

            await sendWhatsAppText(
              fromPhone,
              `🚨 Detecté una *emergencia alta* en tu audio, así que lo publiqué de inmediato en el *Muro Barrial*:\n\n` +
              `📌 *${parsedPost.tipo}* (${parsedPost.categoria})\n` +
              `"${parsedPost.resumen}"\n` +
              `⚡ Urgencia: ${parsedPost.urgencia}\n\n` +
              `Tus vecinos ya pueden verlo para ayudarte cuanto antes. 🙏`
            );
          } else {
            await supabase.from('whatsapp_pending_posts').upsert({
              whatsapp_phone: fromPhone,
              group_id: profile?.group_id ?? null,
              author_id: profile?.id ?? null,
              contact_name: profile?.full_name ?? contactName,
              post_type: parsedPost.tipo,
              category: parsedPost.categoria,
              description: parsedPost.resumen,
              urgency: parsedPost.urgencia,
              is_ai_voice: true,
              updated_at: new Date().toISOString(),
            });

            await sendWhatsAppText(
              fromPhone,
              `🎙️ Escuché: _"${transcript}"_\n\n` +
              `🔍 Busqué en tu comunidad y no encontré coincidencias activas.\n\n` +
              `📝 ¿Quieres que publique esto en el *Muro Barrial*?\n` +
              `📌 *${parsedPost.tipo}* (${parsedPost.categoria})\n` +
              `"${parsedPost.resumen}"\n` +
              `⚡ Urgencia: ${parsedPost.urgencia}\n\n` +
              `Responde *SÍ* para publicarlo o *NO* para cancelar. 😊`
            );
          }
        } catch (voiceError) {
          console.error('[WhatsApp Voice Pipeline Error]:', voiceError);
          await sendWhatsAppText(
            fromPhone,
            '🙏 Ups, no pude escuchar con claridad tu audio. ¿Podrías enviarlo de nuevo en un lugar con menos ruido o escribirme tu pedido por texto?'
          );
        }

        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      // CASO C: Consulta inteligente por texto (confirmación de borrador o búsqueda/consulta)
      if (message.type === 'text' && message.text) {
        const rawText = message.text.trim();

        const { data: pendingPost } = await supabase
          .from('whatsapp_pending_posts')
          .select('*')
          .eq('whatsapp_phone', fromPhone)
          .maybeSingle();

        if (pendingPost) {
          if (/^(s[ií]|claro|dale|ok|okay|confirmo|publica|publicar|yes|1)\b/i.test(rawText)) {
            await supabase.from('solidary_posts').insert({
              author_id: pendingPost.author_id ?? profile?.id ?? null,
              group_id: pendingPost.group_id ?? profile?.group_id ?? null,
              whatsapp_sender_phone: fromPhone,
              whatsapp_sender_name: pendingPost.contact_name ?? profile?.full_name ?? contactName,
              post_type: pendingPost.post_type,
              category: pendingPost.category,
              description: pendingPost.description,
              urgency: pendingPost.urgency,
              is_from_whatsapp: true,
              is_ai_voice: Boolean(pendingPost.is_ai_voice),
              status: 'OPEN',
            });

            await supabase
              .from('whatsapp_pending_posts')
              .delete()
              .eq('whatsapp_phone', fromPhone);

            await sendWhatsAppText(
              fromPhone,
              `✅ ¡Listo! Ya publiqué tu aviso en el *Muro Barrial*:\n\n` +
              `📌 *${pendingPost.post_type}* (${pendingPost.category})\n` +
              `"${pendingPost.description}"\n` +
              `⚡ Urgencia: ${pendingPost.urgency}\n\n` +
              `Tus vecinos de la comunidad ya pueden verlo y ayudarte. 🙌`
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          if (/^(no|cancelar|nel|nop|2)\b/i.test(rawText)) {
            await supabase
              .from('whatsapp_pending_posts')
              .delete()
              .eq('whatsapp_phone', fromPhone);

            await sendWhatsAppText(
              fromPhone,
              `👌 Entendido, cancelé la publicación. No se subió nada al Muro Barrial. 😊`
            );
            return new Response('EVENT_RECEIVED', { status: 200 });
          }

          // Si el usuario escribió otra consulta nueva, descartamos el borrador anterior y continuamos
          await supabase
            .from('whatsapp_pending_posts')
            .delete()
            .eq('whatsapp_phone', fromPhone);
        }

        const interpreted = await interpretWhatsAppTextQuery(rawText);

        if (interpreted.intent === 'GREETING_HELP') {
          await sendWhatsAppText(
            fromPhone,
            formatAlreadyMemberGreeting(memberFirstName, memberGroupName, memberSectorName)
          );
          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        if (interpreted.intent === 'MY_POSTS') {
          await sendWhatsAppText(
            fromPhone,
            await fetchMyPostsReply(supabase, profile?.id ?? null, fromPhone, nationalPhone)
          );
          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        if (interpreted.intent === 'PUBLISH_POST' && interpreted.postDraft) {
          await supabase.from('solidary_posts').insert({
            author_id: profile?.id ?? null,
            group_id: profile?.group_id ?? null,
            whatsapp_sender_phone: fromPhone,
            whatsapp_sender_name: profile?.full_name ?? contactName,
            post_type: interpreted.postDraft.tipo,
            category: interpreted.postDraft.categoria,
            description: interpreted.postDraft.resumen,
            urgency: interpreted.postDraft.urgencia,
            is_from_whatsapp: true,
            is_ai_voice: false,
            status: 'OPEN',
          });

          await sendWhatsAppText(
            fromPhone,
            `✅ ¡Listo! Publiqué tu mensaje en el *Muro Barrial*:\n\n` +
            `📌 *${interpreted.postDraft.tipo}* (${interpreted.postDraft.categoria})\n` +
            `"${interpreted.postDraft.resumen}"\n` +
            `⚡ Urgencia: ${interpreted.postDraft.urgencia}\n\n` +
            `Tus vecinos de la comunidad ya pueden verlo y ayudarte. 🙌`
          );
          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        const searchIntent =
          interpreted.intent === 'SEARCH_SERVICE' ||
          interpreted.intent === 'SEARCH_POST' ||
          interpreted.intent === 'SEARCH_BOTH'
            ? interpreted.intent
            : 'SEARCH_BOTH';

        const results = await searchCommunityResources(
          supabase,
          profile?.group_id ?? null,
          searchIntent,
          interpreted.keywords,
          rawText
        );

        if (results.posts.length > 0 || results.services.length > 0) {
          await sendWhatsAppText(
            fromPhone,
            formatSearchMatchesReply(interpreted.summaryForUser, rawText, results)
          );
        } else {
          await sendWhatsAppText(
            fromPhone,
            `😕 No encontré publicaciones ni oficios activos sobre *${interpreted.summaryForUser}* en este momento.\n\n` +
            `💡 Si quieres pedirlo a tus vecinos, envíame una *nota de voz* 🎙️ o escribe:\n_"Publicar: ${rawText}"_\ny lo subo al Muro Barrial para que tu comunidad te ayude. 🙌`
          );
        }

        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (err) {
      console.error('[WhatsApp Webhook Error]:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});

// Función exportable para Difusión Automática de Emergencia (Broadcast)
export async function broadcastEmergencyAlert(
  groupId: string,
  eventType: string,
  description: string
): Promise<number> {
  const supabase = getServiceSupabaseClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('group_id', groupId)
    .not('phone', 'is', null);

  if (error || !profiles) {
    console.error('[Emergency Broadcast] Error fetching group profiles:', error);
    return 0;
  }

  let sentCount = 0;
  for (const p of profiles) {
    if (!p.phone) continue;

    const success = await sendWhatsAppText(
      p.phone,
      `*ALERTA DE EMERGENCIA COMUNITARIA: ${eventType.toUpperCase()}*\n\n` +
      `${description}\n\n` +
      `Por favor mantén la calma, revisa el Tablero de Ayuda de Sumayni y acude a los puntos de encuentro seguros fijados por tu junta barrial.`
    );

    if (success) sentCount++;
  }

  return sentCount;
}

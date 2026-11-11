import { getServiceSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  sendWhatsAppText,
  fetchWhatsAppAudioAsBase64,
  sendWhatsAppTemplate,
} from '../_shared/whatsapp.ts';
import { processVoiceToPost, ParsedVoicePost } from '../_shared/gemini.ts';

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

  // 2. Recepción de eventos y mensajes (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const change = body.entry?.[0]?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      // Ignorar eventos que no son mensajes entrantes (ej. entrega de mensajes, statuses)
      if (!message) {
        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      const fromPhone = message.from;
      const contactName = change?.contacts?.[0]?.profile?.name || 'Vecino';
      const supabase = getServiceSupabaseClient();

      // Verificar si el vecino ya está registrado en profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, group_id, phone')
        .eq('phone', fromPhone)
        .maybeSingle();

      // CASO A: Onboarding y Admisión para vecinos sin la app móvil
      if (!profile || !profile.group_id) {
        if (message.type === 'location') {
          const { latitude, longitude, address } = message.location;

          // Buscar el grupo vecinal más cercano
          const { data: nearestGroups } = await supabase
            .from('neighborhood_groups')
            .select('id, name, sector_name')
            .limit(1);

          const targetGroupId = nearestGroups?.[0]?.id;

          if (targetGroupId) {
            await supabase.from('group_join_requests').insert({
              group_id: targetGroupId,
              whatsapp_phone: fromPhone,
              full_name: contactName,
              address: address || `Coordenadas: ${latitude}, ${longitude}`,
              is_from_whatsapp: true,
              status: 'PENDING',
              is_emergency: false,
            });

            await sendWhatsAppText(
              fromPhone,
              `📍 ¡Ubicación recibida, ${contactName}!\n\nHemos enviado tu solicitud al dirigente de tu cuadra para admitirte en la red barrial de Sumayni. Te notificaremos por aquí en cuanto seas confirmado.`
            );
          } else {
            await sendWhatsAppText(
              fromPhone,
              '📍 Ubicación recibida. Estamos configurando tu sector vecinal y pronto te daremos acceso.'
            );
          }

          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        // Si envía texto sin registrarse, instruir cómo compartir ubicación
        if (message.type === 'text') {
          await sendWhatsAppText(
            fromPhone,
            `¡Hola ${contactName}! Soy Sumayni, la red comunitaria de confianza de tu barrio. 🤝\n\nPara conectarte con tu junta vecinal y acceder a oficios locales o auxilio, por favor comparte tu ubicación tocando el clip 📎 > Ubicación de WhatsApp.`
          );
          return new Response('EVENT_RECEIVED', { status: 200 });
        }
      }

      // CASO B: Nota de voz recibida (Publicación asistida por IA Gemini)
      if (message.type === 'audio') {
        const audioId = message.audio?.id;
        if (!audioId) return new Response('AUDIO_ID_MISSING', { status: 400 });

        await sendWhatsAppText(fromPhone, '🎙️ Procesando tu nota de voz con Inteligencia Artificial...');

        try {
          const { base64, mimeType } = await fetchWhatsAppAudioAsBase64(audioId);
          const parsedPost: ParsedVoicePost = await processVoiceToPost(base64, mimeType);

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
            status: 'OPEN',
          });

          await sendWhatsAppText(
            fromPhone,
            `✅ Tu requerimiento fue publicado en el Muro Barrial:\n\n📋 *${parsedPost.tipo}* (${parsedPost.categoria})\n💬 "${parsedPost.resumen}"\n🚨 Urgencia: ${parsedPost.urgencia}\n\nTus vecinos de la comunidad ya pueden verlo y responderte.`
          );
        } catch (voiceError) {
          console.error('[WhatsApp Voice Pipeline Error]:', voiceError);
          await sendWhatsAppText(
            fromPhone,
            '⚠️ No pudimos procesar con claridad tu audio. Por favor intenta enviarlo nuevamente con menor ruido de fondo o escríbenos tu pedido en texto.'
          );
        }

        return new Response('EVENT_RECEIVED', { status: 200 });
      }

      // CASO C: Consulta por texto ("gasfitero", "electricista", "botiquin")
      if (message.type === 'text') {
        const rawText = message.text?.body?.trim() || '';
        const query = rawText.toLowerCase();

        const { data: services } = await supabase
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
          .or(`title.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(3);

        if (services && services.length > 0) {
          let reply = `🔍 Encontramos estos oficios recomendados en tu sector para "${rawText}":\n\n`;

          for (const s of services) {
            // @ts-ignore profiles is joined
            const providerName = s.profiles?.full_name || 'Vecino Prestador';
            // @ts-ignore profiles is joined
            const rawPhone = s.profiles?.phone || '';
            const cleanPhone = rawPhone.replace(/\D/g, '');

            reply += `🛠 *${s.title}* (${s.category})\n`;
            reply += `👤 ${providerName}\n`;
            reply += `⭐ ${s.rating_average ?? '5.0'} (${s.reviews_count ?? 1} vistos buenos)\n`;
            if (cleanPhone) {
              reply += `📲 Contacto directo: https://wa.me/${cleanPhone}\n`;
            }
            reply += `\n`;
          }

          reply += `Escribe otro oficio o envía una nota de voz si necesitas ayuda comunitaria.`;
          await sendWhatsAppText(fromPhone, reply);
        } else {
          await sendWhatsAppText(
            fromPhone,
            `No encontramos servicios para "${rawText}" en este momento.\n\nPuedes probar buscando términos como *gasfitero*, *electricista*, *cerrajero*, o enviarme un audio explicando qué ayuda necesitas para publicarlo en el Muro Solidario.`
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
      `🚨 *ALERTA DE EMERGENCIA COMUNITARIA: ${eventType.toUpperCase()}* 🚨\n\n` +
      `${description}\n\n` +
      `Por favor mantén la calma, revisa el Tablero de Ayuda de Sumayni y acude a los puntos de encuentro seguros fijados por tu junta barrial.`
    );

    if (success) sentCount++;
  }

  return sentCount;
}

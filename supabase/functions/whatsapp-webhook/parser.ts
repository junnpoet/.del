export interface NormalizedIncomingMessage {
  source: 'evolution' | 'meta';
  fromPhone: string;
  contactName: string;
  type: 'text' | 'location' | 'audio';
  text?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  audio?: {
    id?: string;
    base64?: string;
    mimeType?: string;
    rawKey?: Record<string, unknown>;
    rawMessage?: Record<string, unknown>;
  };
}

/**
 * Normaliza payloads entrantes de Evolution API v2 (messages.upsert) y Meta Cloud API.
 * Retorna null para eventos de estado, mensajes propios (fromMe) o grupos (@g.us).
 */
export function parseIncomingWebhookPayload(body: any): NormalizedIncomingMessage | null {
  if (!body || typeof body !== 'object') return null;

  // 1. Formato Evolution API v2
  const evoData = Array.isArray(body.data) ? body.data[0] : body.data;
  if (evoData?.key?.remoteJid) {
    const event = typeof body.event === 'string' ? body.event.toLowerCase() : '';
    if (event && event !== 'messages.upsert' && event !== 'messages_upsert') {
      return null;
    }

    const remoteJid: string = evoData.key.remoteJid;
    if (evoData.key.fromMe === true || remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') {
      return null;
    }

    // Evolution v2.2+ puede enviar @lid en remoteJid y el número real en remoteJidAlt
    const preferredJid: string =
      remoteJid.endsWith('@lid') && typeof evoData.key.remoteJidAlt === 'string'
        ? evoData.key.remoteJidAlt
        : remoteJid;
    const fromPhone = preferredJid.split('@')[0].replace(/\D/g, '');
    if (!fromPhone) return null;

    const contactName: string = evoData.pushName || 'Vecino';
    const rawMsg = evoData.message || {};
    const msg =
      rawMsg.ephemeralMessage?.message ||
      rawMsg.viewOnceMessage?.message ||
      rawMsg.viewOnceMessageV2?.message ||
      rawMsg;

    if (msg.locationMessage) {
      return {
        source: 'evolution',
        fromPhone,
        contactName,
        type: 'location',
        location: {
          latitude: Number(msg.locationMessage.degreesLatitude),
          longitude: Number(msg.locationMessage.degreesLongitude),
          address: msg.locationMessage.address || msg.locationMessage.name || undefined,
        },
      };
    }

    if (msg.audioMessage) {
      return {
        source: 'evolution',
        fromPhone,
        contactName,
        type: 'audio',
        audio: {
          id: evoData.key.id,
          base64: msg.audioMessage.base64 || msg.base64 || rawMsg.base64 || evoData.base64 || body.base64 || undefined,
          mimeType: msg.audioMessage.mimetype || 'audio/ogg',
          rawKey: evoData.key,
          rawMessage: evoData.message,
        },
      };
    }

    const textBody = msg.conversation || msg.extendedTextMessage?.text;
    if (typeof textBody === 'string' && textBody.trim().length > 0) {
      return {
        source: 'evolution',
        fromPhone,
        contactName,
        type: 'text',
        text: textBody,
      };
    }

    return null;
  }

  // 2. Formato Meta Cloud API
  const change = body.entry?.[0]?.changes?.[0]?.value;
  const metaMsg = change?.messages?.[0];
  if (!metaMsg) return null;

  const fromPhone = String(metaMsg.from || '').replace(/\D/g, '');
  if (!fromPhone) return null;

  const contactName = change?.contacts?.[0]?.profile?.name || 'Vecino';

  if (metaMsg.type === 'location' && metaMsg.location) {
    return {
      source: 'meta',
      fromPhone,
      contactName,
      type: 'location',
      location: {
        latitude: Number(metaMsg.location.latitude),
        longitude: Number(metaMsg.location.longitude),
        address: metaMsg.location.address || metaMsg.location.name || undefined,
      },
    };
  }

  if (metaMsg.type === 'audio' && metaMsg.audio?.id) {
    return {
      source: 'meta',
      fromPhone,
      contactName,
      type: 'audio',
      audio: {
        id: metaMsg.audio.id,
      },
    };
  }

  if (metaMsg.type === 'text' && metaMsg.text?.body) {
    return {
      source: 'meta',
      fromPhone,
      contactName,
      type: 'text',
      text: metaMsg.text.body,
    };
  }

  return null;
}

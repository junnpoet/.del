export interface WhatsAppMediaPayload {
  base64: string;
  mimeType: string;
}

export async function sendWhatsAppText(to: string, text: string): Promise<boolean> {
  const token = Deno.env.get('META_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing META_ACCESS_TOKEN or META_PHONE_NUMBER_ID');
    return false;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: true,
        body: text,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[WhatsApp] Failed to send message to ${to}:`, errorBody);
    return false;
  }

  return true;
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<boolean> {
  const token = Deno.env.get('META_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing credentials for template dispatch');
    return false;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const components = [
    {
      type: 'body',
      parameters: Object.entries(parameters).map(([_, val]) => ({
        type: 'text',
        text: val,
      })),
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es' },
        components,
      },
    }),
  });

  return response.ok;
}

export async function fetchWhatsAppAudioAsBase64(mediaId: string): Promise<WhatsAppMediaPayload> {
  const token = Deno.env.get('META_ACCESS_TOKEN');
  if (!token) throw new Error('META_ACCESS_TOKEN missing');

  // 1. Get media direct URL
  const metaMediaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
  const metaRes = await fetch(metaMediaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    throw new Error(`Failed to fetch media metadata: ${await metaRes.text()}`);
  }

  const mediaInfo = await metaRes.json();
  const fileUrl = mediaInfo.url;
  const mimeType = mediaInfo.mime_type || 'audio/ogg';

  // 2. Download the binary
  const binaryRes = await fetch(fileUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!binaryRes.ok) {
    throw new Error(`Failed to download audio binary: ${binaryRes.statusText}`);
  }

  const arrayBuffer = await binaryRes.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binaryString);

  return { base64, mimeType };
}

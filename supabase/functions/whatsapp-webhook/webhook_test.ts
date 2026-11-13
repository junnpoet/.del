import { assertEquals } from 'jsr:@std/assert';
import { parseIncomingWebhookPayload } from './parser.ts';

Deno.test('GET /whatsapp-webhook validates Meta challenge token', () => {
  Deno.env.set('META_VERIFY_TOKEN', 'sumayni_secret_token_123');

  const reqValid = new Request(
    'https://example.com/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=sumayni_secret_token_123&hub.challenge=CHALLENGE_ACCEPTED_789'
  );

  const url = new URL(reqValid.url);
  assertEquals(url.searchParams.get('hub.mode'), 'subscribe');
  assertEquals(url.searchParams.get('hub.verify_token'), Deno.env.get('META_VERIFY_TOKEN'));
  assertEquals(url.searchParams.get('hub.challenge'), 'CHALLENGE_ACCEPTED_789');
});

Deno.test('GET /whatsapp-webhook rejects invalid tokens', () => {
  Deno.env.set('META_VERIFY_TOKEN', 'sumayni_secret_token_123');

  const reqInvalid = new Request(
    'https://example.com/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123'
  );

  const url = new URL(reqInvalid.url);
  assertEquals(url.searchParams.get('hub.verify_token') === Deno.env.get('META_VERIFY_TOKEN'), false);
});

Deno.test('Evolution API v2: parses text message (messages.upsert)', () => {
  const parsed = parseIncomingWebhookPayload({
    event: 'messages.upsert',
    instance: 'sumayni-bot',
    data: {
      key: {
        remoteJid: '51987654321@s.whatsapp.net',
        fromMe: false,
        id: 'MSG_123',
      },
      pushName: 'Rosa Flores',
      message: {
        conversation: 'gasfitero',
      },
    },
  });

  assertEquals(parsed, {
    source: 'evolution',
    fromPhone: '51987654321',
    contactName: 'Rosa Flores',
    type: 'text',
    text: 'gasfitero',
  });
});

Deno.test('Evolution API v2: parses locationMessage', () => {
  const parsed = parseIncomingWebhookPayload({
    event: 'messages.upsert',
    data: {
      key: {
        remoteJid: '51999111222@s.whatsapp.net',
        fromMe: false,
        id: 'LOC_456',
      },
      pushName: 'Don Jacinto',
      message: {
        locationMessage: {
          degreesLatitude: -12.0128,
          degreesLongitude: -77.0818,
          address: 'Jr. Las Dalias 120',
        },
      },
    },
  });

  assertEquals(parsed, {
    source: 'evolution',
    fromPhone: '51999111222',
    contactName: 'Don Jacinto',
    type: 'location',
    location: {
      latitude: -12.0128,
      longitude: -77.0818,
      address: 'Jr. Las Dalias 120',
    },
  });
});

Deno.test('Evolution API v2: parses audioMessage with base64', () => {
  const parsed = parseIncomingWebhookPayload({
    event: 'messages.upsert',
    data: {
      key: {
        remoteJid: '51999111222@s.whatsapp.net',
        fromMe: false,
        id: 'AUD_789',
      },
      pushName: 'Don Jacinto',
      message: {
        base64: 'T2dnUwACAAAAAAAAAAA=',
        audioMessage: {
          mimetype: 'audio/ogg; codecs=opus',
        },
      },
    },
  });

  assertEquals(parsed, {
    source: 'evolution',
    fromPhone: '51999111222',
    contactName: 'Don Jacinto',
    type: 'audio',
    audio: {
      id: 'AUD_789',
      base64: 'T2dnUwACAAAAAAAAAAA=',
      mimeType: 'audio/ogg; codecs=opus',
    },
  });
});

Deno.test('Evolution API v2: ignores fromMe and group @g.us messages', () => {
  const fromMe = parseIncomingWebhookPayload({
    event: 'messages.upsert',
    data: {
      key: { remoteJid: '51999111222@s.whatsapp.net', fromMe: true, id: '1' },
      message: { conversation: 'Hola' },
    },
  });
  const groupMsg = parseIncomingWebhookPayload({
    event: 'messages.upsert',
    data: {
      key: { remoteJid: '120363000000@g.us', fromMe: false, id: '2' },
      message: { conversation: 'Hola grupo' },
    },
  });

  assertEquals(fromMe, null);
  assertEquals(groupMsg, null);
});

Deno.test('Meta Cloud API: preserves backwards compatibility for text messages', () => {
  const parsed = parseIncomingWebhookPayload({
    entry: [
      {
        changes: [
          {
            value: {
              contacts: [{ profile: { name: 'Carlos' } }],
              messages: [
                {
                  from: '51999888777',
                  type: 'text',
                  text: { body: 'electricista' },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  assertEquals(parsed, {
    source: 'meta',
    fromPhone: '51999888777',
    contactName: 'Carlos',
    type: 'text',
    text: 'electricista',
  });
});

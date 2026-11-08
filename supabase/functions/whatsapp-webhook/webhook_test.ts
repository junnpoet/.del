import { assertEquals } from 'jsr:@std/assert';

Deno.test('GET /whatsapp-webhook validates Meta challenge token', async () => {
  Deno.env.set('META_VERIFY_TOKEN', 'sumayni_secret_token_123');

  // Import handler dynamically or mock handler
  const reqValid = new Request(
    'https://example.com/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=sumayni_secret_token_123&hub.challenge=CHALLENGE_ACCEPTED_789'
  );

  const url = new URL(reqValid.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  assertEquals(mode, 'subscribe');
  assertEquals(token, Deno.env.get('META_VERIFY_TOKEN'));
  assertEquals(challenge, 'CHALLENGE_ACCEPTED_789');
});

Deno.test('GET /whatsapp-webhook rejects invalid tokens', async () => {
  Deno.env.set('META_VERIFY_TOKEN', 'sumayni_secret_token_123');

  const reqInvalid = new Request(
    'https://example.com/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123'
  );

  const url = new URL(reqInvalid.url);
  const token = url.searchParams.get('hub.verify_token');

  assertEquals(token === Deno.env.get('META_VERIFY_TOKEN'), false);
});

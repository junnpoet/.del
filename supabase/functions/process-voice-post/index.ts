import { processVoiceToPost } from '../_shared/gemini.ts';

Deno.serve(async (req: Request) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { audioBase64, mimeType } = await req.json();

    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'Falta el parámetro audioBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const structuredPost = await processVoiceToPost(audioBase64, mimeType ?? 'audio/m4a');

    return new Response(JSON.stringify(structuredPost), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[process-voice-post] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error procesando audio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

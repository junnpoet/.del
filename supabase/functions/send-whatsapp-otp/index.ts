import { getServiceSupabaseClient } from '../_shared/supabaseClient.ts';
import { sendWhatsAppText } from '../_shared/whatsapp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalizePhone(input: string): { nationalDigits: string; fullE164: string; authEmail: string } {
  const digits = input.trim().replace(/\D/g, '');
  const nationalDigits = digits.length === 11 && digits.startsWith('51') ? digits.slice(2) : digits;
  const fullE164 = `51${nationalDigits}`;
  const authEmail = `${nationalDigits}@sumayni.pe`;
  return { nationalDigits, fullE164, authEmail };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Debes proporcionar un número de teléfono celular.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { nationalDigits, fullE164, authEmail } = normalizePhone(phone);
    const supabase = getServiceSupabaseClient();

    // 1. Verificar si el usuario existe en profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('phone', nationalDigits)
      .maybeSingle();

    if (profileError) {
      console.error('[send-whatsapp-otp] Error querying profile:', profileError);
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'El número de celular no se encuentra registrado en el barrio.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Generar el OTP nativo en Supabase GoTrue
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authEmail,
    });

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('[send-whatsapp-otp] Error generating OTP link:', linkError);
      return new Response(
        JSON.stringify({ error: 'No se pudo generar el código de acceso temporal.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const otpCode = linkData.properties.email_otp;

    // 3. Despachar mensaje por WhatsApp
    const message = `🔐 *Sumayni Barrio*\n\nHola ${profile.full_name}, tu código de acceso temporal es:\n\n*${otpCode}*\n\nIngrésalo en la app para entrar sin contraseña. Válido por 10 minutos.`;
    const whatsappSent = await sendWhatsAppText(fullE164, message);

    if (!whatsappSent) {
      return new Response(
        JSON.stringify({ error: 'No se pudo enviar el código por WhatsApp. Verifica que el bot esté conectado.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        phone: nationalDigits,
        whatsappSent: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[send-whatsapp-otp] Exception:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

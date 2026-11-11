import { createClient } from '@supabase/supabase-js';

export function getServiceSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://placeholder.supabase.co';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'placeholder-service-key';

  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    console.warn('[Supabase] Warning: Using placeholder credentials for Edge Functions');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

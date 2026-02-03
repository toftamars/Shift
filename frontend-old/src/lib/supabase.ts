import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://iggymtcteabswsrginyi.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY eksik veya geçersiz. Vercel → Settings → Environment Variables → VITE_SUPABASE_ANON_KEY ekleyin (Supabase → Settings → API → anon public). Sonra Redeploy.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

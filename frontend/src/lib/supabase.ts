import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iggymtcteabswsrginyi.supabase.co').trim();
// Build sırasında hata almamak için dummy key kullanıyoruz. Runtime'da env gelmezse zaten çalışmaz.
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder').trim();

if (supabaseAnonKey === 'public-anon-key-placeholder') {
  console.warn(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY bulunamadı. Build sırasında placeholder kullanılıyor.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

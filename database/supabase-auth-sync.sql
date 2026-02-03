-- Supabase Auth: auth.users ile public.users senkronu
-- Supabase Dashboard → SQL Editor'de schema.sql sonrası bu dosyayı çalıştır.

-- 1) Eski şemada password_hash NOT NULL ise nullable yap (idempotent)
ALTER TABLE public.users
  ALTER COLUMN password_hash DROP NOT NULL;

-- 2) auth.users'a yeni kullanıcı eklenince public.users'a satır ekle
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'EMPLOYEE')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı auth schema'da tanımlamak için (Supabase'de auth.users trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

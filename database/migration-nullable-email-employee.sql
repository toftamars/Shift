-- E-posta ve sicil no nullable (sayfadan çalışan eklerken backend NULL gönderir)
-- Zaten schema.sql çalıştırdıysanız: Supabase SQL Editor'da bu dosyayı bir kez çalıştırın (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'employee_code'
  ) THEN
    ALTER TABLE public.employees ALTER COLUMN employee_code DROP NOT NULL;
  END IF;
END $$;

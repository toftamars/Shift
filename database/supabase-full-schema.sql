-- Supabase + uygulama uyumlu tek şema
-- Supabase Dashboard → SQL Editor'da bu dosyayı tek seferde çalıştırın.
-- Backend (Express) DATABASE_URL ile bu projeye bağlanır; sayfa bu tablolarla çalışır.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================
-- KULLANICILAR (Supabase Auth ile uyumlu: email nullable = sayfadan eklenen personel)
-- ====================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ====================
-- DEPARTMANLAR
-- ====================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- PERSONEL (user_id = users.id; ad users.full_name'den gelir)
-- ====================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) UNIQUE,
    hire_date DATE NOT NULL,
    max_weekly_hours INTEGER DEFAULT 45,
    min_rest_hours INTEGER DEFAULT 11,
    is_part_time BOOLEAN DEFAULT FALSE,
    skills TEXT[],
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- VARDİYA TÜRLERİ
-- ====================
CREATE TABLE IF NOT EXISTS public.shift_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2),
    color_code VARCHAR(7),
    is_overnight BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- VARDİYA PLANLARI (container)
-- ====================
CREATE TABLE IF NOT EXISTS public.shift_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED'
    )),
    created_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    auto_generated BOOLEAN DEFAULT FALSE,
    optimization_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- VARDİYALAR (atamalar)
-- ====================
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.shift_schedules(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    shift_type_id UUID NOT NULL REFERENCES public.shift_types(id) ON DELETE RESTRICT,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_start_time TIME,
    actual_end_time TIME,
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    )),
    notes TEXT,
    is_overtime BOOLEAN DEFAULT FALSE,
    conflict_flags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, shift_date, start_time)
);
-- schedule_id nullable (grid'den doğrudan atama için backend NULL gönderir)

-- ====================
-- İNDEKSLER
-- ====================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON public.shifts(employee_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_schedule ON public.shifts(schedule_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date_range ON public.shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_schedules_department ON public.shift_schedules(department_id);
CREATE INDEX IF NOT EXISTS idx_schedules_dates ON public.shift_schedules(start_date, end_date);

-- ====================
-- TRIGGER: updated_at
-- ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_departments_updated_at') THEN
    CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at') THEN
    CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shift_types_updated_at') THEN
    CREATE TRIGGER update_shift_types_updated_at BEFORE UPDATE ON public.shift_types
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shift_schedules_updated_at') THEN
    CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON public.shift_schedules
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_shifts_updated_at') THEN
    CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ====================
-- Supabase Auth: auth.users → public.users senkron
-- ====================
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
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ====================
-- SEED (isteğe bağlı)
-- ====================
INSERT INTO public.users (id, email, full_name, role)
SELECT '00000000-0000-0000-0000-000000000001'::uuid, 'admin@shiftplanner.com', 'Sistem Yöneticisi', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@shiftplanner.com');

INSERT INTO public.departments (name, description)
SELECT 'Üretim', 'Üretim departmanı' WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Üretim');
INSERT INTO public.departments (name, description)
SELECT 'Lojistik', 'Lojistik ve depo işlemleri' WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Lojistik');
INSERT INTO public.departments (name, description)
SELECT 'Satış', 'Satış ve müşteri ilişkileri' WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Satış');

INSERT INTO public.shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Sabah Vardiyası', '08:00'::time, '16:00'::time, 8.00, '#4CAF50'
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Sabah Vardiyası');
INSERT INTO public.shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Akşam Vardiyası', '16:00'::time, '00:00'::time, 8.00, '#FF9800'
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Akşam Vardiyası');
INSERT INTO public.shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Gece Vardiyası', '00:00'::time, '08:00'::time, 8.00, '#3F51B5'
WHERE NOT EXISTS (SELECT 1 FROM public.shift_types WHERE name = 'Gece Vardiyası');

-- Supabase SQL Editor'da çalıştır: Departman, Vardiya Türü, Personel tabloları
-- Projenizdeki schema.sql ile uyumludur; sadece bu 3 yapıyı net görmeniz için.

-- Gerekli extension'lar (Supabase'de genelde zaten açık)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) DEPARTMAN
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) VARDİYA TÜRLERİ (sabah, akşam, gece vb.)
CREATE TABLE IF NOT EXISTS shift_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2),
    color_code VARCHAR(7),
    is_overnight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) PERSONEL (departman ve isteğe bağlı auth.users ile ilişkili)
-- Not: users tablosu auth.users ile senkron ise önce schema.sql + supabase-auth-sync.sql çalıştırın
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Supabase Auth ile eşleşme (opsiyonel)
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,           -- Ad soyad (backend otomatik user oluşturuyorsa bu yeterli)
    employee_code VARCHAR(50) UNIQUE,      -- Sicil no (opsiyonel, backend üretebilir)
    hire_date DATE NOT NULL,
    max_weekly_hours INTEGER DEFAULT 45,
    is_part_time BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler (sorgu hızı için)
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_shift_types_start ON shift_types(start_time);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_departments_updated_at ON departments;
CREATE TRIGGER tr_departments_updated_at
    BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_shift_types_updated_at ON shift_types;
CREATE TRIGGER tr_shift_types_updated_at
    BEFORE UPDATE ON shift_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tr_employees_updated_at ON employees;
CREATE TRIGGER tr_employees_updated_at
    BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- İsteğe bağlı: RLS (Row Level Security) açmak istersen
-- ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- (Sonra politika ekleyebilirsiniz.)

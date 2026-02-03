-- Modern Vardiya Planlama Sistemi - PostgreSQL Şeması
-- Veritabanı: shift_planner

-- UUID extension'ı aktif et
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================
-- KULLANICILAR VE YETKİ SİSTEMİ
-- ====================

-- Kullanıcılar Tablosu (Supabase Auth: şifre auth.users'da, password_hash kullanılmıyor)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ====================
-- ORGANİZASYON YAPISI
-- ====================

-- Departmanlar Tablosu
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personel Bilgileri Tablosu
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    max_weekly_hours INTEGER DEFAULT 45,
    min_rest_hours INTEGER DEFAULT 11,
    is_part_time BOOLEAN DEFAULT FALSE,
    skills TEXT[], -- PostgreSQL array
    preferences JSONB, -- JSON formatında tercihler
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- VARDİYA YÖNETİMİ
-- ====================

-- Vardiya Türleri Tablosu
CREATE TABLE IF NOT EXISTS shift_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    color_code VARCHAR(7), -- Hex color code (#FF5733)
    is_overnight BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Planlama Kuralları Tablosu
CREATE TABLE IF NOT EXISTS shift_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'MIN_REST_BETWEEN_SHIFTS',
        'MAX_CONSECUTIVE_DAYS',
        'MAX_WEEKLY_HOURS',
        'MIN_STAFF_PER_SHIFT',
        'MAX_STAFF_PER_SHIFT',
        'REQUIRED_SKILLS',
        'WEEKEND_RULES'
    )),
    rule_value JSONB NOT NULL,
    priority INTEGER DEFAULT 1,
    is_hard_constraint BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vardiya Planlaması Tablosu (Container)
CREATE TABLE IF NOT EXISTS shift_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED'
    )),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    auto_generated BOOLEAN DEFAULT FALSE,
    optimization_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vardiyalar Tablosu (Ana Tablo)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES shift_schedules(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    shift_type_id UUID REFERENCES shift_types(id) ON DELETE RESTRICT,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, shift_date, start_time)
);

-- ====================
-- İZİN VE TALEP YÖNETİMİ
-- ====================

-- İzin ve Tatil Talepleri Tablosu
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'ANNUAL_LEAVE', 'SICK_LEAVE', 'UNPAID_LEAVE', 'PUBLIC_HOLIDAY', 'OTHER'
    )),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'
    )),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- Vardiya Değiş-Tokuş Talepleri Tablosu
CREATE TABLE IF NOT EXISTS shift_swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    requested_shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    requester_employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    target_employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'ACCEPTED', 'REJECTED', 'APPROVED', 'CANCELLED'
    )),
    requester_notes TEXT,
    target_notes TEXT,
    manager_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP
);

-- ====================
-- ÇAKIŞMA VE UYARILAR
-- ====================

-- Çakışma Logları Tablosu
CREATE TABLE IF NOT EXISTS conflict_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    conflict_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    description TEXT,
    resolution_status VARCHAR(50) DEFAULT 'UNRESOLVED',
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- AUDIT VE LOGGING
-- ====================

-- Audit Log Tablosu
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- İNDEKSLER (PERFORMANCE)
-- ====================

-- Users indeksleri
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Employees indeksleri
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);

-- Shifts indeksleri
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts(employee_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_schedule ON shifts(schedule_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date_range ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Schedules indeksleri
CREATE INDEX IF NOT EXISTS idx_schedules_department ON shift_schedules(department_id);
CREATE INDEX IF NOT EXISTS idx_schedules_dates ON shift_schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON shift_schedules(status);

-- Time off indeksleri
CREATE INDEX IF NOT EXISTS idx_time_off_employee_dates ON time_off_requests(employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_status ON time_off_requests(status);

-- Conflict logs indeksleri
CREATE INDEX IF NOT EXISTS idx_conflict_logs_shift ON conflict_logs(shift_id, resolution_status);
CREATE INDEX IF NOT EXISTS idx_conflict_logs_severity ON conflict_logs(severity);

-- Audit logs indeksleri
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ====================
-- MATERIALIZED VIEW (PERFORMANS)
-- ====================

-- Haftalık çalışma saati özeti
DROP MATERIALIZED VIEW IF EXISTS weekly_hours_summary CASCADE;
CREATE MATERIALIZED VIEW weekly_hours_summary AS
SELECT
    e.id as employee_id,
    e.employee_code,
    DATE_TRUNC('week', s.shift_date) as week_start,
    SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) as total_hours,
    COUNT(s.id) as shift_count,
    MAX(s.updated_at) as last_updated
FROM employees e
LEFT JOIN shifts s ON e.id = s.employee_id
WHERE s.status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED')
GROUP BY e.id, e.employee_code, DATE_TRUNC('week', s.shift_date);

CREATE UNIQUE INDEX idx_weekly_hours_summary ON weekly_hours_summary(employee_id, week_start);

-- ====================
-- TRİGGERS
-- ====================

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_types_updated_at ON shift_types;
CREATE TRIGGER update_shift_types_updated_at BEFORE UPDATE ON shift_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_rules_updated_at ON shift_rules;
CREATE TRIGGER update_shift_rules_updated_at BEFORE UPDATE ON shift_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_schedules_updated_at ON shift_schedules;
CREATE TRIGGER update_shift_schedules_updated_at BEFORE UPDATE ON shift_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ====================

-- Admin kullanıcı (şifre: admin123) - zaten varsa atla
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@shiftplanner.com', '$2a$10$yYyOe9eYHH6j0a.j2CEOAusI9CSOeVZNyxC3kB8oakAr1CK5q8kqi', 'Sistem Yöneticisi', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Örnek departmanlar - zaten varsa atla
INSERT INTO departments (name, description)
SELECT 'Üretim', 'Üretim departmanı' WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Üretim');
INSERT INTO departments (name, description)
SELECT 'Lojistik', 'Lojistik ve depo işlemleri' WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Lojistik');
INSERT INTO departments (name, description)
SELECT 'Satış', 'Satış ve müşteri ilişkileri' WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Satış');

-- Örnek vardiya türleri - zaten varsa atla
INSERT INTO shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Sabah Vardiyası', '08:00:00', '16:00:00', 8.00, '#4CAF50'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Sabah Vardiyası');
INSERT INTO shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Akşam Vardiyası', '16:00:00', '00:00:00', 8.00, '#FF9800'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Akşam Vardiyası');
INSERT INTO shift_types (name, start_time, end_time, duration_hours, color_code)
SELECT 'Gece Vardiyası', '00:00:00', '08:00:00', 8.00, '#3F51B5'
WHERE NOT EXISTS (SELECT 1 FROM shift_types WHERE name = 'Gece Vardiyası');

COMMENT ON TABLE users IS 'Sistem kullanıcıları ve yetkilendirme';
COMMENT ON TABLE employees IS 'Personel detay bilgileri';
COMMENT ON TABLE departments IS 'Departman ve organizasyon yapısı';
COMMENT ON TABLE shift_types IS 'Vardiya türleri (sabah, akşam, gece vb.)';
COMMENT ON TABLE shift_rules IS 'Vardiya planlama kuralları ve kısıtlamaları';
COMMENT ON TABLE shift_schedules IS 'Vardiya planları (container)';
COMMENT ON TABLE shifts IS 'Bireysel vardiya atamaları';
COMMENT ON TABLE time_off_requests IS 'İzin talepleri ve onayları';
COMMENT ON TABLE shift_swap_requests IS 'Vardiya değiş-tokuş talepleri';
COMMENT ON TABLE conflict_logs IS 'Vardiya çakışma ve uyarı kayıtları';
COMMENT ON TABLE audit_logs IS 'Sistem aktivite ve denetim kayıtları';

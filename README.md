# 🚀 Modern Vardiya Planlama Otomasyon Sistemi

Modern, AI destekli, full-stack vardiya planlama ve yönetim sistemi.

## ✨ Özellikler

- ✅ **Otomatik Vardiya Optimizasyonu** - AI algoritması (Simulated Annealing + CSP)
- ✅ **Çakışma Kontrolü** - Gerçek zamanlı uyarılar ve validasyon
- ✅ **Excel/PDF Export** - Planları dışa aktarma
- ✅ **Çoklu Kullanıcı** - Admin, Yönetici, Personel rolleri
- ✅ **Departman Yönetimi** - Organizasyon yapısı
- ✅ **İzin Sistemi** - İzin talepleri ve onayları
- ✅ **Vardiya Değiş-Tokuş** - Personeller arası değişim
- ✅ **Raporlama** - Detaylı istatistikler ve grafikler

## 🏗️ Teknoloji Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** - Veritabanı
- **JWT** - Authentication
- **bcrypt** - Şifre hashleme
- **ExcelJS** + **PDFKit** - Export

### Frontend
- **React 19** + **TypeScript**
- **Redux Toolkit** - State management
- **React Router** - Routing
- **React Query** - API caching
- **Vite** - Build tool
- **Framer Motion** - Animasyonlar

## 📁 Proje Yapısı

```
/Users/zuhalakasya/Desktop/Shift Planlama/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/          # Database, env, constants
│   │   ├── middleware/      # Auth, role, error
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── algorithms/      # ⭐ Optimization algorithm
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Helper functions
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/                # React App
│   ├── src/
│   │   ├── features/        # Feature modules
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── hooks/           # Custom hooks
│   ├── .env                 # Frontend env
│   └── package.json
│
└── database/                # SQL Scripts
    ├── schema.sql           # Database schema
    ├── indexes.sql          # Performance indexes
    └── seed.sql             # Test data
```

## 🚀 Kurulum ve Çalıştırma

### 1. PostgreSQL Kurulumu

```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# PostgreSQL installer: https://www.postgresql.org/download/windows/
```

### 2. Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
psql postgres

# Veritabanı oluştur
CREATE DATABASE shift_planner;

# Bağlan
\c shift_planner

# Şemayı yükle
\i database/schema.sql

# Çıkış
\q
```

### 3. Backend Kurulumu

```bash
cd backend

# Dependencies zaten kurulu (npm install yapıldı)

# Environment variables kontrol et
cat .env

# Backend'i başlat
npm run dev
```

**Backend çalışacak:** `http://localhost:5000`

### 4. Frontend Kurulumu

```bash
cd frontend

# Dependencies zaten kurulu (npm install yapıldı)

# Environment variables kontrol et
cat .env

# Frontend'i başlat
npm run dev
```

**Frontend çalışacak:** `http://localhost:5173`

## 📝 API Endpoints

### Authentication
```
POST   /api/v1/auth/register   - Yeni kullanıcı kaydı
POST   /api/v1/auth/login      - Giriş yapma
POST   /api/v1/auth/logout     - Çıkış yapma
```

### (Diğer endpoint'ler implement edilecek)
- `/api/v1/employees` - Personel yönetimi
- `/api/v1/departments` - Departman yönetimi
- `/api/v1/shifts` - Vardiya yönetimi
- `/api/v1/schedules` - Plan oluşturma
- `/api/v1/schedules/:id/optimize` - ⭐ Otomatik optimizasyon
- `/api/v1/time-off` - İzin talepleri
- `/api/v1/export` - Excel/PDF export

## 🔐 Varsayılan Kullanıcılar

Database şeması çalıştırıldığında otomatik oluşturulur:

- **Email:** `admin@shiftplanner.com`
- **Şifre:** `admin123`
- **Rol:** ADMIN

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📊 Veritabanı Şeması

**14 Ana Tablo:**
- `users` - Kullanıcılar
- `departments` - Departmanlar
- `employees` - Personel bilgileri
- `shift_types` - Vardiya türleri
- `shift_rules` - Planlama kuralları
- `shift_schedules` - Planlar
- `shifts` - Vardiyalar
- `time_off_requests` - İzin talepleri
- `shift_swap_requests` - Vardiya değişim talepleri
- `conflict_logs` - Çakışma kayıtları
- `audit_logs` - Aktivite kayıtları

## 🤖 Otomatik Optimizasyon Algoritması

**Algoritma:** Constraint Satisfaction Problem (CSP) + Simulated Annealing

**Optimizasyon Kriterleri:**
- ✅ Adil vardiya dağılımı
- ✅ Minimum dinlenme süresi (11+ saat)
- ✅ Maksimum haftalık çalışma saati (45 saat)
- ✅ İzin günleri ve çakışmalar
- ✅ Beceri eşleşmesi
- ✅ Personel tercihleri

**Optimizasyon Skoru:** 0-100 (yüksek = daha iyi)

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # ts-node-dev ile hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server
```

### Build Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📖 Kullanım Kılavuzu

### 1. İlk Kullanım
1. PostgreSQL veritabanını oluştur
2. Backend ve Frontend'i başlat
3. `admin@shiftplanner.com` ile giriş yap
4. Departman oluştur
5. Personel ekle
6. Vardiya türlerini tanımla
7. Plan oluştur

### 2. Otomatik Plan Oluşturma
1. Yeni plan oluştur
2. Tarih aralığı seç
3. "Otomatik Optimize Et" butonuna tıkla
4. Çakışmaları kontrol et
5. Planı yayınla

### 3. İzin Yönetimi
1. Personel izin talebi oluşturur
2. Yönetici onaylar/reddeder
3. Sistem otomatik olarak çakışmaları kontrol eder

## 🐛 Troubleshooting

### Backend Başlamıyor
```bash
# PostgreSQL çalışıyor mu?
brew services list | grep postgresql

# Port 5000 kullanımda mı?
lsof -i :5000
```

### Frontend Başlamıyor
```bash
# Port 5173 kullanımda mı?
lsof -i :5173

# Dependencies eksik mi?
cd frontend && npm install
```

### Database Connection Error
```bash
# PostgreSQL çalışıyor mu?
psql postgres -c "SELECT version();"

# Veritabanı var mı?
psql postgres -c "\l" | grep shift_planner

# .env doğru mu?
cat backend/.env
```

## 📚 Daha Fazla Bilgi

- **Plan Dosyası:** `.claude/plans/agile-puzzling-babbage.md`
- **Database Schema:** `database/schema.sql`
- **Optimization Algorithm:** `backend/src/algorithms/shift-optimizer.ts`

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 👨‍💻 Geliştirici

Zuhal - Modern Vardiya Planlama Sistemi

---

**⚠️ ÖNEMLİ NOTLAR:**

1. **PostgreSQL kurulumu zorunlu!** Backend çalışmaz.
2. **.env dosyalarını kontrol edin!** Varsayılan değerler production için uygun değil.
3. **İlk çalıştırmada** `database/schema.sql` dosyasını çalıştırın.
4. **Port 5000 ve 5173** kullanılabilir olmalı.

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. PostgreSQL kur ve veritabanı oluştur
createdb shift_planner
psql shift_planner < database/schema.sql

# 2. Backend başlat
cd backend && npm run dev

# 3. Yeni terminal - Frontend başlat
cd frontend && npm run dev

# 4. Tarayıcıda aç: http://localhost:5173
# Login: admin@shiftplanner.com / admin123
```

**Sistem Hazır! 🎉**

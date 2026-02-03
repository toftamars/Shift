# Mimari ve Kurallar

Refactor ihtiyacını azaltmak için tuttuğumuz yapı ve kurallar.

---

## Genel ilkeler

- **Tek sorumluluk:** Her route dosyası tek kaynak (employees, departments, shifts…). Her sayfa tek ekran. Modal’lar tek iş (ekle/düzenle).
- **Ortak tipler:** `frontend/src/types`, API cevapları bu tiplere uyumlu.
- **API tek yerde:** Tüm HTTP çağrıları `frontend/src/services/api.ts` üzerinden; backend route’lar `backend/src/routes/`.

---

## Backend

- **Route’lar:** `routes/*.routes.ts` — GET/POST tek dosyada, `router.get`, `router.post`.
- **Auth:** Tüm korumalı route’lar `authenticate` middleware ile; token `Authorization: Bearer`.
- **Veritabanı:** `config/database` + `query()`; ham SQL, ORM yok.
- **Hata:** `res.status(4xx|5xx).json({ error: 'mesaj' })` tek format.

---

## Frontend

- **Sayfalar:** `pages/*Page.tsx` — ekran başına bir dosya; liste + modal varsa aynı sayfada.
- **API:** `api.ts` içinde `xxxApi.list`, `xxxApi.create` vb.; sayfalar doğrudan `api.get/post` kullanmaz.
- **State:** Liste için `useState` + `useEffect` (veya ileride React Query); global state sadece auth (Redux).
- **Stil:** CSS değişkenleri (`var(--panel)`, `var(--border)`); inline style sadece layout/spacing için gerekirse.

---

## Veritabanı ilişkileri

- `users` ← Supabase Auth senkron (trigger).
- `employees.user_id` → `users.id`; personel listesi `users` + `employees` join.
- `departments` bağımsız; `employees.department_id` → `departments.id`.
- `shifts` → `employees`, `shift_types`; `schedule_id` opsiyonel.

Yeni tablo/kolon eklerken mevcut ilişkilere uy; gerekirse migration notu `database/` altına yaz.

---

## Yeni özellik eklerken

1. Backend: Yeni route veya mevcut route’a yeni method; aynı hata/response formatı.
2. Frontend: `api.ts`’e yeni metod; sayfa veya mevcut sayfaya modal/form.
3. Tip: API cevabı için `types` veya en azından ilgili sayfa/component’te interface.

Bu düzeni korursan büyük refactor ihtiyacı azalır; değişiklikler hep aynı kalıba oturur.

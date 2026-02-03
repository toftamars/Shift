# Canlıya Alma: Vercel + Supabase (Supabase Auth)

**Canlı adres:** https://shift-mauve.vercel.app

- **Vercel** – Frontend + API (serverless)
- **Supabase** – PostgreSQL + **Supabase Authentication** (giriş/kayıt)
- **Otomatik deploy:** Vercel’de projeyi Git repo’nuzla bağlayın; her `git push` sonrası otomatik deploy olur (bkz. §3).

---

## 1. Supabase

**Proje URL:** https://iggymtcteabswsrginyi.supabase.co

### 1.1 Veritabanı şeması
1. **SQL Editor** → **New query** → `database/schema.sql` içeriğini yapıştır → **Run**
2. Sonra **`database/supabase-auth-sync.sql`** içeriğini yapıştır → **Run** (Supabase Auth ile `public.users` senkronu + `password_hash` nullable)

### 1.2 Kullanıcı ekleme (Supabase Auth)
1. **Authentication** → **Users** → **Add user** → **Create new user**
2. **Email** ve **Password** gir → **Create**
3. Giriş artık bu e‑posta/şifre ile yapılır (Dashboard’da eklediğin kullanıcılar geçerli).

### 1.3 Vercel’de kullanılacak değerler
- **Settings** → **Database** → Connection string → Vercel’de `DATABASE_URL`
- **Settings** → **API** → **Project URL** → Vercel’de `VITE_SUPABASE_URL`
- **Settings** → **API** → **anon public** → Vercel’de `VITE_SUPABASE_ANON_KEY`
- **Settings** → **API** → **JWT Secret** → Vercel’de `SUPABASE_JWT_SECRET`

---

## 2. Vercel

1. **Root Directory** boş (repo kökü).
2. **Build Command:** `npm run build` | **Output Directory:** `frontend/dist`
3. **Environment Variables:** (VITE_* değişkenleri build sırasında gömülür; ekledikten sonra mutlaka **Redeploy** yapın)

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Supabase connection string (pooler URI) |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `VITE_SUPABASE_URL` | `https://iggymtcteabswsrginyi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** (zorunlu, yoksa "supabaseKey is required" hatası) |

4. **Save** → **Redeploy**

---

## 3. Deploy

### Manuel (tek seferlik)
Repo kökünden:
```bash
npx vercel deploy --prod
```

### Otomatik deploy (her değişiklikte)

1. **Vercel** → Projeniz (shift) → **Settings** → **Git**
2. **Connect Git Repository** ile GitHub/GitLab/Bitbucket repo’nuzu bağlayın.
3. **Production Branch** olarak `main` (veya kullandığınız branch) seçili kalsın.
4. Bundan sonra bu branch’e her **push** yaptığınızda Vercel otomatik production deploy yapar.

Yani: `git add .` → `git commit -m "..."` → `git push` = otomatik deploy.

---

## 4. Test

1. https://shift-mauve.vercel.app adresini aç
2. **Supabase Dashboard → Authentication → Users** içinde eklediğin e‑posta/şifre ile giriş yap

---

## Notlar

- Giriş/kayıt **Supabase Auth** ile yapılır; eski custom JWT auth kaldırıldı.
- Kullanıcı eklemek için **Supabase → Authentication → Users → Add user** kullan.
- `database/supabase-auth-sync.sql` çalıştırılmadan API’deki `public.users` senkronu tam olmaz; şemayı yükledikten sonra bu dosyayı da çalıştır.

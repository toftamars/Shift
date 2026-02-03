# Çalışan (Personel) Nasıl Eklenir?

Çalışanlar **iki adımda** eklenir: önce Supabase Auth’ta kullanıcı, sonra veritabanında `employees` kaydı.

---

## 1. Supabase Auth’ta kullanıcı ekle

1. **Supabase Dashboard** → [supabase.com](https://supabase.com) → projeni seç.
2. Sol menüden **Authentication** → **Users**.
3. **Add user** → **Create new user**.
4. **Email** ve **Password** gir.
5. **User Metadata** (opsiyonel):  
   - `full_name`: Ad Soyad  
   - `role`: `ADMIN`, `MANAGER` veya `EMPLOYEE`
6. **Create user** ile kaydet.

Bu adım `public.users` tablosuna otomatik satır ekler (trigger sayesinde).  
Yeni kullanıcının **UUID**’sini not al; bir sonraki adımda `user_id` olarak kullanacaksın.  
(Users listesinde satıra tıklayıp **UID** kopyalayabilirsin.)

---

## 2. Veritabanında çalışan kaydı ekle

1. **Supabase Dashboard** → **SQL Editor** → **New query**.
2. Aşağıdaki SQL’de yerleri doldurup çalıştır:

```sql
-- Önce bir departman yoksa ekle (bir kez; zaten varsa bu satırı atla)
INSERT INTO departments (name, description)
SELECT 'Genel', 'Varsayılan departman'
WHERE NOT EXISTS (SELECT 1 FROM departments LIMIT 1);

-- Çalışan ekle: USER_ID yerine Auth’tan aldığın UUID’yi yaz
INSERT INTO employees (user_id, department_id, employee_code, hire_date)
SELECT
  'USER_ID_BURAYA'::uuid,
  (SELECT id FROM departments LIMIT 1),
  'SICIL001',           -- Benzersiz sicil no (örn. SICIL002, SICIL003)
  CURRENT_DATE;
```

- `USER_ID_BURAYA`: Auth’ta oluşturduğun kullanıcının **UID**’si.
- `SICIL001`: Benzersiz bir sicil numarası (her çalışan için farklı).
- `departments` zaten doluysa ikinci blok yeterli.

---

## 3. Kontrol

- Uygulamada **Personel** sayfasına git; yeni çalışan listede görünmeli.
- Planlama ekranında vardiya eklerken bu personel seçilebilir.

---

## Özet

| Nerede              | Ne yapıyorsun                    |
|---------------------|-----------------------------------|
| **Auth → Users**    | Email + şifre ile kullanıcı ekle |
| **SQL Editor**      | `employees` tablosuna satır ekle (`user_id` + sicil + departman) |

İleride uygulama içinde “Çalışan Ekle” ekranı eklenirse bu adımlar arayüzden yapılabilecek.

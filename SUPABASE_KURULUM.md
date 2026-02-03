# 🔥 Supabase ile Kolay Kurulum Kılavuzu

**Bilgisayarınıza hiçbir şey kurmadan 5 dakikada hazır!**

---

## ✅ ADIM 1: Supabase Hesabı Aç (2 dakika)

1. **Web sitesine git:**
   ```
   https://supabase.com/
   ```

2. **"Start your project" butonuna tıkla**

3. **Giriş yap:**
   - GitHub ile giriş yap (önerilen)
   - veya Email ile kayıt ol

4. ✅ Ücretsiz hesap açıldı! (Kredi kartı gerekmez)

---

## 🚀 ADIM 2: Yeni Proje Oluştur (2 dakika)

1. **"New Project" butonuna tıkla**

2. **Bilgileri doldur:**
   - **Name:** `shift-planner`
   - **Database Password:** Güçlü bir şifre seç (ÖNEMLİ: KAYDET!)
     - Örnek: `MySecure123Password!`
   - **Region:** `Frankfurt` (Türkiye'ye en yakın)
   - **Pricing Plan:** `Free` (0$) seçili olmalı

3. **"Create new project" butonuna tıkla**

4. ⏳ **2-3 dakika bekle** (Proje hazırlanıyor...)

5. ✅ Proje hazır!

---

## 📊 ADIM 3: Veritabanı Şemasını Yükle (1 dakika)

### Yöntem A: SQL Editor ile (Kolay)

1. **Supabase Dashboard'da:**
   - Sol menüden **"SQL Editor"** tıkla

2. **"New query" tıkla**

3. **Şemayı kopyala:**
   - Bilgisayarındaki `/Users/zuhalakasya/Desktop/Shift Planlama/database/schema.sql` dosyasını aç
   - **TÜM içeriği kopyala** (Cmd+A, Cmd+C)

4. **SQL Editor'e yapıştır** (Cmd+V)

5. **"Run" butonuna tıkla** (veya Cmd+Enter)

6. ✅ Başarılı! Tüm tablolar oluşturuldu

### Yöntem B: psql ile (Terminal)

```bash
# Supabase connection string'i al (ADIM 4'te gösterilecek)
# Sonra:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres" < database/schema.sql
```

---

## 🔗 ADIM 4: Connection String'i Al ve Backend'e Ekle (1 dakika)

### 1. Connection String'i Al:

1. **Supabase Dashboard'da:**
   - Sol altta **⚙️ Settings** tıkla
   - **Database** tıkla

2. **"Connection string" bölümünde:**
   - **"URI"** seçeneğini seç (varsayılan)
   - Connection string'i kopyala

   Şuna benzer olacak:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

3. **`[YOUR-PASSWORD]`** yazan yeri kendi şifrenle değiştir

### 2. Backend .env Dosyasını Güncelle:

1. **Dosyayı aç:**
   ```
   /Users/zuhalakasya/Desktop/Shift Planlama/backend/.env
   ```

2. **`DATABASE_URL=` satırını güncelle:**
   ```env
   DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```

3. **Dosyayı kaydet**

---

## 🎯 ADIM 5: Sistemi Başlat ve Test Et

### Backend'i Başlat:

```bash
cd "/Users/zuhalakasya/Desktop/Shift Planlama/backend"
npm run dev
```

✅ **Başarılı mesajları göreceksin:**
```
✅ PostgreSQL bağlantısı başarılı
🚀 Server çalışıyor: http://localhost:5000
```

### Frontend'i Başlat (Yeni terminal):

```bash
cd "/Users/zuhalakasya/Desktop/Shift Planlama/frontend"
npm run dev
```

✅ **Frontend başladı:**
```
➜  Local:   http://localhost:5173/
```

### Tarayıcıda Aç:

```
http://localhost:5173
```

---

## 🎉 TAMAMLANDI!

Artık sisteminiz çalışıyor ve **Supabase cloud veritabanına** bağlı!

---

## 📊 Supabase Dashboard Özellikleri

### Table Editor
- Tabloları görsel olarak düzenle
- Verileri ekle/sil/güncelle
- Excel gibi arayüz

### SQL Editor
- SQL sorguları çalıştır
- Veritabanını yönet

### Authentication (İleride kullanabilirsin)
- Kullanıcı girişi hazır
- Google, GitHub login entegrasyonu

### Storage (İleride kullanabilirsin)
- Dosya yükleme/indirme
- Kullanıcı profil fotoğrafları

---

## 🔒 Güvenlik Notları

1. **Database şifreni kimseyle paylaşma**
2. **Connection string'i GitHub'a push etme**
3. **`.env` dosyası `.gitignore`'da olmalı** (zaten ekli)

---

## 🐛 Sorun Giderme

### "connection refused" hatası

**Çözüm:** Connection string doğru mu kontrol et
```bash
# Test et:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres" -c "SELECT version();"
```

### "password authentication failed"

**Çözüm:** Şifre yanlış
- Supabase Settings → Database → Reset database password
- Yeni şifreyi .env'e yaz

### "too many connections"

**Çözüm:** Supabase free plan 60 connection limit var
```bash
# Backend'i yeniden başlat
cd backend
npm run dev
```

---

## 💰 Ücretsiz Limitler (Bol bol yeter!)

| Özellik | Free Plan |
|---------|-----------|
| Database | 500 MB |
| Bandwidth | 2 GB |
| Storage | 1 GB |
| Monthly Users | 50,000 |
| API Requests | Unlimited |

**Notun için ÇOK fazlası!** 🎉

---

## 🆚 Supabase vs Local PostgreSQL

| Özellik | Supabase | Local PostgreSQL |
|---------|----------|------------------|
| Kurulum | ✅ 5 dakika | ❌ 30+ dakika |
| Maliyet | ✅ Ücretsiz | ✅ Ücretsiz |
| Bilgisayara kurulum | ✅ Gerek yok | ❌ Gerekli |
| Uzaktan erişim | ✅ Her yerden | ❌ Sadece bilgisayarından |
| Backup | ✅ Otomatik | ❌ Manuel |
| GUI | ✅ Web dashboard | ⚠️ Ek program gerekir |

---

## 🔗 Faydalı Linkler

- **Supabase Dashboard:** https://app.supabase.com/
- **Documentation:** https://supabase.com/docs
- **SQL Tutorial:** https://supabase.com/docs/guides/database
- **Support:** https://supabase.com/support

---

## 📞 Yardım

Sorun mu yaşıyorsun? Bana sor! 🚀

**Şimdi yapman gereken:**
1. ✅ Supabase hesabı aç
2. ✅ Proje oluştur
3. ✅ Şemayı yükle
4. ✅ Connection string'i backend/.env'e ekle
5. ✅ Backend ve Frontend'i başlat
6. 🎉 Tadını çıkar!

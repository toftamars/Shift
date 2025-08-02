# Shift Management - Odoo Modülü

Bu modül, Odoo için geliştirilmiş kapsamlı bir vardiya yönetimi sistemidir.

## 🎯 Özellikler

### 📊 Analitik Hesap Entegrasyonu
- Analitik hesap seçimi zorunlu
- Seçilen analitik hesaba bağlı personel listesi
- Analitik hesaba bağlı vardiya yönetimi
- Personel sayısı ve vardiya sayısı takibi

### 🏢 Departman Yönetimi
- Manuel departman ataması
- Analitik hesaba bağlı departmanlar
- Departman bazlı personel yönetimi
- Departman kodu ve açıklama alanları

### ⏰ Vardiya Yönetimi
- Sabah, öğleden sonra, gece ve özel vardiyalar
- Çalışan atamaları
- Vardiya durumu takibi (Taslak → Onaylandı → Devam Ediyor → Tamamlandı)
- Takvim görünümü
- Otomatik süre hesaplama

### 👥 Çalışan Yönetimi
- Tercih edilen vardiya tipi
- Haftalık maksimum çalışma saati
- Bu hafta çalışılan saat hesaplama
- Vardiya geçmişi görüntüleme

## 📋 Kurulum

1. **Modülü Odoo'ya Kopyalayın**:
   ```bash
   cp -r /path/to/Shift /path/to/odoo/addons/
   ```

2. **Odoo'da Modülü Yükleyin**:
   - Odoo'ya giriş yapın
   - Ayarlar → Modüller → Güncelleme Listesi
   - "Shift Management" modülünü bulun ve yükleyin

## 🔧 Bağımlılıklar

- `base` - Temel Odoo modülü
- `hr` - İnsan Kaynakları modülü
- `hr_attendance` - Devam takibi modülü
- `analytic` - Analitik hesap modülü

## 📁 Dosya Yapısı

```
Shift/
├── __manifest__.py          # Modül manifest dosyası
├── __init__.py             # Ana modül başlatıcı
├── README.md               # Proje dokümantasyonu
├── .gitignore              # Git ignore dosyası
├── models/
│   ├── __init__.py         # Model başlatıcı
│   ├── shift.py           # Ana vardiya modeli
│   ├── hr_employee.py     # Çalışan modeli genişletme
│   ├── analytic_account.py # Analitik hesap genişletme
│   └── department.py      # Departman modeli
├── views/
│   ├── __init__.py        # View başlatıcı
│   ├── shift_views.xml    # Vardiya view'ları
│   ├── hr_employee_views.xml # Çalışan view genişletme
│   ├── department_views.xml # Departman view'ları
│   └── menu_views.xml     # Menü yapısı
├── security/
│   └── ir.model.access.csv # Güvenlik erişim kuralları
└── demo/
    └── shift_demo.xml     # Demo veriler
```

## 🎨 Kullanım

### Analitik Hesap Seçimi
1. Vardiya oluştururken analitik hesap seçin
2. Seçilen analitik hesaba bağlı departmanlar listelenir
3. Departman seçin
4. Analitik hesaba bağlı personeller listelenir
5. Personel ataması yapın

### Departman Yönetimi
1. "Departmanlar" menüsünden yeni departman oluşturun
2. Analitik hesap seçin
3. Departman kodu ve açıklama girin
4. Personel ataması yapın

### Vardiya Yönetimi
1. "Vardiyalar" menüsünden yeni vardiya oluşturun
2. Analitik hesap ve departman seçin
3. Vardiya tipi ve saatleri belirleyin
4. Personel ataması yapın
5. Vardiya durumunu güncelleyin

## 🔒 Güvenlik

- Departman modeli için güvenlik kuralları
- Kullanıcı ve yönetici seviyesi erişim hakları
- Analitik hesap bazlı erişim kontrolü

## 📈 Menü Yapısı

- **Vardiya Yönetimi** (Ana Menü)
  - **Vardiyalar** (Vardiya listesi)
  - **Departmanlar** (Departman yönetimi)
- **İnsan Kaynakları** → **Vardiya Yönetimi**
  - **Vardiyalar**
  - **Departmanlar**

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje LGPL-3 lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

- **GitHub**: [toftamars](https://github.com/toftamars)
- **Repository**: [https://github.com/toftamars/Shift.git](https://github.com/toftamars/Shift.git) 
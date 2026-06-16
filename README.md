# HoMenu - Malzemelerinizle Yemek Tarifleri Bulun

HoMenu, evinizde bulunan malzemeleri girerek hazırlayabileceğiniz en uygun yemek tariflerini bulmanızı sağlayan modern ve şık bir web uygulamasıdır.

## 🚀 Teknolojik Altyapı

* **Frontend/Backend:** Next.js (App Router, Server & Client Components)
* **Veritabanı:** Supabase (PostgreSQL)
* **ORM:** Prisma
* **Kimlik Doğrulama:** NextAuth.js & bcrypt
* **Tasarım & Styling:** TailwindCSS v4 (Modern HSL renk paleti ve premium pürüzsüz animasyonlar)

---

## 🌟 Öne Çıkan Özellikler

1. **Malzeme Tabanlı Arama:** Virgülle ayrılmış malzemelerle AND (Tümünü içeren) ve OR (Herhangi birini içeren) mantığıyla gelişmiş arama motoru.
2. **Kullanıcı Kayıt/Giriş (Auth):** NextAuth ile güvenli kimlik doğrulama.
3. **Dinamik Tarif Ekleme:** Malzemelerin, ölçülerin ve yapılış adımlarının dinamik formlarla kolayca eklendiği arayüz.
4. **Tarif Detay ve Porsiyon Ölçeklendirme:** Kişi sayısına göre malzemelerin miktarını dinamik hesaplayan ölçeklendirme algoritması.
5. **Favori Sistemi:** Gerçek zamanlı kalp butonu etkileşimi ve kişiselleştirilmiş "Favorilerim" panosu.
6. **Gizlilik Yönetimli Profil Sayfası:** Kullanıcının eklediği ve beğendiği tarifleri listelemesinin yanında, profilinin ve verilerinin gizlilik düzeyini yönetebildiği panel.

---

## 📁 Proje Yapısı

```text
homenu/
├── generated/           # Prisma Client generated files
│   └── prisma/
├── homenu/              # Next.js uygulama kodları
│   ├── prisma/          # Şema tanımı ve göçler (migrations)
│   ├── public/          # Statik varlıklar (görseller, ikonlar)
│   └── src/
│       ├── app/         # Sayfalar, API rotaları ve düzenler
│       └── components/  # Yeniden kullanılabilir UI bileşenleri
├── prisma/              # Kök düzey veritabanı yapılandırması
├── .gitignore           # Git tarafından yoksayılacak dosyalar
└── README.md            # Proje bilgilendirme dosyası
```

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
cd homenu/homenu
npm install
```

### 2. Çevre Değişkenlerini Tanımlayın

`homenu/homenu` dizininde bir `.env` dosyası oluşturun (bu dosya git tarafından yoksayılır) ve Supabase PostgreSQL bağlantı bilgilerinizi ekleyin:

```env
DATABASE_URL="postgresql://kullanici:sifre@host:port/veritabani?pgbouncer=true"
NEXTAUTH_SECRET="en-az-32-karakterli-guvenli-bir-anahtar"
```

### 3. Veritabanı Şemasını Eşitleyin (Prisma)

Şemayı veritabanına uygulamak ve Prisma Client'ı oluşturmak için:

```bash
# Şemayı güncellemek ve client üretmek için
npx prisma generate
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulamaya tarayıcınızdan `http://localhost:3000` adresinden erişebilirsiniz.

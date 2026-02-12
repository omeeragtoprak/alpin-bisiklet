# Alpin Bisiklet - E-Ticaret Platformu

Modern, profesyonel ve tam özellikli bisiklet e-ticaret platformu. Next.js 16, React 19, TypeScript ve Prisma ile geliştirilmiştir.

## 🚀 Özellikler

### 🛍️ Müşteri Tarafı
- **Ürün Kataloğu**: Gelişmiş filtreleme, arama ve sıralama
- **Ürün Detay**: Görsel galeri, stok durumu, teknik özellikler
- **Alışveriş Sepeti**: Gerçek zamanlı sepet yönetimi
- **Kullanıcı Hesabı**: Sipariş geçmişi, adres yönetimi, favoriler
- **Güvenli Ödeme**: iyzico entegrasyonu (sandbox)
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **3D Animasyonlar**: Motion ile profesyonel animasyonlar

### 👨‍💼 Admin Paneli
- **Dashboard**: Satış istatistikleri, düşük stok uyarıları, son sipariş
- **Ürün Yönetimi**: CRUD operasyonları, çoklu görsel yükleme
- **Barkod Sistemi**: EAN-13 barkod ile hızlı ürün arama/güncelleme
- **Sipariş Yönetimi**: Sipariş takibi, durum güncelleme
- **Kategori & Marka**: Organize edilmiş ürün yapısı
- **Müşteri Yönetimi**: Kullanıcı listesi ve detayları
- **Kupon Sistemi**: İndirim kuponları oluşturma ve yönetme
- **Banner Yönetimi**: Ana sayfa banner düzenleme
- **Raporlama**: Satış raporları ve analizler

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript 5.x
- **Stil**: Tailwind CSS 4, shadcn/ui
- **Veritaşbanı**: Prisma ORM (SQLite - geliştirme, PostgreSQL - production)
- **Kimlik Doğrulama**: Better Auth (rol tabanlı: ADMIN/CUSTOMER)
- **State Yönetimi**: TanStack Query v5
- **Form Yönetimi**: react-hook-form + Zod validasyonu
- **Animasyonlar**: Motion (framer-motion)
- **Ödeme**: iyzico (sandbox mode)
- **Tablo**: TanStack Table
- **İkonlar**: Lucide React

## 📦 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd alpin-bisiklet
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
# veya
pnpm install
# veya
yarn install
```

### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyasını oluşturun:

```env
# Database
DATABASE_URL="file:./dev.db"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# iyzico (Sandbox)
IYZICO_API_KEY="sandbox-api-key"
IYZICO_SECRET_KEY="sandbox-secret-key"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"
```

### 4. Veritabanını Hazırlayın

```bash
# Prisma client oluştur
npx prisma generate

# Veritabanını push et
npx prisma db push

# (Opsiyonel) Prisma Studio ile veritabanını görüntüle
npx prisma studio
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🎯 Kullanım

### İlk Admin Kullanıcısı Oluşturma

1. `/kayit` sayfasından kayıt olun
2. Veritabanında kullanıcının `role` alanını `ADMIN` olarak güncelleyin:

```bash
# Prisma Studio ile
npx prisma studio

# Veya SQL ile
sqlite3 prisma/dev.db
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

3. Admin paneline `/admin` adresinden giriş yapın

### Ürün Ekleme

1. Admin panelinde **Ürünler > Yeni Ürün** menüsüne gidin
2. Ürün bilgilerini doldurun:
   - Ürün adı, açıklama
   - Fiyat, stok miktarı
   - Kategori, marka
   - Görseller (çoklu yükleme)
   - Barkod (EAN-13 formatı)
3. **Kaydet** butonuna tıklayın

### Barkod Okuyucu Kullanımı

1. **Barkod** menüsüne gidin
2. 13 haneli EAN-13 barkodu girin veya tarayın
3. Ürün bulunursa, fiyat ve stok hızlı güncelleme yapabilirsiniz

### Sipariş Akışı

1. **Müşteri**: Ürünleri sepete ekler
2. **Sepet**: Ürün miktarlarını düzenler, kupon kodu uygular
3. **Ödeme**: iyzico ile güvenli ödeme
4. **Admin**: Sipariş durumunu günceller (Beklemede → Hazırlanıyor → Kargoda → Teslim Edildi)

## 📁 Proje Yapısı

```
alpin-bisiklet/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   └── dev.db                 # SQLite veritabanı
├── public/
│   └── uploads/               # Yüklenen görseller
├── src/
│   ├── app/
│   │   ├── (store)/          # Müşteri tarafı sayfalar
│   │   │   ├── page.tsx      # Ana sayfa
│   │   │   ├── urunler/      # Ürün listeleme
│   │   │   ├── sepet/        # Alışveriş sepeti
│   │   │   ├── giris/        # Giriş
│   │   │   ├── kayit/        # Kayıt
│   │   │   └── hesabim/      # Kullanıcı hesabı
│   │   ├── admin/            # Admin paneli
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── urunler/      # Ürün yönetimi
│   │   │   ├── barkod/       # Barkod okuyucu
│   │   │   └── siparisler/   # Sipariş yönetimi
│   │   └── api/              # API routes
│   │       ├── products/     # Ürün API'leri
│   │       ├── cart/         # Sepet API'leri
│   │       ├── orders/       # Sipariş API'leri
│   │       └── auth/         # Better Auth
│   ├── components/
│   │   ├── admin/            # Admin bileşenleri
│   │   ├── store/            # Müşteri bileşenleri
│   │   ├── animations/       # 3D animasyon bileşenleri
│   │   └── ui/               # shadcn/ui bileşenleri
│   └── lib/
│       ├── prisma.ts         # Prisma client
│       ├── auth.ts           # Better Auth config
│       ├── upload.ts         # Dosya yükleme
│       └── validations.ts    # Zod şemaları
├── .env                      # Ortam değişkenleri
├── tailwind.config.ts        # Tailwind yapılandırması
└── package.json
```

## 🎨 Tema ve Renkler

Proje mavi (#3B82F6) ve turuncu (#F97316) renk paletini kullanır:

- **Primary (Mavi)**: `oklch(0.62 0.21 262)` - #3B82F6
- **Accent (Turuncu)**: `oklch(0.70 0.19 45)` - #F97316

Tailwind sınıfları ile kullanım:
```jsx
<div className="bg-primary text-primary-foreground">Mavi Arka Plan</div>
<div className="bg-accent text-accent-foreground">Turuncu Arka Plan</div>
```

## 🔒 Güvenlik

- **CSRF Koruması**: Better Auth ile otomatik
- **SQL Injection**: Prisma ORM ile güvenli sorgular
- **XSS Koruması**: React'in otomatik escape mekanizması
- **Dosya Yükleme**: Tip ve boyut kontrolleri
- **Rol Tabanlı Erişim**: Admin rotaları korumalı

## 🚀 Production'a Geçiş

### PostgreSQL Kurulumu

1. `.env` dosyasını güncelleyin:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/alpinbisiklet?schema=public"
```

2. `prisma/schema.prisma` dosyasında provider'ı değiştirin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Migration çalıştırın:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Ortam Değişkenleri

Production için `.env.production` oluşturun ve tüm değişkenleri production değerleriyle güncelleyin.

### Build ve Deploy

```bash
# Production build
npm run build

# Production'da çalıştır
npm start
```

## 📱 Animasyonlar

Projede kullanılan 3D animasyon bileşenleri:

```jsx
import {
  ParallaxCard,
  FloatingElement,
  TiltCard,
  StaggerContainer,
  StaggerItem,
  ScaleOnHover,
  SlideIn,
} from "@/components/animations";

// Kullanım
<ParallaxCard className="...">İçerik</ParallaxCard>
<FloatingElement delay={0.2}>Süzülen Eleman</FloatingElement>
<TiltCard>3D Eğimli Kart</TiltCard>
```

## 📊 Veritabanı Modelleri

- **User**: Kullanıcı hesapları (ADMIN/CUSTOMER)
- **Product**: Ürünler
- **Category**: Kategoriler
- **Brand**: Markalar
- **Cart**: Alışveriş sepeti
- **Order**: Siparişler
- **OrderItem**: Sipariş kalemleri
- **Payment**: Ödeme bilgileri
- **Coupon**: İndirim kuponları
- **Banner**: Ana sayfa banner'ları
- **Address**: Kullanıcı adresleri
- **Favorite**: Favori ürünler
- **Review**: Ürün yorumları

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**Alpin Bisiklet** ile güçlendirilmiştir 🚴‍♂️

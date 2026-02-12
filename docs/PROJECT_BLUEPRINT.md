# Alpin Bisiklet — Tam Proje Dokümantasyonu

> **Son güncelleme:** 2026-02-12
> Bu doküman, projenin tüm katmanlarını, yapısını, kurallarını ve iş mantığını bir başka yapay zeka modelinin veya geliştiricinin tam olarak anlayabilmesi için yazılmıştır.

---

## 1. Genel Bakış

**Alpin Bisiklet**, profesyonel bisiklet ve aksesuar satışı yapan bir **e-ticaret platformudur**. Hem müşterilere yönelik bir online mağaza hem de site yöneticilerine yönelik tam kapsamlı bir admin paneli içerir.

| Özellik | Detay |
|---------|-------|
| **Proje türü** | Full-stack monorepo (tek proje) |
| **Dil** | TypeScript (strict) |
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) |
| **React** | 19.2.3 (Server & Client Components) |
| **Veritabanı** | PostgreSQL 16, Prisma ORM v7.3 (client engine + PrismaPg adapter) |
| **Cache** | Redis 3.0.504 (ioredis) |
| **Auth** | better-auth v1.4 (email/password, session, admin plugin) |
| **Stil** | Tailwind CSS v4, CSS Variables, shadcn/ui |
| **State** | Zustand (client), TanStack Query v5 (server) |
| **Form** | React Hook Form v7 + Zod v4 |
| **Animasyon** | Motion (Framer Motion) v12, Three.js + R3F |
| **Ödeme** | Iyzico (sandbox altyapısı hazır) |
| **Lint/Format** | Biome |
| **Paket Yöneticisi** | npm |

---

## 2. Klasör Yapısı

```
alpin-bisiklet/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması (605 satır, 30+ model)
│   └── seed-admin.ts          # Admin kullanıcı seed scripti
├── prisma.config.ts           # Prisma v7 yapılandırması (datasource URL)
├── next.config.ts             # Next.js config (strict, AVIF/WebP, no poweredBy)
├── biome.json                 # Linter/formatter ayarları
├── components.json            # shadcn/ui yapılandırması
├── package.json               # Bağımlılıklar ve scriptler
├── .env                       # Ortam değişkenleri
├── docs/
│   └── MEMORY.md              # Proje kuralları ve konvansiyonlar (1500 satır)
├── public/                    # Statik dosyalar
│   └── uploads/               # Yüklenen görseller (banners, brands, products, vb.)
└── src/
    ├── middleware.ts           # Security headers + API rate limiting
    ├── app/                   # Next.js App Router (sayfalar + API)
    ├── components/            # React bileşenleri
    ├── lib/                   # Altyapı kütüphaneleri
    ├── services/              # API istemci servisleri
    ├── hooks/                 # React hooks (queries + mutations)
    ├── types/                 # TypeScript tip tanımları
    ├── constants/             # Sabitler (API endpoints, query keys)
    ├── store/                 # Zustand global state
    ├── providers/             # React context providers
    └── generated/             # Prisma Client (otomatik üretilen)
```

---

## 3. Teknoloji Yığını Detayları

### 3.1 Veritabanı (PostgreSQL + Prisma)

- **PostgreSQL 16** çalışıyor (port 5432, user: `postgres`, db: `alpin_bisiklet`)
- **Prisma v7** `client` engine kullanıyor — bu `prisma.config.ts` dosyasından datasource URL alır, schema.prisma'da `url` belirtilmez
- **PrismaPg adapter** (`@prisma/adapter-pg`) + `pg` Pool ile bağlantı
- Model-tablo mapping: Model adları PascalCase, tablolar snake_case (`User` → `users`, `Order` → `orders`)

**Prisma client başlatma (`src/lib/prisma.ts`):**
```typescript
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["warn", "error"] });
```

### 3.2 Kimlik Doğrulama (better-auth)

- **Email/password** tabanlı kayıt ve giriş
- **Session** yönetimi: 7 gün, 1 günlük update, 5 dakika cookie cache
- **Roller:** `ADMIN` ve `CUSTOMER` (Prisma enum `UserRole`)
- **Admin plugin** aktif — rol tabanlı erişim kontrolü
- **Giriş endpoint:** `POST /api/auth/sign-in/email`
- **Kayıt endpoint:** `POST /api/auth/sign-up/email`
- **Tüm auth rotaları:** `/api/auth/[...all]/route.ts` catch-all handler

**Dosyalar:**
- `src/lib/auth.ts` — Sunucu tarafı auth yapılandırması
- `src/lib/auth-client.ts` — İstemci tarafı auth SDK
- `src/lib/auth-server.ts` — Server Component yardımcıları

### 3.3 Redis Cache

**Dosya:** `src/lib/redis.ts`

- Singleton `ioredis` client, `lazyConnect: true`
- Yardımcı fonksiyonlar: `getCache<T>()`, `setCache()`, `deleteCache()`, `invalidatePattern()`
- Cache key sabitleri: `PRODUCTS_LIST`, `PRODUCT_DETAIL:`, `CATEGORIES`, `BRANDS`, `CART:`, `SESSION:`
- Varsayılan TTL: `DEFAULT_CACHE_TTL`, `SHORT_CACHE_TTL`, `LONG_CACHE_TTL`

### 3.4 Ödeme (Iyzico)

**Dosya:** `src/lib/iyzico.ts`

- HMAC-SHA256 authorization header üretimi
- Fonksiyonlar: `createPayment()`, `create3DPayment()`, `refundPayment()`, `retrievePayment()`, `checkInstallments()`
- `isIyzicoConfigured()` — API anahtarları .env'de doğru mu kontrol eder
- **Status:** Sandbox altyapısı hazır, gerçek anahtarlar henüz eklenmedi

---

## 4. Veritabanı Şeması (Prisma Modelleri)

### Temel Auth Modelleri
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `User` | `users` | Kullanıcılar (id: cuid, name, email, role: UserRole, phone) |
| `Session` | `sessions` | Oturumlar (token, expiresAt, ipAddress, userAgent) |
| `Account` | `accounts` | Kimlik sağlayıcıları (credential, google, vb.) |
| `Verification` | `verifications` | E-posta doğrulama tokenları |

### E-Ticaret Modelleri
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `Category` | `categories` | Hiyerarşik kategoriler (parentId ile iç içe) |
| `Brand` | `brands` | Markalar (name, slug, logo, description, isActive) |
| `Product` | `products` | Ürünler (name, slug, sku, price, comparePrice, stock, status, category, brand) |
| `ProductImage` | `product_images` | Ürün görselleri (url, alt, order) |
| `ProductVariant` | `product_variants` | Varyantlar (name, sku, price, stock) |
| `ProductAttribute` | `product_attributes` | Özellikler (name, value — örn: Vites Sayısı: 21) |
| `Order` | `orders` | Siparişler (orderNumber, status, paymentStatus, subtotal, shipping, tax, total) |
| `OrderItem` | `order_items` | Sipariş kalemleri (quantity, unitPrice, total) |
| `OrderStatusHistory` | `order_status_history` | Durum geçmişi |
| `Payment` | `payments` | Ödeme kayıtları (iyzicoPaymentId, status, amount, cardType) |
| `Cart` | `carts` | Sepet (userId, sessionId) |
| `CartItem` | `cart_items` | Sepet öğeleri |
| `Address` | `addresses` | Adresler (title, firstName, lastName, phone, city, district, address, isDefault) |
| `Favorite` | `favorites` | Favori ürünler |
| `Review` | `reviews` | Ürün yorumları (rating, comment, isApproved) |
| `Coupon` | `coupons` | Kuponlar (code, type: PERCENTAGE/FIXED, value, minPurchase, isActive, usageLimit) |
| `Banner` | `banners` | Banner/slider görselleri (title, image, link, order, isActive) |
| `Page` | `pages` | CMS sayfaları (title, slug, content, metaTitle, metaDescription, isPublished) |
| `Setting` | `settings` | Anahtar-değer ayarları (key, value, type, group) |
| `ActivityLog` | `activity_logs` | Kullanıcı aktivite kayıtları |

### Enumlar
```prisma
enum UserRole    { ADMIN, CUSTOMER }
enum OrderStatus { PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED }
enum PaymentStatus { PENDING, PAID, FAILED, REFUNDED }
enum ProductStatus { ACTIVE, DRAFT, ARCHIVED }
enum CouponType  { PERCENTAGE, FIXED }
```

---

## 5. Sayfa Yapısı (32 Sayfa)

### 5.1 Kimlik Doğrulama — Route Group: `(auth)`

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Giriş | `/giris` | Email/password login formu |
| Kayıt | `/kayit` | Yeni hesap oluşturma |

**Layout:** `(auth)/layout.tsx` — Auth sayfalarına özel minimal layout

### 5.2 Mağaza (Store) — Route Group: `(store)`

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Hero, öne çıkan kategoriler, ürün showcase, marka marquee |
| Ürünler | `/urunler` | Filtrelenebilir ürün listesi |
| Ürün Detay | `/urunler/[slug]` | Tek ürün detayı, galeri, varyantlar, yorumlar |
| Sepet | `/sepet` | Alışveriş sepeti |
| Ödeme | `/odeme` | Checkout akışı |
| Hesabım | `/hesabim` | Hesap genel görünümü |
| Siparişlerim | `/hesabim/siparislerim` | Sipariş geçmişi |
| Adreslerim | `/hesabim/adreslerim` | Adres CRUD |
| Favorilerim | `/hesabim/favorilerim` | Favori ürün listesi |
| Ayarlar | `/hesabim/ayarlar` | Profil + şifre değiştirme |

**Layout:** `(store)/layout.tsx` — Header, footer, navigation
**Hesabım Layout:** `(store)/hesabim/layout.tsx` — Sidebar menü

### 5.3 Admin Paneli — Route: `admin`

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Dashboard | `/admin` | İstatistikler, grafikler, hızlı linkler |
| Ürünler | `/admin/urunler` | Ürün listesi (DataTable) |
| Ürün Ekle | `/admin/urunler/yeni` | Yeni ürün formu |
| Ürün Düzenle | `/admin/urunler/[id]` | Ürün güncelleme |
| Kategoriler | `/admin/kategoriler` | Kategori listesi |
| Kategori Ekle | `/admin/kategoriler/yeni` | Yeni kategori |
| Kategori Düzenle | `/admin/kategoriler/[id]` | Kategori güncelleme |
| Markalar | `/admin/markalar` | Marka listesi |
| Marka Ekle | `/admin/markalar/yeni` | Yeni marka |
| Marka Düzenle | `/admin/markalar/[id]` | Marka güncelleme |
| Bannerlar | `/admin/bannerlar` | Banner/slider yönetimi |
| Banner Ekle | `/admin/bannerlar/yeni` | Yeni banner |
| Banner Düzenle | `/admin/bannerlar/[id]` | Banner güncelleme |
| Siparişler | `/admin/siparisler` | Sipariş listesi, detay, durum güncelleme |
| Müşteriler | `/admin/musteriler` | Kullanıcı listesi, arama, rol filtreleme |
| Kuponlar | `/admin/kuponlar` | Kupon CRUD, inline form |
| Sayfalar | `/admin/sayfalar` | CMS sayfa yönetimi |
| Raporlar | `/admin/raporlar` | Gelir, sipariş, müşteri istatistikleri + düşük stok uyarıları |
| Ayarlar | `/admin/ayarlar` | Mağaza ayarları (genel, ödeme, kargo, SEO) |
| Barkod | `/admin/barkod` | Barkod tarama |

**Layout:** `admin/layout.tsx` — Sol sidebar + üst header, `ADMIN` yetkisi gerekli (yoksa `/giris`'e redirect)

---

## 6. API Rotaları (29 Endpoint)

### 6.1 Auth
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| ALL | `/api/auth/[...all]` | better-auth catch-all (sign-in, sign-up, sign-out, session, vb.) |

### 6.2 Ürünler
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/products` | Ürün listesi (filtreleme, sayfalama) / Yeni ürün |
| GET/PUT/DELETE | `/api/products/[id]` | Tek ürün / Güncelle / Sil |
| POST/DELETE | `/api/products/[id]/images` | Ürün görseli ekle/sil |
| GET | `/api/products/slug/[slug]` | Slug ile ürün getir |
| GET | `/api/products/barcode/[code]` | Barkod ile ürün |

### 6.3 Kategoriler & Markalar
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/categories` | Kategori listesi / Yeni |
| GET/POST | `/api/brands` | Marka listesi / Yeni |

### 6.4 Bannerlar
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/banners` | Banner listesi / Yeni |
| GET/PUT/DELETE | `/api/banners/[id]` | Banner CRUD |

### 6.5 Sepet
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/cart` | Sepet getir / Ürün ekle |
| PUT/DELETE | `/api/cart/[itemId]` | Miktar güncelle / Ürün çıkar |

### 6.6 Siparişler
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/orders` | Kullanıcının siparişleri / Yeni sipariş |
| GET | `/api/admin/orders` | Admin — tüm siparişler (arama, filtre, sayfalama) |
| GET/PUT | `/api/admin/orders/[id]` | Admin — sipariş detay / durum güncelleme |

### 6.7 Kullanıcılar (Admin)
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET | `/api/admin/users` | Admin — kullanıcı listesi |

### 6.8 Dashboard (Admin)
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET | `/api/admin/dashboard` | Admin — gelir, sipariş, müşteri, stok istatistikleri |

### 6.9 Adresler
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/addresses` | Kullanıcı adresleri / Yeni adres |

### 6.10 Favoriler
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/favorites` | Favori listesi / Toggle (ekle/çıkar) |

### 6.11 Kuponlar
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/coupons` | Kupon listesi / Yeni |
| GET/PUT/DELETE | `/api/coupons/[id]` | Kupon CRUD |

### 6.12 CMS Sayfaları
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/POST | `/api/pages` | Sayfa listesi / Yeni |
| GET/PUT/DELETE | `/api/pages/[id]` | Sayfa CRUD |

### 6.13 Ayarlar
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET/PUT | `/api/settings` | Grouped get / Bulk upsert |

### 6.14 Ödeme (Iyzico)
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| POST | `/api/payment/initialize` | Ödeme başlat (standard + 3D Secure) |
| POST | `/api/payment/callback` | 3D Secure redirect handler |
| POST | `/api/payment/refund` | Admin — iade işlemi |

### 6.15 Dosya Yükleme
| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| POST | `/api/upload/image` | Görsel yükleme → `public/uploads/` |
| POST | `/api/upload/video` | Video yükleme |

---

## 7. Bileşen Mimarisi

### 7.1 UI Bileşenleri (`src/components/ui/`) — 28 adet

shadcn/ui tabanlı, Radix UI primitifleri üzerine inşa edilmiş:

`Accordion`, `AlertDialog`, `Avatar`, `Badge`, `Button`, `Card`, `Carousel`, `Checkbox`, `Combobox`, `DataTable` (4 alt bileşen), `DropdownMenu`, `Field`, `Form`, `ImageUpload`, `InputGroup`, `Input`, `Label`, `Select`, `Separator`, `Sheet`, `Slider`, `Switch`, `Table`, `Tabs`, `Textarea`, `ThemeProvider`, `Toast`, `Toaster`

### 7.2 Admin Bileşenleri (`src/components/admin/`) — 12 adet

| Bileşen | Açıklama |
|---------|----------|
| `admin-header.tsx` | Üst bar (kullanıcı bilgisi, tema değiştirme) |
| `admin-sidebar.tsx` | Sol navigasyon menüsü |
| `sidebar.tsx` | Detaylı sidebar bileşeni |
| `header.tsx` | Eski header bileşeni |
| `dashboard/` (3 dosya) | Dashboard widget'ları |
| `banners/` | Banner form bileşeni |
| `brands/` | Marka form bileşeni |
| `categories/` | Kategori form bileşeni |
| `products/` | Ürün form bileşeni |

### 7.3 Mağaza Bileşenleri (`src/components/store/`) — 11+ adet

| Bileşen | Açıklama |
|---------|----------|
| `header.tsx` | Mağaza header (navigation, arama, sepet, kullanıcı) |
| `footer.tsx` | Alt bilgi alanı |
| `cart-drawer.tsx` | Yan açılır sepet çekmecesi |
| **Ana Sayfa** (`home/`): | |
| `hero-section.tsx` | Ana banner/slider |
| `parallax-hero.tsx` | Parallax efektli hero |
| `featured-categories.tsx` | Öne çıkan kategoriler |
| `featured-products.tsx` | Öne çıkan ürünler |
| `product-showcase.tsx` | Ürün vitrin bileşeni |
| `brand-marquee.tsx` | Kayan marka logoları |

### 7.4 Animasyon Bileşenleri (`src/components/animations/`) — 7 adet

| Bileşen | Açıklama |
|---------|----------|
| `motion-components.tsx` | Framer Motion wrapper'ları |
| `motion-elements.tsx` | Animasyonlu HTML elementleri |
| `magic-effects.tsx` | Özel görsel efektler |
| `page-transition.tsx` | Sayfa geçiş animasyonları |
| `scroll-reveal.tsx` | Scroll ile görünür olma |
| `tilt-card.tsx` | 3D tilt kartları |

### 7.5 Skeleton Bileşenleri (`src/components/skeletons/`) — 7 adet
Yükleme durumlarında gösterilen iskelet bileşenler.

### 7.6 3D Bileşenler (`src/components/3d/`)
Three.js + React Three Fiber ile 3D görselleştirme.

---

## 8. İstemci Tarafı Mimari

### 8.1 Servisler (`src/services/`)

| Dosya | Açıklama |
|-------|----------|
| `api-client.ts` | Base fetch wrapper (hata yönetimi, kimlik doğrulama) |
| `product.service.ts` | Ürün API çağrıları |
| `category.service.ts` | Kategori API çağrıları |
| `banner.service.ts` | Banner API çağrıları |

### 8.2 React Hooks (`src/hooks/`)

| Klasör/Dosya | Açıklama |
|-------|----------|
| `queries/` (3 dosya) | TanStack Query hooks (ürün, kategori, banner sorguları) |
| `mutations/` (3 dosya) | TanStack Query mutations (CRUD işlemleri) |
| `use-toast.ts` | Toast bildirim hook'u |

### 8.3 Zustand Store (`src/store/`)

| Dosya | Açıklama |
|-------|----------|
| `use-cart-store.ts` | Sepet durumu yönetimi (ekle, çıkar, güncelle, toplam hesapla) |

### 8.4 Tip Tanımları (`src/types/`)

| Dosya | Açıklama |
|-------|----------|
| `product.types.ts` | Ürün, varyant, özellik tipleri |
| `category.types.ts` | Kategori tipleri |
| `banner.types.ts` | Banner tipleri |
| `api.types.ts` | API yanıt tipleri (paginated response, error) |

### 8.5 Sabitler (`src/constants/`)

| Dosya | Açıklama |
|-------|----------|
| `api-endpoints.ts` | API URL sabitleri |
| `query-keys.ts` | TanStack Query key sabitleri |

### 8.6 Providers (`src/providers/`)

| Dosya | Açıklama |
|-------|----------|
| `index.tsx` | Ana provider wrapper |
| `query-provider.tsx` | TanStack Query client yapılandırması (staleTime, gcTime, retry) |

---

## 9. Validasyon (`src/lib/validations.ts`)

Zod v4 şemaları:

- **Ortak:** `idSchema`, `uuidSchema`, `paginationSchema`, `sortSchema`
- **Ürün:** `productImageSchema`, `productVariantSchema`, `createProductSchema`, `updateProductSchema`
- **Kategori:** `createCategorySchema`, `updateCategorySchema`
- **Marka:** `createBrandSchema`, `updateBrandSchema`
- **Banner:** `createBannerSchema`, `updateBannerSchema`
- **Sipariş:** `createOrderSchema`, adres validasyonları
- **Kupon:** `createCouponSchema`, `updateCouponSchema`

---

## 10. Middleware (`src/middleware.ts`)

### Güvenlik Başlıkları
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### API Rate Limiting
- In-memory rate limiter
- Limit: 60 istek/dakika/IP+path
- Aşıldığında: `429 Too Many Requests` + `Retry-After: 60`

### Matcher
Tüm sayfalar ve API'ler (statik dosyalar hariç).

---

## 11. Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | ✅ | PostgreSQL bağlantı string'i |
| `BETTER_AUTH_SECRET` | ✅ | Auth gizli anahtarı |
| `BETTER_AUTH_URL` | ❌ | Auth base URL (default: localhost:3000) |
| `NEXT_PUBLIC_APP_URL` | ❌ | Public app URL |
| `NEXT_PUBLIC_APP_NAME` | ❌ | Uygulama adı |
| `REDIS_URL` | ❌ | Redis bağlantı URL'i |
| `IYZICO_API_KEY` | ❌ | Iyzico sandbox API key |
| `IYZICO_SECRET_KEY` | ❌ | Iyzico sandbox secret key |
| `IYZICO_BASE_URL` | ❌ | Iyzico API URL |

Doğrulama: `src/lib/env.ts` — Zorunlu değişkenler eksikse hata fırlatır.

---

## 12. Admin Kullanıcı

Seed script: `npx tsx prisma/seed-admin.ts`

| Bilgi | Değer |
|-------|-------|
| Email | `admin@alpinbisiklet.com` |
| Şifre | `Admin123!` |
| Rol | `ADMIN` |

Script, better-auth'un kendi `hashPassword()` fonksiyonunu (scrypt, N=16384 r=16 p=1 dkLen=64) kullanarak doğru formatta hash oluşturur.

---

## 13. Geliştirme Komutları

```bash
npm run dev       # Dev server (Turbopack)
npm run build     # Üretim build'i
npm run start     # Üretim sunucusu
npm run lint      # Biome linter
npm run format    # Biome formatter
npm run check     # Biome lint + format

npx prisma generate    # Prisma client üret
npx prisma db push     # Şemayı DB'ye uygula
npx tsx prisma/seed-admin.ts  # Admin kullanıcı oluştur
```

---

## 14. Önemli Kurallar ve Konvansiyonlar

### Import Sırası
1. React / Next.js
2. 3rd party kütüphaneler
3. `@/components`
4. `@/hooks`
5. `@/lib`
6. `@/services`
7. `@/types`
8. `@/constants`

### React / Next.js Kuralları
- `"use client"` direktifi sadece gerektiğinde kullanılır
- Server Components varsayılan, client sadece interaktivite için
- Tüm formlar `react-hook-form` + `zod` ile
- Tüm listeleme sayfaları `TanStack Query` ile
- Tüm admin listeleri `TanStack Table` (DataTable) ile

### CSS / Tasarım
- Tailwind CSS v4 + CSS Variables
- Tema: Dark/Light mode (`next-themes`)
- Font: Inter (Google Fonts)
- shadcn/ui bileşenleri (`components.json` yapılandırması)

### Erişilebilirlik
- Tüm butonlarda `aria-label`
- İkonlarda `aria-hidden="true"`
- Yükleme durumlarında `aria-busy`, `aria-live="polite"`
- Formularda `Label` + `htmlFor`

### Dosya Adlandırma
- Sayfalar: `page.tsx`
- Layoutlar: `layout.tsx`
- API rotaları: `route.ts`
- Bileşenler: `kebab-case.tsx`
- Tipler: `*.types.ts`
- Servisler: `*.service.ts`
- Hooks: `use-*.ts`

---

## 15. Mimari Akış Diyagramı

```
┌──────────────────────────────────────────────────────┐
│                     İSTEMCİ                          │
│                                                      │
│  Sayfalar (page.tsx)                                 │
│     ↓ kullanır                                       │
│  Bileşenler (components/)                            │
│     ↓ veri alır                                      │
│  Hooks (queries/ + mutations/) ← TanStack Query     │
│     ↓ çağırır                                        │
│  Servisler (services/) ← fetch wrapper               │
│     ↓ HTTP istekleri                                 │
│  Zustand Store (sepet state) ← lokal state           │
│                                                      │
├──────────────────────────────────────────────────────┤
│                     SUNUCU                           │
│                                                      │
│  Middleware (güvenlik + rate limit)                   │
│     ↓                                                │
│  API Route Handlers (route.ts)                       │
│     ↓ yetki kontrolü                                 │
│  better-auth (session)                               │
│     ↓ veri işleme                                    │
│  Prisma ORM → PostgreSQL                             │
│     ↓ cache                                          │
│  Redis (ioredis)                                     │
│     ↓ ödeme                                          │
│  Iyzico API                                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 16. Bilinen Durumlar ve Notlar

1. **Veritabanı boş** — İlk kullanımda ürün/kategori/marka seed'lenmeli
2. **Iyzico sandbox** — `.env`'de gerçek API anahtarları yok, test için eklenmeli
3. **Prisma v7 özelliği** — `client` engine, `prisma.config.ts` üzerinden URL alır; `schema.prisma`'da `url` belirtmek hata verir
4. **better-auth password hash** — scrypt kullanır (`@noble/hashes/scrypt`), format: `hex_salt:hex_hash`
5. **PostgreSQL** — `pg_ctl` ile başlatılmalı, otomatik servis olarak çalışmıyor
6. **Redis** — Windows'da `redis-server --service-start` ile çalıştırılıyor
7. **Admin erişim** — `/admin` altındaki tüm sayfalar `ADMIN` rolü gerektirir, yoksa `/giris`'e yönlendir
8. **Rate limiting** — In-memory, dakikada 60 istek limiti; production'da Redis tabanlı olmalı

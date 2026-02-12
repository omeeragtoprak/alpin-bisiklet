# 🚴 ALPİN BİSİKLET - FULLSTACK E-TİCARET PROJESİ

## 📋 PROJE PLANI

---

### 1. VERİTABANI ŞEMASI (Prisma + PostgreSQL)

**Tablolar:**

#### KULLANICILAR

| User (Better Auth) | Address |
| :--- | :--- |
| - id, email, name, role | - userId, title, city, district |
| - phone, avatar | - address, postalCode, isDefault |
| - createdAt, updatedAt | |

#### ÜRÜNLER

| Category | Product |
| :--- | :--- |
| - id, name, slug | - id, name, slug, description |
| - parentId, image | - price, comparePrice, cost |
| - isActive, order | - sku, barcode (EAN-13) |
| | - stock, lowStockAlert |
| **Brand** | - categoryId, brandId |
| - id, name, slug, logo | - isActive, isFeatured |
| | - weight, dimensions |
| **ProductImage** | |
| - productId, url, order | **ProductVideo** |
| | - productId, url, thumbnail |
| **ProductVariant** | |
| - productId, name, sku | **ProductAttribute** |
| - price, stock, barcode | - productId, key, value |

#### SİPARİŞLER

| Cart | CartItem |
| :--- | :--- |
| - id, userId/sessionId | - cartId, productId, variantId |
| - createdAt, expiresAt | - quantity, price |

| Order | OrderItem |
| :--- | :--- |
| - id, orderNumber | - orderId, productId, variantId |
| - userId, status | - quantity, price, total |
| - subtotal, shipping, tax | |
| - total, note | **OrderStatusHistory** |
| - shippingAddressId | - orderId, status, note, createdAt |
| - billingAddressId | |
| - paymentStatus | **Payment (iyzico)** |
| - paymentMethod | - orderId, iyzicoPaymentId |
| - trackingNumber | - status, amount, installment |

#### ADMİN PANELİ

| Banner | Page (CMS) |
| :--- | :--- |
| - id, title, image | - id, title, slug, content |
| - link, order, isActive | - isPublished |
| - position (hero/sidebar) | |
| | **Setting** |
| **Coupon** | - key, value, type |
| - code, type, value | (site_name, logo, social_links) |
| - minPurchase, maxUses | |
| - validFrom, validTo | **ActivityLog** |
| | - userId, action, entity, entityId |

---

### 2. SAYFA YAPISI

#### 🛒 MÜŞTERİ TARAFI (Public)

```
app/
├── (store)/                        # Mağaza layout
│   ├── layout.tsx                  # Header, Footer, Cart Drawer
│   ├── page.tsx                    # Ana sayfa (Hero, Featured, Categories)
│   │
│   ├── urunler/
│   │   ├── page.tsx               # Ürün listesi (filtreleme, sıralama)
│   │   └── [slug]/
│   │       └── page.tsx           # Ürün detay (galeri, 3D, video)
│   │
│   ├── kategoriler/
│   │   └── [slug]/
│   │       └── page.tsx           # Kategori sayfası
│   │
│   ├── markalar/
│   │   ├── page.tsx               # Marka listesi
│   │   └── [slug]/
│   │       └── page.tsx           # Marka ürünleri
│   │
│   ├── sepet/
│   │   └── page.tsx               # Sepet sayfası
│   │
│   ├── odeme/
│   │   ├── page.tsx               # Ödeme adımları
│   │   ├── adres/page.tsx         # Adres seçimi
│   │   ├── kargo/page.tsx         # Kargo seçimi
│   │   └── onay/page.tsx          # Sipariş onay
│   │
│   ├── siparis/
│   │   ├── basarili/page.tsx      # Başarılı ödeme
│   │   ├── basarisiz/page.tsx     # Başarısız ödeme
│   │   └── [id]/page.tsx          # Sipariş detay
│   │
│   ├── hesabim/
│   │   ├── layout.tsx             # Hesap sidebar
│   │   ├── page.tsx               # Dashboard
│   │   ├── siparislerim/page.tsx  # Sipariş geçmişi
│   │   ├── adreslerim/page.tsx    # Adres yönetimi
│   │   ├── favorilerim/page.tsx   # Favoriler
│   │   └── ayarlar/page.tsx       # Profil ayarları
│   │
│   ├── arama/
│   │   └── page.tsx               # Arama sonuçları
│   │
│   ├── hakkimizda/page.tsx
│   ├── iletisim/page.tsx
│   ├── sikca-sorulan-sorular/page.tsx
│   ├── iade-kosullari/page.tsx
│   └── gizlilik-politikasi/page.tsx
│
├── giris/page.tsx                  # Login
├── kayit/page.tsx                  # Register
└── sifremi-unuttum/page.tsx        # Password reset
```

#### 👨💼 ADMİN PANELİ

```
app/
├── admin/
│   ├── layout.tsx                  # Admin sidebar, header
│   ├── page.tsx                    # Dashboard (stats, charts)
│   │
│   ├── urunler/
│   │   ├── page.tsx               # Ürün listesi (DataTable)
│   │   ├── yeni/page.tsx          # Ürün ekleme
│   │   └── [id]/
│   │       ├── page.tsx           # Ürün düzenleme
│   │       └── stok/page.tsx      # Stok yönetimi
│   │
│   ├── kategoriler/
│   │   ├── page.tsx               # Kategori ağacı
│   │   └── [id]/page.tsx          # Kategori düzenleme
│   │
│   ├── markalar/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── siparisler/
│   │   ├── page.tsx               # Sipariş listesi
│   │   └── [id]/page.tsx          # Sipariş detay + durum güncelleme
│   │
│   ├── musteriler/
│   │   ├── page.tsx               # Müşteri listesi
│   │   └── [id]/page.tsx          # Müşteri detay
│   │
│   ├── kuponlar/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── bannerlar/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── sayfalar/                   # CMS
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── barkod/
│   │   └── page.tsx               # Barkod okuyucu + fiyat güncelleme
│   │
│   ├── raporlar/
│   │   ├── page.tsx               # Genel raporlar
│   │   ├── satis/page.tsx         # Satış raporu
│   │   └── stok/page.tsx          # Stok raporu
│   │
│   └── ayarlar/
│       ├── page.tsx               # Genel ayarlar
│       ├── odeme/page.tsx         # iyzico ayarları
│       └── kargo/page.tsx         # Kargo ayarları
```

---

### 3. API ROUTE'LARI

```
app/api/
├── auth/[...all]/route.ts          # Better Auth
│
├── products/
│   ├── route.ts                    # GET (list), POST (create)
│   ├── [id]/route.ts               # GET, PATCH, DELETE
│   ├── [id]/images/route.ts        # POST (upload), DELETE
│   ├── [id]/videos/route.ts        # POST, DELETE
│   └── barcode/[code]/route.ts     # GET by barcode
│
├── categories/
│   ├── route.ts
│   └── [id]/route.ts
│
├── brands/
│   ├── route.ts
│   └── [id]/route.ts
│
├── cart/
│   ├── route.ts                    # GET, POST (add item)
│   ├── [itemId]/route.ts           # PATCH (quantity), DELETE
│   └── clear/route.ts              # DELETE (clear cart)
│
├── orders/
│   ├── route.ts                    # GET (user orders), POST (create)
│   ├── [id]/route.ts               # GET, PATCH (status)
│   └── [id]/status/route.ts        # POST (status update)
│
├── payment/
│   ├── iyzico/
│   │   ├── initialize/route.ts     # POST (start payment)
│   │   └── callback/route.ts       # POST (iyzico callback)
│
├── upload/
│   ├── image/route.ts              # POST (image upload)
│   └── video/route.ts              # POST (video upload)
│
├── banners/
│   ├── route.ts
│   └── [id]/route.ts
│
├── coupons/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── validate/route.ts           # POST (validate code)
│
├── search/route.ts                 # GET (search products)
│
├── admin/
│   ├── dashboard/route.ts          # GET (stats)
│   ├── reports/
│   │   ├── sales/route.ts
│   │   └── stock/route.ts
│   └── settings/route.ts           # GET, PATCH
│
└── webhook/
    └── iyzico/route.ts             # iyzico webhooks
```

---

### 4. 3D ANİMASYONLAR & UI

**Magic MCP + Motion Kullanımı:**

| Bileşen | 3D/Animasyon |
| :--- | :--- |
| Hero Banner | Parallax + floating bisiklet 3D modeli |
| Ürün Kartları | Hover'da 3D tilt efekti |
| Ürün Galeri | 3D carousel + zoom |
| Sepet | Slide-in drawer + item animasyonları |
| Kategori Grid | Stagger reveal animasyonu |
| Loading States | Skeleton + shimmer efekti |
| Page Transitions | Smooth fade + slide |
| Butonlar | Ripple + hover scale |
| Modaller | Spring animasyonu |

**Renk Paleti (Mavi + Turuncu):**

```css
--primary: #3B82F6        /* Mavi - ana renk */
--primary-foreground: #FFFFFF
--accent: #F97316         /* Turuncu - vurgu */
--accent-foreground: #FFFFFF
--background: #FAFAFA
--foreground: #0F172A
--muted: #F1F5F9
--destructive: #EF4444
```

---

### 5. ÖZELLİKLER DETAYI

**Admin Panel Özellikleri:**

| Özellik | Açıklama |
| :--- | :--- |
| Dashboard | Günlük satış, sipariş sayısı, stok uyarıları, grafikler |
| Ürün Yönetimi | Çoklu fotoğraf/video, varyantlar, SEO, stok takibi |
| Barkod Sistemi | EAN-13 okuma, fiyat/stok güncelleme, toplu işlem |
| Banner Yönetimi | Hero, sidebar, popup banner'lar |
| Kupon Sistemi | Yüzde/sabit indirim, minimum tutar, kullanım limiti |
| Sipariş Takibi | Durum güncelleme, timeline, mail bildirimi |
| Raporlar | Satış, stok, müşteri analizleri |
| Aktivite Logu | Tüm admin işlemleri kaydedilir |

**Müşteri Özellikleri:**

| Özellik | Açıklama |
| :--- | :--- |
| Ürün Arama | Fuzzy search, filtreler, sıralama |
| Ürün Detay | 3D galeri, video, özellikler, yorumlar |
| Sepet | Drawer, miktar güncelleme, kupon |
| Ödeme | iyzico 3D Secure, taksit seçenekleri |
| Hesabım | Siparişler, adresler, favoriler |
| Responsive | Mobile-first tasarım |

---

### 6. UYGULAMA SIRASI

**Faz 1: Temel Altyapı (1-2 gün)**

1. Prisma şeması ve migration
2. Renk teması güncellemesi
3. Auth yapılandırması (role-based)
4. Upload sistemi (local)
5. Base layout'lar

**Faz 2: Admin Panel (2-3 gün)**

1. Admin layout + sidebar
2. Dashboard
3. Ürün CRUD + görseller
4. Kategori/Marka yönetimi
5. Barkod sistemi
6. Banner yönetimi

**Faz 3: Müşteri Arayüzü (2-3 gün)**

1. Store layout (header, footer)
2. Ana sayfa (hero, kategoriler, öne çıkanlar)
3. Ürün listesi + filtreleme
4. Ürün detay sayfası
5. Arama

**Faz 4: E-Ticaret İş Akışı (2-3 gün)**

1. Sepet sistemi
2. Ödeme akışı
3. iyzico entegrasyonu
4. Sipariş yönetimi
5. Hesabım sayfaları

**Faz 5: 3D & Animasyonlar (1-2 gün)**

1. Motion animasyonları
2. 3D efektler (Magic MCP)
3. Page transitions
4. Micro-interactions

**Faz 6: Finalizasyon (1 gün)**

1. SEO optimizasyonu
2. Performance tuning
3. Error handling
4. Test ve düzeltmeler

---

### 7. DOSYA SAYISI TAHMİNİ

| Kategori | Dosya Sayısı |
| :--- | :--- |
| Prisma Schema | 1 |
| API Routes | ~35 |
| Sayfalar | ~45 |
| Components | ~60 |
| Hooks | ~25 |
| Services | ~12 |
| Types | ~10 |
| Utils/Lib | ~8 |
| **TOPLAM** | **~200 dosya** |

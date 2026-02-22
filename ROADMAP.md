# Alpin Bisiklet — Geliştirme Yol Haritası

Son güncelleme: 23 Şubat 2026

---

## Öncelik 1 — Yayına Girmeden Kritik

### 1.1 Kredi Kartı Ödemesi
**Durum:** iyzico entegrasyonu teknik olarak tam, UI devre dışı bırakılmış.
**Yapılacak:**
- `/odeme` sayfasında kredi kartı sekmesini aktifleştir
- Kart no, son kullanma tarihi, CVV inputları (iyzico JS ile PCI compliant)
- 3D Secure akışı zaten `/api/payment/initialize` → `/api/payment/callback` olarak mevcut
- Taksit seçenekleri: banka adı + taksit sayısı dropdown (iyzico `installmentDetails` response'undan doldurulur)
- `.env` → `IYZICO_BASE_URL` production URL'e çevrilmeli (`https://api.iyzipay.com`)

**Etkilenen dosyalar:**
- `src/app/(store)/odeme/page.tsx` — kredi kartı formu UI
- `src/app/api/payment/initialize/route.ts` — taksit parametresi ekleme

---

### 1.2 Sipariş E-postaları
**Durum:** Nodemailer altyapısı hazır (`src/lib/mail.ts`), sipariş akışına bağlanmamış.
**Yapılacak:**
- `sendOrderConfirmationEmail(order, user)` — sipariş alındı
- `sendOrderShippedEmail(order, trackingNumber)` — kargoya verildi
- `sendOrderDeliveredEmail(order)` — teslim edildi
- `sendOrderCancelledEmail(order)` — iptal edildi
- Admin sipariş durumu güncelleyince otomatik tetiklenecek

**Etkilenen dosyalar:**
- `src/lib/mail.ts` — 4 yeni fonksiyon
- `src/app/api/orders/[id]/route.ts` — PATCH'te mail tetikleme
- `src/app/api/payment/callback/route.ts` — ödeme başarılıysa onay maili

---

### 1.3 Kupon Kodu — Checkout Entegrasyonu
**Durum:** Kupon şeması ve admin CRUD tam. Checkout'ta giriş alanı ve uygulama lojik yok.
**Yapılacak:**
- `/api/coupons/validate` endpoint → kupon kodu + sepet toplamı al, indirim hesapla, döndür
- Checkout sayfasında kupon input + "Uygula" butonu
- İndirim satırı sipariş özetinde göster
- `Order.couponCode`, `Order.discountAmount` kaydet
- Kupon `usageCount` artır

**Etkilenen dosyalar:**
- `src/app/api/coupons/validate/route.ts` — YENİ
- `src/app/(store)/odeme/page.tsx` — kupon UI
- `src/app/api/orders/route.ts` — kupon uygulama lojik

---

## Öncelik 2 — Müşteri Güveni

### 2.1 Ürün Yorumları & Puanlama
**Durum:** `Review` Prisma modeli hazır (rating, title, comment, isApproved, userId, productId).
**Yapılacak:**
- `GET /api/reviews?productId=` — onaylı yorumları listele
- `POST /api/reviews` — yorum ekle (giriş zorunlu, satın almış olmak zorunlu mu? karar verilmeli)
- `PATCH /api/reviews/[id]` — admin onay/red
- Ürün detay sayfasında yorum bölümü (yıldız dağılımı, ortalama, yorum listesi, yorum formu)
- Admin panelinde yorum moderasyon sayfası (`/admin/yorumlar`)

**Etkilenen dosyalar:**
- `src/app/api/reviews/route.ts` — YENİ
- `src/app/api/reviews/[id]/route.ts` — YENİ
- `src/app/(store)/urunler/[slug]/page.tsx` — yorum bölümü ekleme
- `src/app/admin/yorumlar/page.tsx` — YENİ
- `src/components/store/product/product-reviews.tsx` — YENİ

---

### 2.2 Breadcrumb Navigasyon
**Durum:** Checkout ve sipariş detayında var, ürün/kategori/blog sayfalarında yok.
**Yapılacak:**
- Ürün detayı: Ana Sayfa → [Kategori] → [Ürün Adı]
- Kategori: Ana Sayfa → [Üst Kategori] → [Kategori]
- Blog: Ana Sayfa → Blog → [Yazı Başlığı]
- `<BreadcrumbSchema>` JSON-LD (SEO için)

**Etkilenen dosyalar:**
- `src/app/(store)/urunler/[slug]/page.tsx`
- `src/app/(store)/blog/[slug]/page.tsx`

---

### 2.3 İade Talep Sistemi
**Durum:** Sipariş durumunda `REFUNDED` var, talep formu/akışı yok.
**Yapılacak:**
- `ReturnRequest` modeli Prisma'ya ekle (orderId, reason, description, status, adminNote)
- `POST /api/orders/[id]/return` — müşteri talep oluşturur
- `PATCH /api/admin/returns/[id]` — admin onaylar/reddeder
- Sipariş detay sayfasında "İade Talep Et" butonu (teslim edilmiş siparişlerde aktif)
- Admin panelinde iade talepleri listesi

**Etkilenen dosyalar:**
- `prisma/schema.prisma` — ReturnRequest modeli
- `src/app/api/orders/[id]/return/route.ts` — YENİ
- `src/app/(store)/hesabim/siparislerim/[id]/page.tsx` — iade butonu
- `src/app/admin/iadeler/page.tsx` — YENİ

---

## Öncelik 3 — Dönüşüm Arttırma

### 3.1 Arama — Autocomplete
**Durum:** Arama API çalışıyor, frontend sadece enter'a tepki veriyor.
**Yapılacak:**
- Header arama kutusuna debounced autocomplete ekle (300ms)
- `GET /api/products/search?q=` → top 5-8 sonuç (isim + kapak görseli + fiyat)
- Dropdown overlay ile göster
- Kategori gruplama: "Ürünler (3)", "Kategoriler (1)", "Markalar (2)"
- Mobil uyumlu full-screen arama modu

**Etkilenen dosyalar:**
- `src/components/store/header.tsx` — autocomplete UI
- `src/app/api/products/search/route.ts` — YENİ (veya mevcut route'a ekle)

---

### 3.2 iyzico Taksit Seçenekleri UI
**Durum:** iyzico API taksit desteği var, seçim UI'si yok.
**Yapılacak:**
- Kredi kartı girilince `/api/payment/installments` endpoint'i çağır (bin numarasıyla)
- Banka logosu + taksit adedi + aylık taksit tutarı listesi göster
- Seçilen taksit sayısını ödeme isteğine ekle

**Etkilenen dosyalar:**
- `src/app/api/payment/installments/route.ts` — YENİ
- `src/app/(store)/odeme/page.tsx` — taksit seçici UI

---

### 3.3 Stok Gelince Bildir
**Durum:** Stokta yok gösterimi var, abone olma özelliği yok.
**Yapılacak:**
- `StockAlert` modeli Prisma'ya ekle (productId, variantId?, email, notified)
- Stok tükenmişse ürün detayında "Stok Gelince Haber Ver" formu (email input)
- Admin stok güncellediğinde → stok>0 olan ürünler için bekleyen abonelere mail at
- `POST /api/stock-alerts` endpoint

**Etkilenen dosyalar:**
- `prisma/schema.prisma` — StockAlert modeli
- `src/app/api/stock-alerts/route.ts` — YENİ
- `src/app/(store)/urunler/[slug]/page.tsx` — stok gelince haber ver UI
- `src/app/api/products/[id]/route.ts` — PATCH'te stok arttıysa alert tetikle

---

## Öncelik 4 — Analitik & Teknik

### 4.1 Google Analytics 4 / Plausible
**Durum:** Hiç analytics yok.
**Yapılacak:**
- `next/script` ile GA4 veya Plausible entegrasyonu
- E-ticaret event'leri: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- KVKK uyumu için cookie consent banner (opsiyonel ama önerilen)
- Admin dashboard'a basit ziyaretçi özeti eklenebilir

**Etkilenen dosyalar:**
- `src/app/layout.tsx` — script tag
- `src/lib/analytics.ts` — YENİ (event wrapper fonksiyonlar)

---

### 4.2 Kargo Entegrasyonu
**Durum:** Tracking number alanı var, API entegrasyonu yok.
**Yapılacak:**
- Aras Kargo / Yurtiçi / MNG API entegrasyonu
- Sipariş detay sayfasında canlı kargo takibi
- Kargo durumu güncellenince otomatik mail

**Etkilenen dosyalar:**
- `src/lib/cargo.ts` — YENİ
- `src/app/(store)/hesabim/siparislerim/[id]/page.tsx` — takip widget

---

### 4.3 WhatsApp Business API
**Durum:** Altyapı analizi yapıldı, webhook endpoint yok.
**Yapılacak:**
- `GET/POST /api/whatsapp/webhook` — Meta doğrulama + mesaj alma
- `src/lib/whatsapp.ts` — mesaj gönderme utility
- Gelen sipariş mesajı → admin bildirim
- Otomatik yanıt (opsiyonel): "Mesajınız alındı, en kısa sürede dönülecek"
- Env: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

**Etkilenen dosyalar:**
- `src/app/api/whatsapp/webhook/route.ts` — YENİ
- `src/lib/whatsapp.ts` — YENİ
- `.env.example` — yeni değişkenler

---

## Öncelik 5 — Büyüme Özellikleri

### 5.1 Sosyal Giriş
- Google OAuth entegrasyonu (Better Auth plugin olarak mevcut)
- Facebook Login (opsiyonel)
- Etkilenen: `src/lib/auth.ts`, giriş/kayıt sayfaları

### 5.2 Marka & Kategori Detay Sayfaları
- `/markalar/[slug]` — marka sayfası + ürünleri
- `/kategoriler/[slug]` — dedike kategori sayfası (SEO için önemli)

### 5.3 Admin Raporlar
- Satış grafikleri (günlük/haftalık/aylık)
- En çok satan ürünler
- Stok durumu raporu
- Müşteri segmentasyonu
- Şu an `/admin/raporlar` sayfası boş

### 5.4 Toplu Ürün Yükleme
- Excel/CSV import
- Admin panelinde yükleme UI

---

## Teknik Borç

| Konu | Açıklama |
|------|----------|
| `sepet` kalıcılığı | Sepet şu an Zustand (client-side). Giriş yapınca DB senkronizasyonu yok |
| Güvenlik | `/api/cart` auth kontrolü yok — herkes herhangi bir sepete erişebilir |
| Görsel optimizasyonu | Upload edilen görseller için WebP dönüşümü / boyut kısıtlaması yok |
| Error boundary | Admin sayfalarında hata yakalama eksik |

---

## Özet Tablo

| # | Özellik | Öncelik | Tahmini Efor |
|---|---------|---------|--------------|
| 1.1 | Kredi kartı ödemesi | Kritik | Küçük |
| 1.2 | Sipariş e-postaları | Kritik | Orta |
| 1.3 | Kupon checkout | Kritik | Orta |
| 2.1 | Ürün yorumları | Yüksek | Büyük |
| 2.2 | Breadcrumb | Yüksek | Küçük |
| 2.3 | İade talep sistemi | Yüksek | Orta |
| 3.1 | Arama autocomplete | Orta | Orta |
| 3.2 | iyzico taksit UI | Orta | Orta |
| 3.3 | Stok gelince bildir | Orta | Orta |
| 4.1 | GA4 / Plausible | Orta | Küçük |
| 4.2 | Kargo entegrasyonu | Düşük | Büyük |
| 4.3 | WhatsApp Business API | Düşük | Büyük |
| 5.1 | Sosyal giriş | Düşük | Küçük |
| 5.2 | Marka/kategori detay | Düşük | Orta |
| 5.3 | Admin raporlar | Düşük | Büyük |
| 5.4 | Toplu ürün yükleme | Düşük | Orta |

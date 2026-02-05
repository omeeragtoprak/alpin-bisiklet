# Alpin Bisiklet - Proje Hafızası

> Bu dosya proje yapısı, kurulumlar ve kodlama kurallarını içerir. deneme eklendi
> AI asistanlar ve geliştiriciler için referans belgesidir.
> **ÖNEMLİ:** Yeni kod yazarken bu dosyadaki kurallara ve klasör yapısına uyulmalıdır.

---

## Proje Bilgileri

- **Proje Adı:** Alpin Bisiklet Admin Panel
- **Tür:** E-ticaret yönetim paneli
- **Amaç:** Ürün ekleme, listeleme, düzenleme ve sipariş yönetimi

---

## Teknoloji Stack'i

| Kategori | Teknoloji | Sürüm |
|----------|-----------|-------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Runtime** | React | 19.2.3 |
| **Dil** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Kütüphanesi** | shadcn/ui (Base UI, Radix UI) | - |
| **İkonlar** | Lucide React | 0.563.0 |
| **Animasyon** | Motion | 12.33.0 |
| **Form Yönetimi** | react-hook-form | 7.71.1 |
| **Form Resolver** | @hookform/resolvers | 5.2.2 |
| **Validasyon** | Zod | 4.3.6 |
| **Data Fetching** | @tanstack/react-query | 5.90.20 |
| **Tablo** | @tanstack/react-table | 8.21.3 |
| **Auth** | better-auth | 1.4.18 |
| **Linter/Formatter** | Biome | 1.9.4 |

---

## Klasör Yapısı (ZORUNLU)

```
src/
├── app/                        # Next.js App Router (Sayfalar)
│   ├── api/                    # API route'ları
│   │   └── auth/
│   ├── (dashboard)/            # Dashboard layout grubu
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                 # React Bileşenleri
│   ├── ui/                    # shadcn/ui bileşenleri (DOKUNMA)
│   ├── skeletons/             # Loading skeleton bileşenleri
│   │   ├── skeleton.tsx       # Base skeleton
│   │   ├── table-skeleton.tsx
│   │   ├── card-skeleton.tsx
│   │   ├── form-skeleton.tsx
│   │   ├── list-skeleton.tsx
│   │   ├── page-skeleton.tsx
│   │   └── index.ts
│   ├── forms/                 # Form bileşenleri
│   │   ├── product-form.tsx
│   │   └── category-form.tsx
│   ├── tables/                # Tablo bileşenleri
│   │   ├── products-table.tsx
│   │   └── columns/
│   │       └── product-columns.tsx
│   └── shared/                # Paylaşılan bileşenler
│       ├── page-header.tsx
│       └── data-table.tsx
│
├── lib/                       # Yardımcı Fonksiyonlar
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client config
│   ├── utils.ts              # Utility fonksiyonlar (cn, vb.)
│   └── validations.ts        # ZOD SCHEMA'LARI (TEK DOSYA)
│
├── services/                  # API Servis Katmanı (SOLID/DRY)
│   ├── api-client.ts         # Base API client
│   ├── product.service.ts    # Ürün servisi
│   ├── category.service.ts   # Kategori servisi
│   └── index.ts              # Re-export
│
├── hooks/                     # Custom React Hooks
│   ├── queries/              # TanStack Query hooks
│   │   ├── use-products.ts
│   │   ├── use-product.ts
│   │   └── use-categories.ts
│   ├── mutations/            # TanStack Mutation hooks
│   │   ├── use-create-product.ts
│   │   ├── use-update-product.ts
│   │   └── use-delete-product.ts
│   └── index.ts              # Re-export
│
├── types/                     # TypeScript Tipleri
│   ├── product.types.ts      # Ürün tipleri
│   ├── category.types.ts     # Kategori tipleri
│   ├── api.types.ts          # API response tipleri
│   └── index.ts              # Re-export
│
├── constants/                 # Sabitler
│   ├── api-endpoints.ts      # API endpoint'leri
│   ├── query-keys.ts         # TanStack Query key'leri
│   └── index.ts              # Re-export
│
├── providers/                 # Context Provider'lar
│   ├── index.tsx
│   └── query-provider.tsx
│
docs/
├── MEMORY.md                  # Bu dosya
proxy.ts                       # Route protection (Next.js 16+)
.env.local                     # Ortam değişkenleri
```

---

## KOD YAZIM KURALLARI

### 0. Modern React/Next.js Kuralları (ZORUNLU)

#### Import Kuralları

```typescript
// ❌ YANLIŞ - Eski stil
import React from "react";
const [state, setState] = React.useState();
React.useEffect(() => {}, []);

// ✅ DOĞRU - Named import
import { useState, useEffect, useCallback, useMemo } from "react";
const [state, setState] = useState();
useEffect(() => {}, []);
```

#### use client / use server Kuralları

| Direktif | Ne Zaman Kullanılır |
|----------|---------------------|
| `"use client"` | Hook kullanan, event handler olan, browser API kullanan bileşenler |
| `"use server"` | Server Action fonksiyonları (form submit, mutation) |
| **Hiçbiri** | Varsayılan Server Component (veri çekme, statik render) |

```typescript
// Server Component (varsayılan) - direktif YOK
export default async function ProductsPage() {
  const products = await getProducts(); // Doğrudan veri çek
  return <ProductList products={products} />;
}

// Client Component - interaktif
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Server Action - form/mutation
"use server";

export async function createProduct(formData: FormData) {
  // Veritabanı işlemi
}
```

#### Suspense ve Loading Kuralları

```typescript
// ❌ YANLIŞ - Manuel loading state
"use client";
import { useState, useEffect } from "react";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  return <div>{/* ... */}</div>;
}

// ✅ DOĞRU - Suspense + Server Component
import { Suspense } from "react";
import { ProductListSkeleton } from "@/components/skeletons";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductList />
    </Suspense>
  );
}

// ProductList Server Component - veriyi doğrudan çeker
async function ProductList() {
  const products = await getProducts();
  return <div>{/* ... */}</div>;
}
```

#### Skeleton Kullanım Kuralları

| Bileşen | Skeleton |
|---------|----------|
| Tablo | `<TableSkeleton rows={10} />` |
| Kart | `<CardSkeleton />` |
| Form | `<FormSkeleton />` |
| Liste | `<ListSkeleton count={5} />` |
| Sayfa | `<PageSkeleton />` |

```typescript
// Her async bileşen Suspense ile sarılmalı
<Suspense fallback={<TableSkeleton />}>
  <ProductsTable />
</Suspense>
```

#### TanStack Query ile Suspense

```typescript
// ✅ DOĞRU - useSuspenseQuery kullan
"use client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function ProductList() {
  // Loading state yok - Suspense halleder
  const { data } = useSuspenseQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  
  return <div>{/* data her zaman mevcut */}</div>;
}

// Parent'ta Suspense ile sar
<Suspense fallback={<ProductListSkeleton />}>
  <ProductList />
</Suspense>
```

#### Yasaklı Kullanımlar

| ❌ Yasak | ✅ Alternatif |
|----------|---------------|
| `React.useState` | `useState` (named import) |
| `React.useEffect` | `useEffect` (named import) |
| `React.FC` | Direkt function declaration |
| `useEffect` ile veri çekme | Server Component veya TanStack Query |
| Manuel loading state | Suspense + Skeleton |
| `any` tipi | Doğru tip tanımı |
| `// @ts-ignore` | Tip düzeltmesi |
| AI'ın kendi başına renk seçmesi | Kullanıcıya sor veya CSS değişkeni kullan |
| `globals.css`'e izinsiz renk ekleme | Kullanıcıya sor |
| `<img>` without `alt` | `alt="açıklama"` ekle |
| `<button><Icon /></button>` | `aria-label` ekle |
| `<input>` without label | `<label>` veya `aria-label` |
| Birden fazla `<h1>` | Sayfa başına tek `<h1>` |
| `h1 → h3` atlama | Sıralı başlık hiyerarşisi |
| HTML `<img>` etiketi | `next/image` kullan |
| `fill` without `sizes` | `sizes` prop zorunlu |

---

### 0.1 Renk ve Stil Kuralları (ZORUNLU)

#### AI İçin Renk Kuralı (KRİTİK)

> **AI ASLA kendi başına renk kararı alamaz.**
> - Tailwind renkleri (`red-500`, `blue-600`, vb.) sadece KULLANICI AÇIKÇA İSTERSE kullanılır
> - `globals.css` dosyasına renk ekleme KULLANICIYA SORULMADAN yapılmaz
> - Varsayılan olarak HER ZAMAN CSS değişkenleri kullanılır

```typescript
// ❌ YANLIŞ - AI kendi başına renk seçemez
<div className="bg-gray-100 text-gray-900" />
<div className="bg-blue-500 text-red-500" />
<div style={{ backgroundColor: "#f5f5f5" }} />

// ✅ DOĞRU - Varsayılan: CSS değişkenleri
<div className="bg-background text-foreground" />
<div className="bg-primary text-destructive" />
<div className="bg-muted text-muted-foreground" />

// ✅ DOĞRU - Kullanıcı "red-500 kullan" derse
<div className="text-red-500" />  // Sadece kullanıcı istedi ise
```

#### Mevcut CSS Değişkenleri

| Değişken | Kullanım |
|----------|----------|
| `background` / `foreground` | Ana arka plan ve yazı |
| `card` / `card-foreground` | Kartlar |
| `primary` / `primary-foreground` | Ana butonlar |
| `secondary` / `secondary-foreground` | İkincil butonlar |
| `muted` / `muted-foreground` | Pasif alanlar |
| `accent` / `accent-foreground` | Hover durumları |
| `destructive` | Hata, silme |
| `border` / `input` / `ring` | Kenarlar, input, focus |

#### Opacity Kullanımı

```typescript
<div className="bg-primary/10" />      // %10 opacity
<div className="bg-primary/50" />      // %50 opacity
<div className="hover:bg-accent/80" /> // hover'da %80
```

---

### 0.2 Erişilebilirlik Kuralları (WCAG 2.2 - ZORUNLU)

> **Tüm UI bileşenleri erişilebilir olmalıdır.**
> Engelli kullanıcıların siteyi rahatça kullanabilmesi için aşağıdaki kurallar zorunludur.

#### Başlık Hiyerarşisi (Heading Hierarchy)

| Kural | Açıklama |
|-------|----------|
| Sayfa başına tek `<h1>` | Her sayfada yalnızca bir adet `<h1>` olmalı |
| Sıralı atlama yasak | `h1 → h3` atlanamaz, `h1 → h2 → h3` sıralı gitmeli |
| Anlamlı başlıklar | Başlık içeriği sayfayı/bölümü tanımlamalı |

```tsx
// ❌ YANLIŞ
<h1>Dashboard</h1>
<h3>Ürünler</h3>  // h2 atlandı

// ✅ DOĞRU
<h1>Dashboard</h1>
<h2>Ürünler</h2>
<h3>Son Eklenenler</h3>
```

#### Form Erişilebilirliği

| Kural | Açıklama |
|-------|----------|
| Her input'a label | `<label htmlFor="id">` veya `aria-label` zorunlu |
| Hata mesajları | `aria-describedby` ile input'a bağlanmalı |
| Required alanlar | `aria-required="true"` eklenmeli |
| Placeholder yeterli değil | Label yerine placeholder kullanılmamalı |

```tsx
// ❌ YANLIŞ
<input placeholder="Email" />

// ✅ DOĞRU
<label htmlFor="email">Email</label>
<input 
  id="email" 
  aria-required="true"
  aria-describedby="email-error"
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

#### Buton ve Link Kuralları

| Kural | Açıklama |
|-------|----------|
| Anlamlı içerik | "Tıkla", "Buraya tıkla" yasak |
| Icon-only buton | `aria-label` zorunlu |
| Link vs Button | Navigasyon = `<a>`, Aksiyon = `<button>` |
| Yeni sekme uyarısı | `target="_blank"` için screen reader bilgisi |

```tsx
// ❌ YANLIŞ
<button><TrashIcon /></button>
<a href="#">Tıkla</a>

// ✅ DOĞRU
<button aria-label="Ürünü sil"><TrashIcon /></button>
<a href="/urunler">Ürünleri görüntüle</a>
<a href="..." target="_blank" rel="noopener">
  Dış site <span className="sr-only">(yeni sekmede açılır)</span>
</a>
```

#### Görsel Erişilebilirlik

| Kural | Açıklama |
|-------|----------|
| Alt text zorunlu | Tüm `<img>` için `alt` attribute |
| Dekoratif görseller | `alt=""` ve `aria-hidden="true"` |
| Renk kontrastı | Minimum 4.5:1 (normal), 3:1 (büyük text) |
| Sadece renkle bilgi yok | Renk + ikon/text birlikte kullanılmalı |

```tsx
// ❌ YANLIŞ
<img src="product.jpg" />
<span className="text-destructive">Hata</span>  // Sadece renk

// ✅ DOĞRU
<img src="product.jpg" alt="Trek Marlin 7 Dağ Bisikleti" />
<span className="text-destructive">
  <AlertIcon aria-hidden="true" /> Hata oluştu
</span>
```

#### Klavye Navigasyonu

| Kural | Açıklama |
|-------|----------|
| Tab ile ulaşılabilir | Tüm interaktif öğeler keyboard accessible |
| Focus görünür | `focus-visible:ring-2` zorunlu |
| Focus sırası mantıklı | DOM sırası = görsel sıra |

```tsx
// ✅ Focus her zaman görünür
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Kaydet
</button>
```

#### Dinamik İçerik & ARIA Live

```tsx
// ✅ Loading durumu
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? "Yükleniyor..." : content}
</div>

// ✅ Toast/Alert bildirimi
<div role="alert" aria-live="assertive">
  Ürün başarıyla kaydedildi
</div>

// ✅ Modal/Dialog
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Onay</h2>
</div>
```

#### Semantic HTML Kullanımı

| Element | Kullanım |
|---------|----------|
| `<header>` | Sayfa/bölüm başlığı |
| `<nav>` | Navigasyon menüleri |
| `<main>` | Ana içerik (sayfa başına tek) |
| `<aside>` | Yan içerik (sidebar) |
| `<footer>` | Alt bilgi |
| `<section>` | Tematik bölümler (`aria-labelledby` ile) |

#### Screen Reader Yardımcıları

```tsx
// Görsel olarak gizli ama screen reader okur
<span className="sr-only">Ekran okuyucu için metin</span>

// Screen reader'dan gizle (dekoratif ikonlar)
<Icon aria-hidden="true" />
```

#### Erişilebilirlik Yasak Listesi

| ❌ Yasak | ✅ Alternatif |
|----------|---------------|
| `<img>` without `alt` | `<img alt="açıklama">` |
| `<button><Icon /></button>` | `<button aria-label="...">` |
| `<input>` without label | `<label>` veya `aria-label` |
| `<div onClick>` | `<button>` kullan |
| Sadece renk ile bilgi | Renk + ikon/text |
| `h1 → h3` atlama | Sıralı başlık hiyerarşisi |
| "Tıkla", "Buraya tıkla" | Anlamlı link/buton metni |

---

### 0.3 Next.js Image Kullanım Kuralları (ZORUNLU)

> **HTML `<img>` etiketi YASAKTIR. Her zaman `next/image` kullanılmalıdır.**

#### Temel Kullanım

```tsx
import Image from "next/image";

// ✅ Statik import (önerilen - otomatik optimizasyon)
import productImage from "@/public/images/product.jpg";

<Image
  src={productImage}
  alt="Trek Marlin 7 Dağ Bisikleti"
  placeholder="blur"  // Statik import'ta otomatik blur
/>

// ✅ Dinamik/Remote görsel
<Image
  src="https://cdn.example.com/product.jpg"
  alt="Ürün görseli"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Zorunlu Props

| Prop | Açıklama | Zorunlu |
|------|----------|---------|
| `src` | Görsel kaynağı | ✅ Evet |
| `alt` | Erişilebilirlik için açıklama | ✅ Evet |
| `width` + `height` | Boyutlar (fill kullanılmıyorsa) | ✅ Evet |
| `fill` | Parent'ı doldur (width/height yerine) | Alternatif |

#### `sizes` Prop (Responsive - ZORUNLU)

`fill` kullanıldığında veya responsive tasarımda **sizes zorunludur**:

```tsx
// ❌ YANLIŞ - sizes olmadan fill
<Image src="..." alt="..." fill />

// ✅ DOĞRU - sizes ile fill
<Image
  src="..."
  alt="..."
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

| Breakpoint | sizes Değeri | Kullanım |
|------------|--------------|----------|
| Mobil (< 768px) | `100vw` | Tam genişlik |
| Tablet (< 1200px) | `50vw` | Yarı genişlik |
| Desktop | `33vw` | Grid'de 1/3 |

#### `priority` Prop (LCP Optimizasyonu)

Above-the-fold (ilk görünen) görseller için **priority** kullan:

```tsx
// ✅ Hero banner, ana ürün görseli
<Image
  src={heroImage}
  alt="Ana banner"
  priority  // Lazy loading devre dışı, preload aktif
  sizes="100vw"
/>

// ❌ Sayfa altındaki görsellerde priority KULLANMA
<Image src={footerImage} alt="..." />  // Varsayılan lazy loading
```

#### `placeholder` Prop (UX)

```tsx
// ✅ Statik import - otomatik blur
import product from "@/public/product.jpg";
<Image src={product} alt="..." placeholder="blur" />

// ✅ Remote görsel - manuel blurDataURL
<Image
  src="https://..."
  alt="..."
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>

// Blur data URL oluşturma: plaiceholder veya png-pixel.com
```

#### `fill` ile Kullanım (Dinamik Boyut)

```tsx
// Parent'a position: relative gerekli!
<div className="relative aspect-video">
  <Image
    src="..."
    alt="..."
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"  // cover, contain, none
  />
</div>
```

#### Remote Görseller için next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.alpinbisiklet.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
  },
};

export default config;
```

#### Image Yasak Listesi

| ❌ Yasak | ✅ Alternatif |
|----------|---------------|
| `<img src="...">` | `<Image src="..." />` |
| `fill` without `sizes` | `sizes` prop ekle |
| Remote görsel without config | `remotePatterns` ekle |
| LCP görsel without `priority` | `priority` ekle |
| `alt=""` (boş) meaningful görsel | Açıklayıcı alt text |
| Fixed width/height responsive'de | `fill` + `sizes` kullan |

#### Performans Kontrol Listesi

- [ ] Tüm görseller `next/image` ile mi?
- [ ] LCP görseline `priority` eklendi mi?
- [ ] `fill` kullanıyorsa `sizes` var mı?
- [ ] Remote görseller `remotePatterns`'da tanımlı mı?
- [ ] Statik görsellerde `placeholder="blur"` var mı?
- [ ] `alt` text anlamlı mı?

---

### 1. Dosya Oluşturma Sırası

Yeni bir özellik (örn: "Ürün yönetimi") eklerken şu sırayla ilerle:

```
1. types/product.types.ts        → Tipleri tanımla
2. lib/validations.ts            → Zod schema'ları ekle
3. constants/api-endpoints.ts    → Endpoint'leri ekle
4. constants/query-keys.ts       → Query key'leri ekle
5. services/product.service.ts   → Servis fonksiyonlarını yaz
6. hooks/queries/use-products.ts → Query hook'larını yaz
7. hooks/mutations/use-*.ts      → Mutation hook'larını yaz
8. components/forms/             → Form bileşenlerini yaz
9. components/tables/            → Tablo bileşenlerini yaz
10. app/(dashboard)/products/    → Sayfaları oluştur
```

---

## TYPES (Tip Tanımları)

### Konum: `src/types/`

### Dosya Yapısı:

```typescript
// src/types/product.types.ts

/** Veritabanından gelen ürün */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Ürün listesi için özet */
export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

/** Ürün detay sayfası için (ilişkili verilerle) */
export interface ProductWithCategory extends Product {
  category: {
    id: number;
    name: string;
  } | null;
}
```

### Kurallar:
- Her domain için ayrı dosya (`product.types.ts`, `category.types.ts`)
- `interface` kullan, `type` sadece union/intersection için
- Veritabanı entity'si, list item ve detay için ayrı tipler
- `index.ts`'den re-export et

---

## CONSTANTS (Sabitler)

### API Endpoints: `src/constants/api-endpoints.ts`

```typescript
// src/constants/api-endpoints.ts

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${BASE_URL}/api/products`,
  PRODUCT: (id: number) => `${BASE_URL}/api/products/${id}`,
  
  // Categories
  CATEGORIES: `${BASE_URL}/api/categories`,
  CATEGORY: (id: number) => `${BASE_URL}/api/categories/${id}`,
  
  // Auth
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/sign-in/email`,
    REGISTER: `${BASE_URL}/api/auth/sign-up/email`,
    LOGOUT: `${BASE_URL}/api/auth/sign-out`,
  },
} as const;
```

### Query Keys: `src/constants/query-keys.ts`

```typescript
// src/constants/query-keys.ts

export const QUERY_KEYS = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...QUERY_KEYS.products.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...QUERY_KEYS.products.lists(), filters] as const,
    details: () => [...QUERY_KEYS.products.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.products.details(), id] as const,
  },
  
  // Categories
  categories: {
    all: ["categories"] as const,
    list: () => [...QUERY_KEYS.categories.all, "list"] as const,
    detail: (id: number) => [...QUERY_KEYS.categories.all, "detail", id] as const,
  },
} as const;
```

---

## SERVICES (Servis Katmanı - SOLID/DRY)

### Base API Client: `src/services/api-client.ts`

```typescript
// src/services/api-client.ts

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...init } = config;
    
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "API Error");
    }

    return response.json();
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
```

### Domain Service Örneği: `src/services/product.service.ts`

```typescript
// src/services/product.service.ts

import { apiClient } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { Product, ProductListItem, ProductWithCategory } from "@/types";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations";

// Response tipleri
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
}

// Service fonksiyonları
export const productService = {
  /** Tüm ürünleri getir (sayfalı) */
  getAll: async (filters: ProductFilters = {}) => {
    return apiClient.get<PaginatedResponse<ProductListItem>>(
      API_ENDPOINTS.PRODUCTS,
      { params: filters as Record<string, string | number | boolean> }
    );
  },

  /** Tek ürün getir */
  getById: async (id: number) => {
    return apiClient.get<ProductWithCategory>(API_ENDPOINTS.PRODUCT(id));
  },

  /** Ürün oluştur */
  create: async (data: CreateProductInput) => {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  },

  /** Ürün güncelle */
  update: async (id: number, data: UpdateProductInput) => {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCT(id), data);
  },

  /** Ürün sil */
  delete: async (id: number) => {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.PRODUCT(id));
  },
};
```

### Kurallar:
- Her domain için bir service dosyası
- Service'ler stateless olmalı (class instance değil, object)
- Tüm API çağrıları `apiClient` üzerinden
- Response tipleri açıkça belirtilmeli
- Input tipleri `validations.ts`'den import edilmeli

---

## HOOKS (TanStack Query)

### Query Hook Örneği: `src/hooks/queries/use-products.ts`

```typescript
// src/hooks/queries/use-products.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { enabled = true, ...filters } = options;

  return useQuery({
    queryKey: QUERY_KEYS.products.list(filters),
    queryFn: () => productService.getAll(filters),
    enabled,
  });
}
```

### Query Hook (Tekil): `src/hooks/queries/use-product.ts`

```typescript
// src/hooks/queries/use-product.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";

export function useProduct(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.products.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}
```

### Mutation Hook Örneği: `src/hooks/mutations/use-create-product.ts`

```typescript
// src/hooks/mutations/use-create-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";
import type { CreateProductInput } from "@/lib/validations";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productService.create(data),
    onSuccess: () => {
      // Ürün listesini invalidate et
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.products.lists() 
      });
    },
  });
}
```

### Mutation Hook (Update): `src/hooks/mutations/use-update-product.ts`

```typescript
// src/hooks/mutations/use-update-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";
import type { UpdateProductInput } from "@/lib/validations";

interface UpdateProductVariables {
  id: number;
  data: UpdateProductInput;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductVariables) => 
      productService.update(id, data),
    onSuccess: (_, { id }) => {
      // Hem listeyi hem detayı invalidate et
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.products.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.products.detail(id) 
      });
    },
  });
}
```

### Mutation Hook (Delete): `src/hooks/mutations/use-delete-product.ts`

```typescript
// src/hooks/mutations/use-delete-product.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.products.lists() 
      });
    },
  });
}
```

### Hook Index: `src/hooks/index.ts`

```typescript
// src/hooks/index.ts

// Queries
export * from "./queries/use-products";
export * from "./queries/use-product";
export * from "./queries/use-categories";

// Mutations
export * from "./mutations/use-create-product";
export * from "./mutations/use-update-product";
export * from "./mutations/use-delete-product";
```

### Kurallar:
- Her query/mutation için ayrı dosya (Single Responsibility)
- Hook'lar `"use client"` ile başlar
- Query key'ler `QUERY_KEYS` sabitinden gelir
- Service fonksiyonları doğrudan çağrılır
- Mutation sonrası ilgili query'ler invalidate edilir
- Options ile esneklik sağlanır (`enabled`, filters, vb.)

---

## COMPONENTS

### Form Bileşeni Örneği: `src/components/forms/product-form.tsx`

```typescript
// src/components/forms/product-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations";
import { useCreateProduct, useUpdateProduct } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// ... diğer importlar

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: CreateProductInput;
  productId?: number;
  onSuccess?: () => void;
}

export function ProductForm({ 
  mode, 
  initialData, 
  productId,
  onSuccess 
}: ProductFormProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    if (mode === "create") {
      await createMutation.mutateAsync(data);
    } else if (productId) {
      await updateMutation.mutateAsync({ id: productId, data });
    }
    onSuccess?.();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form alanları */}
    </form>
  );
}
```

### Tablo Bileşeni: `src/components/tables/products-table.tsx`

```typescript
// src/components/tables/products-table.tsx
"use client";

import { useProducts, useDeleteProduct } from "@/hooks";
import { DataTable } from "@/components/shared/data-table";
import { productColumns } from "./columns/product-columns";

interface ProductsTableProps {
  filters?: {
    search?: string;
    categoryId?: number;
  };
}

export function ProductsTable({ filters }: ProductsTableProps) {
  const { data, isLoading } = useProducts(filters);
  const deleteMutation = useDeleteProduct();

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <DataTable
      columns={productColumns}
      data={data?.data ?? []}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  );
}
```

---

## VALIDATIONS (Zod Schema'ları)

### Konum: `src/lib/validations.ts` (TEK DOSYA)

### Yapı:

```typescript
// src/lib/validations.ts

import { z } from "zod";

// ============================================
// ORTAK SCHEMA'LAR
// ============================================
export const idSchema = z.number().int().positive();
export const paginationSchema = z.object({...});

// ============================================
// ÜRÜN SCHEMA'LARI
// ============================================
export const createProductSchema = z.object({...});
export const updateProductSchema = createProductSchema.partial();
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================
// KATEGORİ SCHEMA'LARI
// ============================================
// ... devamı
```

---

## API ROUTES (Backend)

### Konum: `src/app/api/`

### Örnek: `src/app/api/products/route.ts`

```typescript
// src/app/api/products/route.ts

import { NextResponse } from "next/server";
import { createProductSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  
  // Veritabanı sorgusu...
  
  return NextResponse.json({
    data: products,
    meta: { total, page, limit, totalPages }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createProductSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { message: "Validation error", errors: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // Veritabanına kaydet...
  
  return NextResponse.json(product, { status: 201 });
}
```

---

## PROXY.TS (Route Protection - Next.js 16+)

### Konum: `proxy.ts` (proje kökünde)

> **ÖNEMLİ:** Next.js 16'da `middleware.ts` dosyası `proxy.ts` olarak yeniden adlandırıldı.
> Fonksiyon adı da `middleware` yerine `proxy` olmalıdır.

### Yapı:

```typescript
// proxy.ts

import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy
 * Route protection ve authentication kontrolü
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hesap/:path*",
    "/profil/:path*",
  ],
};
```

### Kurallar:

| Kural | Açıklama |
|-------|----------|
| **Dosya adı** | `proxy.ts` (middleware.ts DEĞİL) |
| **Fonksiyon adı** | `export function proxy()` (middleware DEĞİL) |
| **Konum** | Proje kökünde (src/ içinde DEĞİL) |
| **matcher** | Korunacak rotalar config.matcher içinde tanımlanır |
| **Auth kontrolü** | `getSessionCookie()` ile session kontrolü yapılır |

---

## ÖZEL DOSYALAR (Next.js 16 File Conventions)

### Konum: `src/app/` (root)

| Dosya | HTTP | Açıklama | Tetikleyici |
|-------|------|----------|-------------|
| `not-found.tsx` | 404 | Sayfa bulunamadı | `notFound()` veya olmayan rota |
| `unauthorized.tsx` | 401 | Giriş gerekli | `unauthorized()` |
| `forbidden.tsx` | 403 | Yetki yok | `forbidden()` |
| `loading.tsx` | - | Yükleme durumu | Otomatik (Suspense) |

### Kullanım Kuralları:

```typescript
// Server Component içinde kullanım
import { unauthorized, forbidden, notFound } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // 1. Giriş kontrolü - 401
  if (!session) {
    unauthorized();
  }
  
  // 2. Yetki kontrolü - 403
  if (!session.user.isAdmin) {
    forbidden();
  }
  
  // 3. Veri kontrolü - 404
  const data = await getData();
  if (!data) {
    notFound();
  }
  
  return <div>...</div>;
}
```

### Kurallar:

| Kural | Açıklama |
|-------|----------|
| **Konum** | Tüm özel dosyalar `src/app/` root'ta bulunur |
| **loading.tsx** | Her route segment için ayrı loading olabilir |
| **unauthorized** | Auth kontrolünde session yoksa kullanılır |
| **forbidden** | Auth var ama yetki yoksa kullanılır |
| **notFound** | Veri bulunamadığında kullanılır |

---

## SAYFA YAPISI

### Konum: `src/app/(dashboard)/`

### Örnek Liste Sayfası: `src/app/(dashboard)/products/page.tsx`

```typescript
// src/app/(dashboard)/products/page.tsx

import { ProductsTable } from "@/components/tables/products-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürünler"
        description="Ürün listesi ve yönetimi"
        actions={
          <Button asChild>
            <Link href="/products/new">Yeni Ürün</Link>
          </Button>
        }
      />
      <ProductsTable />
    </div>
  );
}
```

---

## ÖZET: DOSYA SORUMLULUKLARI

| Klasör | Sorumluluk | Örnek |
|--------|------------|-------|
| `types/` | TypeScript interface'leri | `Product`, `Category` |
| `constants/` | Sabitler, endpoint'ler, query key'ler | `API_ENDPOINTS`, `QUERY_KEYS` |
| `services/` | API çağrıları (fetch logic) | `productService.getAll()` |
| `hooks/queries/` | TanStack Query hook'ları | `useProducts()` |
| `hooks/mutations/` | TanStack Mutation hook'ları | `useCreateProduct()` |
| `lib/validations.ts` | Zod schema'ları | `createProductSchema` |
| `components/forms/` | Form bileşenleri | `ProductForm` |
| `components/tables/` | Tablo bileşenleri | `ProductsTable` |
| `app/api/` | Backend API route'ları | `GET /api/products` |
| `app/(dashboard)/` | Sayfa bileşenleri | `ProductsPage` |

---

## IMPORT SIRASI (Her Dosyada)

```typescript
// 1. React/Next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. Üçüncü parti kütüphaneler
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 3. İç tipler
import type { Product } from "@/types";

// 4. İç sabitler
import { QUERY_KEYS, API_ENDPOINTS } from "@/constants";

// 5. İç servisler
import { productService } from "@/services";

// 6. İç hook'lar
import { useProducts } from "@/hooks";

// 7. İç bileşenler
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/forms/product-form";

// 8. Stiller (varsa)
import "./styles.css";
```

---

## Komutlar

```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run start    # Production sunucusu
npm run lint     # Biome lint kontrolü
npm run format   # Biome format
npm run check    # Biome lint + format + fix
```

---

## Ortam Değişkenleri

```env
BETTER_AUTH_SECRET=           # Auth için gizli anahtar
BETTER_AUTH_URL=              # Uygulama URL'i
NEXT_PUBLIC_APP_URL=          # Public URL
DATABASE_URL=                 # Veritabanı bağlantısı
```

---

*Son güncelleme: Şubat 2026*

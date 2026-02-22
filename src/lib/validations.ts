import { z } from "zod";

// ============================================
// ORTAK SCHEMA'LAR
// ============================================

/** ID validasyonu (pozitif integer) */
export const idSchema = z.number().int().positive();

/** UUID validasyonu */
export const uuidSchema = z.string().uuid();

/** Sayfalama schema'sı */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

/** Sıralama schema'sı */
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// ÜRÜN SCHEMA'LARI
// ============================================

/** Ürün oluşturma schema'sı */
/** Ürün görseli schema'sı */
export const productImageSchema = z.object({
  url: z.string().url("Geçerli bir URL gerekli"),
  alt: z.string().optional(),
  order: z.number().int().default(0),
});

/** Ürün varyantı schema'sı */
export const productVariantSchema = z.object({
  name: z.string().min(1, "Varyant adı gerekli"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  sizeLabel: z.string().optional(),
  minHeight: z.number().positive().optional(),
  maxHeight: z.number().positive().optional(),
  minInseam: z.number().positive().optional(),
  maxInseam: z.number().positive().optional(),
});

/** Ürün oluşturma schema'sı */
export const createProductSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  comparePrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().int().nonnegative("Stok negatif olamaz").default(0),
  lowStockAlert: z.number().int().nonnegative().default(5),
  trackStock: z.boolean().default(true),
  weight: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  length: z.number().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  brandId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  images: z.array(productImageSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
});

/** Ürün güncelleme schema'sı (tüm alanlar opsiyonel) */
export const updateProductSchema = createProductSchema.partial();

/** Ürün tipi */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================
// KATEGORİ SCHEMA'LARI
// ============================================

/** Kategori oluşturma schema'sı */
export const createCategorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalı"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
  type: z.enum(["BICYCLE", "CLOTHING", "GENERAL"]).default("GENERAL"),
});

/** Kategori güncelleme schema'sı */
export const updateCategorySchema = createCategorySchema.partial();

/** Kategori tipleri */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ============================================
// KULLANICI SCHEMA'LARI
// ============================================

/** Email validasyonu */
export const emailSchema = z.string().email("Geçerli bir email adresi girin");

/** Şifre validasyonu */
export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
  .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli");

/** Giriş schema'sı */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Şifre gerekli"),
});

/** Kayıt schema'sı */
export const registerSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

/** Kullanıcı tipleri */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// MARKA SCHEMA'LARI
// ============================================

/** Marka oluşturma schema'sı */
export const createBrandSchema = z.object({
  name: z.string().min(2, "Marka adı en az 2 karakter olmalı"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().default(true),
});

/** Marka güncelleme schema'sı */
export const updateBrandSchema = createBrandSchema.partial();

/** Marka tipleri */
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

// ============================================
// BANNER SCHEMA'LARI
// ============================================

/** Banner oluşturma schema'sı */
export const createBannerSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
  subtitle: z.string().optional(),
  image: z.string().url("Geçerli bir resim URL'si gerekli"),
  mobileImage: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  position: z.enum(["HERO", "SIDEBAR", "CATEGORY", "PRODUCT", "POPUP"]).default("HERO"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(), // Date picker usually returns string
  endDate: z.string().optional(),
});

/** Banner güncelleme schema'sı */
export const updateBannerSchema = createBannerSchema.partial();

/** Banner tipleri */
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

// ============================================
// SAYFA SCHEMA'LARI
// ============================================

/** Sayfa olusturma schema'si */
export const createPageSchema = z.object({
  title: z.string().min(2, "Baslik en az 2 karakter olmali"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug sadece kucuk harf, rakam ve tire icerebilir")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  content: z.string().min(1, "Icerik gerekli"),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

/** Sayfa guncelleme schema'si */
export const updatePageSchema = createPageSchema.partial();

/** Sayfa tipleri */
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

// ============================================
// BLOG SCHEMA'LARI
// ============================================

/** Blog yazısı oluşturma schema'sı */
export const createBlogSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  content: z.string().min(1, "İçerik gerekli"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

/** Blog yazısı güncelleme schema'sı */
export const updateBlogSchema = createBlogSchema.partial();

/** Blog tipleri */
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;

// ============================================
// KUPON SCHEMA'LARI
// ============================================

/** Kupon olusturma schema'si */
export const createCouponSchema = z.object({
  code: z.string().min(3, "Kupon kodu en az 3 karakter olmali"),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().nonnegative("Deger negatif olamaz"),
  minPurchase: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  validFrom: z.string().or(z.date()),
  validTo: z.string().or(z.date()),
  isActive: z.boolean().default(true),
});

/** Kupon guncelleme schema'si */
export const updateCouponSchema = createCouponSchema.partial();

/** Kupon tipleri */
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// ============================================
// AYARLAR SCHEMA'LARI
// ============================================

/** Mağaza ayarları schema'sı (tüm değerler string olarak saklanır) */
export const settingsSchema = z.object({
  store_name: z.string(),
  store_email: z.string(),
  store_phone: z.string(),
  store_address: z.string(),
  tax_rate: z.string(),
  payment_iyzico_enabled: z.string(),
  payment_bank_transfer_enabled: z.string(),
  payment_cod_enabled: z.string(),
  shipping_free_threshold: z.string(),
  shipping_default_cost: z.string(),
  shipping_estimated_days: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  seo_keywords: z.string(),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

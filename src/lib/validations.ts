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
  url: z.string().min(1, "URL gerekli"), // Yerel upload path'leri için .url() yerine .min(1)
  alt: z.string().nullish(),             // DB'den null gelebilir
  order: z.number().int().default(0),
});

/** Ürün videosu schema'sı */
export const productVideoSchema = z.object({
  url: z.string().min(1, "URL gerekli"), // Yerel upload path'leri için .url() yerine .min(1)
  thumbnail: z.string().nullish(),       // DB'den null gelebilir
  title: z.string().nullish(),           // DB'den null gelebilir
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
  videos: z.array(productVideoSchema).optional(),
  model3dUrl: z.string().optional(),
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
  image: z.string().min(1, "Resim gerekli"), // Yerel upload path'leri için .url() yerine .min(1)
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
  maxUsesPerUser: z.number().int().positive().optional().nullable(),
  minQuantity: z.number().int().positive().optional().nullable(),
  firstOrderOnly: z.boolean().default(false),
  validFrom: z.string().or(z.date()),
  validTo: z.string().or(z.date()),
  isActive: z.boolean().default(true),
  categoryIds: z.array(z.number().int()).optional(),
  productIds: z.array(z.number().int()).optional(),
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

// ============================================
// ADRES SCHEMA'LARI
// ============================================

/** Türkiye telefon numarası: 05XX XXX XX XX (boşluklu veya boşluksuz) */
const turkishPhoneSchema = z
  .string()
  .min(10, "Telefon numarası gerekli")
  .refine(
    (v) => /^0[5-9]\d[\d\s]{8,9}$/.test(v.replace(/\s/g, "").replace(/^(\d{4})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4")),
    "Geçerli bir Türkiye telefon numarası girin (05XX XXX XX XX)",
  );

export const createAddressSchema = z.object({
  title: z.string().min(2, "Adres başlığı en az 2 karakter olmalı"),
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  phone: z
    .string()
    .min(10, "Telefon numarası gerekli")
    .refine((v) => /^\d[\d\s]{9,12}$/.test(v), "Geçerli bir telefon numarası girin"),
  city: z.string().min(1, "İl seçiniz"),
  district: z.string().min(1, "İlçe seçiniz"),
  neighborhood: z.string().optional().or(z.literal("")),
  address: z.string().min(5, "Adres en az 5 karakter olmalı"),
  postalCode: z.string().optional().or(z.literal("")),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

// ============================================
// HESAP AYARLARI SCHEMA'LARI
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^\d[\d\s]{9,12}$/.test(v),
      "Geçerli bir telefon numarası girin",
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Şifreyi tekrar girin"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// ELDEN TAKSİT SCHEMA'LARI
// ============================================

export const createEldenTaksitSchema = z.object({
  customerName: z.string().min(2, "İsim gerekli"),
  customerPhone: z.string().min(10, "Geçerli telefon gerekli"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")),
  productId: z.number().int().positive().optional().nullable(),
  productNote: z.string().optional(),
  totalAmount: z.number().positive("Tutar pozitif olmalı"),
  installmentCount: z.number().int().min(1).max(60),
  installmentAmount: z.number().positive(),
  startDate: z.string(),
  notes: z.string().optional(),
});

export const updateEldenTaksitSchema = createEldenTaksitSchema.partial().extend({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export const markInstallmentPaidSchema = z.object({
  isPaid: z.boolean(),
  paidAmount: z.number().positive().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateEldenTaksitInput = z.infer<typeof createEldenTaksitSchema>;
export type UpdateEldenTaksitInput = z.infer<typeof updateEldenTaksitSchema>;
export type MarkInstallmentPaidInput = z.infer<typeof markInstallmentPaidSchema>;

// ============================================
// İNDİRİM SCHEMA'LARI
// ============================================

export const createDiscountSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter"),
  type: z.enum(["CATEGORY", "STORE_WIDE", "ON_SALE"]),
  categoryId: z.number().int().positive().optional().nullable(),
  value: z.number().positive().max(100, "Maks %100"),
  isActive: z.boolean().default(true),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

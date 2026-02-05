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
export const createProductSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  stock: z.number().int().nonnegative("Stok negatif olamaz").default(0),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
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
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional(),
  parentId: z.number().int().positive().optional(),
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

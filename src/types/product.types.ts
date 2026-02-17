/** Veritabanından gelen ürün entity'si */
export interface Product {
  id: number;
  name: string;
  slug: string; // Added slug
  description: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  isActive: boolean;
  isFeatured: boolean; // Added isFeatured
  createdAt: Date;
  updatedAt: Date;
}

/** Ürün görseli */
export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  order: number;
}

/** Ürün listesi için özet (tabloda gösterilecek) */
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: ProductImage[];
  category: { id: number; name: string } | null;
  brand?: { id: number; name: string } | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
}

/** Ürün detay sayfası için (ilişkili verilerle) */
export interface ProductWithCategory extends Product {
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  images: ProductImage[];
}

/** Ürün filtre parametreleri */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  hasDiscount?: boolean;
  orderBy?: "price_asc" | "price_desc" | "name_asc" | "newest";
  minPrice?: number;
  maxPrice?: number;
  take?: number;
}

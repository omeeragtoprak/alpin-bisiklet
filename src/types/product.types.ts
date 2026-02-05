/** Veritabanından gelen ürün entity'si */
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

/** Ürün listesi için özet (tabloda gösterilecek) */
export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryName: string | null;
  isActive: boolean;
}

/** Ürün detay sayfası için (ilişkili verilerle) */
export interface ProductWithCategory extends Product {
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

/** Ürün filtre parametreleri */
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

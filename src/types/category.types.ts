/** Veritabanından gelen kategori entity'si */
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null; // Added image
  order: number; // Added order
  isActive: boolean; // Added isActive
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Kategori listesi için özet */
export interface CategoryListItem {
  id: number;
  name: string;
  slug: string;
  image: string | null; // Added image
  parentId: number | null; // Added parentId
  order: number; // Added order
  isActive: boolean; // Added isActive
  productCount: number;
}

/** Alt kategorilerle birlikte kategori */
export interface CategoryWithChildren extends Category {
  children: CategoryListItem[];
  parent: {
    id: number;
    name: string;
  } | null;
}

/** Kategori select/dropdown için */
export interface CategoryOption {
  value: number;
  label: string;
}

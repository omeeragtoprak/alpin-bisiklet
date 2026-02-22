"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Category, ListParams } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface CategoryWithImages extends Category {
  productImages: string[];
}

interface UseCategoriesOptions extends ListParams {
  enabled?: boolean;
}

/**
 * Kategori listesi hook'u
 */
export function useCategories(options: UseCategoriesOptions = {}) {
  const { enabled = true, ...params } = options;

  return useQuery({
    queryKey: QUERY_KEYS.categories.list(params),
    queryFn: () => categoryService.getAll(params),
    enabled,
  });
}

/**
 * Kategori seçenekleri hook'u (dropdown için)
 */
export function useCategoryOptions(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.categories.options(),
    queryFn: () => categoryService.getOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Anasayfa için kategoriler + ürün görselleri
 * Üst kategorileri (max 6) çeker; her birinin ürün görsellerini de getirir.
 */
export function useHomeCategories() {
  return useQuery({
    queryKey: ["home-categories"] as const,
    queryFn: async () => {
      const allCategories = await categoryService.getAll();
      const parents = allCategories
        .filter((c) => !c.parentId && c.isActive)
        .sort((a, b) => a.order - b.order)
        .slice(0, 6);

      const withImages = await Promise.all(
        parents.map(async (cat) => {
          try {
            const res = await productService.getAll({ categoryId: cat.id, limit: 6 });
            const images = res.data
              .filter((p) => p.images?.length > 0)
              .map((p) => p.images[0].url);
            return { ...cat, productImages: images } as CategoryWithImages;
          } catch {
            return { ...cat, productImages: [] } as CategoryWithImages;
          }
        }),
      );

      return withImages;
    },
    staleTime: 10 * 60 * 1000,
  });
}

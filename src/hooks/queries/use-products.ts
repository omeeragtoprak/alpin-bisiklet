"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";
import type { ProductFilters } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface UseProductsOptions extends ProductFilters {
  enabled?: boolean;
}

/**
 * Ürün listesi hook'u
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { enabled = true, ...filters } = options;

  return useQuery({
    queryKey: QUERY_KEYS.products.list(filters),
    queryFn: () => productService.getAll(filters),
    enabled,
  });
}

/** Öne çıkan ürünler (anasayfa) */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ isFeatured: true, limit: 8 }),
    queryFn: () => productService.getAll({ isFeatured: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });
}

/** İndirimli ürünler (anasayfa) */
export function useDiscountedProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ hasDiscount: true, limit: 15 }),
    queryFn: () => productService.getAll({ hasDiscount: true, limit: 15 }),
    staleTime: 5 * 60 * 1000,
  });
}

/** Popüler ürünler (anasayfa) */
export function usePopularProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ isFeatured: true, limit: 4 }),
    queryFn: () => productService.getAll({ isFeatured: true, limit: 4 }),
    staleTime: 5 * 60 * 1000,
  });
}

/** Yeni ürünler (anasayfa) */
export function useNewProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ isNew: true, limit: 8 }),
    queryFn: () => productService.getAll({ isNew: true, limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });
}

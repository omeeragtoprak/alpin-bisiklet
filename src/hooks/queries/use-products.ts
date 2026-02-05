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

"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

interface UseProductOptions {
  enabled?: boolean;
}

/**
 * Tek ürün detay hook'u
 */
export function useProduct(id: number, options: UseProductOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.products.detail(id),
    queryFn: () => productService.getById(id),
    enabled: enabled && !!id,
  });
}

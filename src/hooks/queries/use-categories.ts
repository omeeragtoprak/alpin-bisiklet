"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { categoryService } from "@/services/category.service";
import type { ListParams } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
    staleTime: 5 * 60 * 1000, // 5 dakika cache
  });
}

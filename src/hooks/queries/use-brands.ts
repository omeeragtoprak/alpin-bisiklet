"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { brandService } from "@/services/brand.service";

export function useBrands(params?: { categoryId?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.brands.list(params),
    queryFn: () => brandService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

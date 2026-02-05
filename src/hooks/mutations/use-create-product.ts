"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import type { CreateProductInput } from "@/lib/validations";
import { productService } from "@/services/product.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Ürün oluşturma mutation hook'u
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productService.create(data),
    onSuccess: () => {
      // Ürün listelerini invalidate et
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.lists(),
      });
    },
  });
}

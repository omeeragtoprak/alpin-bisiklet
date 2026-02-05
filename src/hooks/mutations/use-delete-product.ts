"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { productService } from "@/services/product.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Ürün silme mutation hook'u
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      // Ürün listelerini invalidate et
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.lists(),
      });
    },
  });
}

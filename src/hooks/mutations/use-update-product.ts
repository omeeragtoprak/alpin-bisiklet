"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import type { UpdateProductInput } from "@/lib/validations";
import { productService } from "@/services/product.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateProductVariables {
  id: number;
  data: UpdateProductInput;
}

/**
 * Ürün güncelleme mutation hook'u
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductVariables) => productService.update(id, data),
    onSuccess: (_, { id }) => {
      // Hem listeyi hem detayı invalidate et
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(id),
      });
    },
  });
}

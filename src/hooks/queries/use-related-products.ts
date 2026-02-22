"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import type { ProductListItem } from "@/types";

interface RelatedProductsResponse {
  similar: ProductListItem[];
  complementary: ProductListItem[];
}

/**
 * Bir ürüne ait benzer ve tamamlayıcı ürünleri getirir.
 * SimilarProducts ve ComplementaryProducts aynı query key'i
 * paylaşır — sayfada ikisi birden varsa tek API isteği yapılır.
 */
export function useRelatedProducts(productId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.relatedProducts.detail(productId),
    queryFn: async () => {
      const res = await fetch(`/api/products/related/${productId}`);
      if (!res.ok) throw new Error("İlgili ürünler yüklenemedi");
      return res.json() as Promise<RelatedProductsResponse>;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useDebounce } from "./use-debounce";

export interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: { url: string; alt: string | null }[];
  brand: { name: string } | null;
  category: { name: string } | null;
}

export interface SearchBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  _count: { products: number };
}

export interface SearchCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface SearchResults {
  products: SearchProduct[];
  brands: SearchBrand[];
  categories: SearchCategory[];
  total: number;
}

async function fetchSuggestions(q: string, limit = 6): Promise<SearchResults> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error("Arama başarısız");
  return res.json();
}

/**
 * Debounced arama hook'u — min 3 karakter, 350ms debounce
 */
export function useSearch(options?: { minChars?: number; delay?: number; limit?: number }) {
  const { minChars = 3, delay = 350, limit = 6 } = options ?? {};

  return (query: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const debouncedQuery = useDebounce(query, delay);
    const isEnabled = debouncedQuery.length >= minChars;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useQuery({
      queryKey: QUERY_KEYS.search.suggestions(debouncedQuery),
      queryFn: () => fetchSuggestions(debouncedQuery, limit),
      enabled: isEnabled,
      staleTime: 30_000,
    });

    return {
      ...result,
      isEnabled,
      debouncedQuery,
    };
  };
}

/**
 * Doğrudan kullanılabilir versiyon (hook factory yerine)
 */
export function useSearchQuery(
  query: string,
  options?: { minChars?: number; delay?: number; limit?: number },
) {
  const { minChars = 3, delay = 350, limit = 6 } = options ?? {};
  const debouncedQuery = useDebounce(query, delay);
  const isEnabled = debouncedQuery.length >= minChars;

  const result = useQuery({
    queryKey: QUERY_KEYS.search.suggestions(debouncedQuery),
    queryFn: () => fetchSuggestions(debouncedQuery, limit),
    enabled: isEnabled,
    staleTime: 30_000,
  });

  return {
    ...result,
    isEnabled,
    debouncedQuery,
    hasResults:
      isEnabled &&
      result.isSuccess &&
      (result.data?.products.length ||
        result.data?.brands.length ||
        result.data?.categories.length),
  };
}

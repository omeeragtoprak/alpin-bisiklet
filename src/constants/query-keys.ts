/**
 * TanStack Query key'leri
 * Tutarlı cache yönetimi için merkezi key tanımları
 */
export const QUERY_KEYS = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...QUERY_KEYS.products.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...QUERY_KEYS.products.lists(), filters] as const,
    details: () => [...QUERY_KEYS.products.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.products.details(), id] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    lists: () => [...QUERY_KEYS.categories.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.categories.lists(), filters] as const,
    details: () => [...QUERY_KEYS.categories.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.categories.details(), id] as const,
    options: () => [...QUERY_KEYS.categories.all, "options"] as const,
  },

  // Orders (ileride eklenecek)
  orders: {
    all: ["orders"] as const,
    lists: () => [...QUERY_KEYS.orders.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...QUERY_KEYS.orders.lists(), filters] as const,
    details: () => [...QUERY_KEYS.orders.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.orders.details(), id] as const,
  },

  // Users (ileride eklenecek)
  users: {
    all: ["users"] as const,
    lists: () => [...QUERY_KEYS.users.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...QUERY_KEYS.users.lists(), filters] as const,
    details: () => [...QUERY_KEYS.users.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.users.details(), id] as const,
    current: () => [...QUERY_KEYS.users.all, "current"] as const,
  },
} as const;

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

  // Banners
  banners: {
    all: ["banners"] as const,
    active: () => [...QUERY_KEYS.banners.all, "active"] as const,
    hero: () => [...QUERY_KEYS.banners.active(), "hero"] as const,
    sidebar: () => [...QUERY_KEYS.banners.active(), "sidebar"] as const,
    category: () => [...QUERY_KEYS.banners.active(), "category"] as const,
    product: () => [...QUERY_KEYS.banners.active(), "product"] as const,
    popup: () => [...QUERY_KEYS.banners.active(), "popup"] as const,
  },

  // Blog
  blog: {
    all: ["blog"] as const,
    lists: () => [...QUERY_KEYS.blog.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...QUERY_KEYS.blog.lists(), filters] as const,
    detail: (slug: string) => [...QUERY_KEYS.blog.all, "detail", slug] as const,
    home: () => [...QUERY_KEYS.blog.lists(), "home"] as const,
  },

  // Related products (similar + complementary)
  relatedProducts: {
    all: ["related-products"] as const,
    detail: (productId: number) => [...QUERY_KEYS.relatedProducts.all, productId] as const,
  },

  // Favorites
  favorites: {
    all: ["favorites"] as const,
    list: () => [...QUERY_KEYS.favorites.all, "list"] as const,
  },

  // Brands
  brands: {
    all: ["brands"] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.brands.all, "list", filters] as const,
  },

  // Search suggestions
  search: {
    all: ["search"] as const,
    suggestions: (query: string) => [...QUERY_KEYS.search.all, "suggestions", query] as const,
  },

  // Elden Taksit
  eldenTaksit: {
    all: ["elden-taksit"] as const,
    lists: () => [...QUERY_KEYS.eldenTaksit.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.eldenTaksit.lists(), filters] as const,
    details: () => [...QUERY_KEYS.eldenTaksit.all, "detail"] as const,
    detail: (id: number) => [...QUERY_KEYS.eldenTaksit.details(), id] as const,
  },
} as const;

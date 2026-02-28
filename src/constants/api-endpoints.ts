// Client-side'da relative URL kullan (CSP sorununu önler)
// Server-side'da absolute URL kullan (fetch için gerekli)
const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "");

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${BASE_URL}/api/products`,
  PRODUCT: (id: number) => `${BASE_URL}/api/products/${id}`,

  // Categories
  CATEGORIES: `${BASE_URL}/api/categories`,
  CATEGORY: (id: number) => `${BASE_URL}/api/categories/${id}`,

  // Auth (Better Auth tarafından yönetilir)
  AUTH: {
    SESSION: `${BASE_URL}/api/auth/get-session`,
    SIGN_IN: `${BASE_URL}/api/auth/sign-in/email`,
    SIGN_UP: `${BASE_URL}/api/auth/sign-up/email`,
    SIGN_OUT: `${BASE_URL}/api/auth/sign-out`,
  },

  // Brands
  BRANDS: `${BASE_URL}/api/brands`,

  // Search
  SEARCH: `${BASE_URL}/api/search`,

  // Orders (ileride eklenecek)
  ORDERS: `${BASE_URL}/api/orders`,
  ORDER: (id: number) => `${BASE_URL}/api/orders/${id}`,

  // Users (ileride eklenecek)
  USERS: `${BASE_URL}/api/users`,
  USER: (id: number) => `${BASE_URL}/api/users/${id}`,

  // Discounts
  DISCOUNTS: `${BASE_URL}/api/discounts`,
  DISCOUNT: (id: number) => `${BASE_URL}/api/discounts/${id}`,
} as const;

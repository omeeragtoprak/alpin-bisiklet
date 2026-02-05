import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations";
import type {
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductListItem,
  ProductWithCategory,
} from "@/types";
import { apiClient } from "./api-client";

/**
 * Ürün Servisi
 * Tüm ürün CRUD işlemleri bu servis üzerinden yapılır
 */
export const productService = {
  /**
   * Ürün listesi getir (sayfalı)
   */
  getAll: async (filters: ProductFilters = {}) => {
    return apiClient.get<PaginatedResponse<ProductListItem>>(API_ENDPOINTS.PRODUCTS, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Tek ürün getir (detay)
   */
  getById: async (id: number) => {
    return apiClient.get<ProductWithCategory>(API_ENDPOINTS.PRODUCT(id));
  },

  /**
   * Yeni ürün oluştur
   */
  create: async (data: CreateProductInput) => {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  },

  /**
   * Ürün güncelle
   */
  update: async (id: number, data: UpdateProductInput) => {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCT(id), data);
  },

  /**
   * Ürün sil
   */
  delete: async (id: number) => {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.PRODUCT(id));
  },
};

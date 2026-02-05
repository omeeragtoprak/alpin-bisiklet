import { API_ENDPOINTS } from "@/constants/api-endpoints";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations";
import type {
  Category,
  CategoryListItem,
  CategoryOption,
  CategoryWithChildren,
  ListParams,
  PaginatedResponse,
} from "@/types";
import { apiClient } from "./api-client";

/**
 * Kategori Servisi
 * Tüm kategori CRUD işlemleri bu servis üzerinden yapılır
 */
export const categoryService = {
  /**
   * Kategori listesi getir (sayfalı)
   */
  getAll: async (params: ListParams = {}) => {
    return apiClient.get<PaginatedResponse<CategoryListItem>>(API_ENDPOINTS.CATEGORIES, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Tek kategori getir (detay)
   */
  getById: async (id: number) => {
    return apiClient.get<CategoryWithChildren>(API_ENDPOINTS.CATEGORY(id));
  },

  /**
   * Kategori seçenekleri (dropdown için)
   */
  getOptions: async () => {
    return apiClient.get<CategoryOption[]>(`${API_ENDPOINTS.CATEGORIES}/options`);
  },

  /**
   * Yeni kategori oluştur
   */
  create: async (data: CreateCategoryInput) => {
    return apiClient.post<Category>(API_ENDPOINTS.CATEGORIES, data);
  },

  /**
   * Kategori güncelle
   */
  update: async (id: number, data: UpdateCategoryInput) => {
    return apiClient.patch<Category>(API_ENDPOINTS.CATEGORY(id), data);
  },

  /**
   * Kategori sil
   */
  delete: async (id: number) => {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.CATEGORY(id));
  },
};

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { apiClient } from "./api-client";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export const brandService = {
  getAll: async (params?: { categoryId?: number }) => {
    const response = await apiClient.get<{ data: Brand[] }>(API_ENDPOINTS.BRANDS, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return response.data;
  },
};

/** API hata response tipi */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

/** Sayfalı response tipi */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Tek item response tipi */
export interface SingleResponse<T> {
  data: T;
  message?: string;
}

/** Başarılı işlem response tipi */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

/** Sayfalama parametreleri */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Sıralama parametreleri */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Ortak liste parametreleri */
export interface ListParams extends PaginationParams, SortParams {
  search?: string;
}

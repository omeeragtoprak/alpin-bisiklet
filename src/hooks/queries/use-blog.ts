"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

interface BlogListResponse {
  data: BlogPost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Anasayfada gösterilecek son 3 blog yazısı */
export function useHomeBlog() {
  return useQuery({
    queryKey: QUERY_KEYS.blog.home(),
    queryFn: async () => {
      const res = await fetch("/api/blog?limit=3&isPublished=true");
      if (!res.ok) throw new Error("Blog yazıları yüklenemedi");
      const json: BlogListResponse = await res.json();
      return json.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Blog listesi (sayfalı) */
export function useBlogList(page = 1, limit = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.list({ page, limit }),
    queryFn: async () => {
      const res = await fetch(`/api/blog?page=${page}&limit=${limit}&isPublished=true`);
      if (!res.ok) throw new Error("Blog yazıları yüklenemedi");
      return res.json() as Promise<BlogListResponse>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

"use client";

import { QUERY_KEYS } from "@/constants/query-keys";
import { bannerService } from "@/services/banner.service";
import { useQuery } from "@tanstack/react-query";

/** Aktif tüm bannerlar */
export function useBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.active(),
    queryFn: () => bannerService.getActive(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Sadece HERO pozisyonundaki bannerlar (anasayfa carousel) */
export function useHeroBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.hero(),
    queryFn: async () => {
      const all = await bannerService.getActive();
      return all
        .filter((b) => b.position === "HERO")
        .sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000,
  });
}

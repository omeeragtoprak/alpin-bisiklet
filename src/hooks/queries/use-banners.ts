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

/** SIDEBAR pozisyonundaki bannerlar (ürünler sayfası yan bar) */
export function useSidebarBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.sidebar(),
    queryFn: async () => {
      const all = await bannerService.getActive();
      return all
        .filter((b) => b.position === "SIDEBAR")
        .sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** CATEGORY pozisyonundaki bannerlar (kategori bazlı banner) */
export function useCategoryBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.category(),
    queryFn: async () => {
      const all = await bannerService.getActive();
      return all
        .filter((b) => b.position === "CATEGORY")
        .sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** PRODUCT pozisyonundaki bannerlar (ürün detay sayfası) */
export function useProductBanners() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.product(),
    queryFn: async () => {
      const all = await bannerService.getActive();
      return all
        .filter((b) => b.position === "PRODUCT")
        .sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** İlk aktif POPUP banner */
export function usePopupBanner() {
  return useQuery({
    queryKey: QUERY_KEYS.banners.popup(),
    queryFn: async () => {
      const all = await bannerService.getActive();
      const popups = all
        .filter((b) => b.position === "POPUP")
        .sort((a, b) => a.order - b.order);
      return popups[0] ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useSidebarBanners } from "@/hooks";

/**
 * SIDEBAR pozisyonlu bannerlar — ürünler sayfası sol sidebar'ının altında gösterilir.
 * Dikey kart formatı (portrait 2:3).
 */
export function SidebarBanner() {
  const { data: banners = [] } = useSidebarBanners();

  if (banners.length === 0) return null;

  // En fazla 2 banner göster
  const visible = banners.slice(0, 2);

  return (
    <div className="space-y-3 mt-4">
      {visible.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-xl group"
          style={{ aspectRatio: "4/3" }}
        >
          {/* Görsel */}
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* İçerik */}
          <div className="absolute inset-0 flex flex-col justify-end p-3">
            {banner.subtitle && (
              <span className="inline-block text-[10px] font-semibold text-white/80 mb-1 uppercase tracking-wider">
                {banner.subtitle}
              </span>
            )}
            <p className="text-sm font-bold text-white leading-tight mb-2 line-clamp-2">
              {banner.title}
            </p>
            {banner.link && (
              <Link
                href={banner.link}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-primary/80 hover:bg-primary px-2.5 py-1 rounded-full transition-colors w-fit"
              >
                {banner.buttonText || "İncele"}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

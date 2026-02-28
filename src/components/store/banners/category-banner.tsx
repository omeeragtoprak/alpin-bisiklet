"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCategoryBanners } from "@/hooks";

/**
 * CATEGORY pozisyonlu banner — ürünler sayfasında kategori seçildiğinde
 * ürün grid'inin üstünde tam genişlik banner olarak gösterilir.
 */
export function CategoryBanner() {
  const { data: banners = [] } = useCategoryBanners();

  if (banners.length === 0) return null;

  const banner = banners[0];

  return (
    <div className="relative overflow-hidden rounded-xl mb-6 group" style={{ aspectRatio: "21/5" }}>
      {/* Görsel */}
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* İçerik */}
      <div className="absolute inset-0 flex items-center px-6 md:px-10">
        <div className="max-w-md">
          {banner.subtitle && (
            <span className="inline-block bg-primary/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {banner.subtitle}
            </span>
          )}
          <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-4 drop-shadow">
            {banner.title}
          </h2>
          {banner.link && (
            <Link
              href={banner.link}
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 font-semibold text-sm px-5 py-2.5 rounded-full transition-all shadow-lg"
            >
              {banner.buttonText || "İncele"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";
import { useProductBanners } from "@/hooks";

/**
 * PRODUCT pozisyonlu banner — ürün detay sayfasında
 * "Benzer Ürünler" bölümünün hemen üstünde tam genişlik görünür.
 */
export function ProductBanner() {
  const { data: banners = [] } = useProductBanners();

  if (banners.length === 0) return null;

  const banner = banners[0];

  return (
    <div className="my-8">
      <div
        className="relative overflow-hidden rounded-2xl group"
        style={{ aspectRatio: "16/5" }}
      >
        {/* Görsel */}
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Dekoratif arka plan şekli */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/20 to-transparent" />

        {/* İçerik */}
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div className="max-w-lg">
            {banner.subtitle && (
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary font-semibold text-sm">
                  {banner.subtitle}
                </span>
              </div>
            )}
            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 drop-shadow">
              {banner.title}
            </h3>
            {banner.link && (
              <Link
                href={banner.link}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all shadow-lg shadow-primary/25"
              >
                {banner.buttonText || "İncele"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

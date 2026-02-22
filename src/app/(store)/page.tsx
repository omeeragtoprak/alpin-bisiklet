import type { Metadata } from "next";
import { ParallaxHero } from "@/components/store/home/parallax-hero";
import { FeaturedCategories } from "@/components/store/home/featured-categories";
import { ProductShowcase } from "@/components/store/home/product-showcase";
import { NewProductsSection } from "@/components/store/home/new-products-section";
import { BrandMarquee } from "@/components/store/home/brand-marquee";
import { DiscountedProductsSection } from "@/components/store/home/discounted-products-section";
import { PopularProductsSection } from "@/components/store/home/popular-products-section";
import { BlogSection } from "@/components/store/home/blog-section";
import { HomeFeaturesBar } from "@/components/store/home/features-bar";
import { HomeStats } from "@/components/store/home/stats-section";
import { HomeCTA } from "@/components/store/home/cta-section";
import { HomeShowcase3D } from "@/components/store/home/showcase-3d-section";
import { LocalBusinessSchema } from "@/components/seo/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

export const metadata: Metadata = {
  title: "Alpin Bisiklet - Bisiklet Mağazası | Dağ, Yol, Şehir Bisikleti",
  description:
    "Türkiye'nin en güvenilir bisiklet mağazası. Merida, Trek, Giant, Scott ve daha fazla marka. Dağ bisikleti, yol bisikleti, şehir bisikleti, elektrikli bisiklet, aksesuar ve yedek parça. Ücretsiz kargo, taksit imkanı.",
  keywords: [
    "bisiklet mağazası",
    "alpin bisiklet",
    "dağ bisikleti satın al",
    "yol bisikleti fiyatları",
    "şehir bisikleti",
    "elektrikli bisiklet",
    "bisiklet aksesuarları",
    "merida bisiklet",
    "giant bisiklet",
    "trek bisiklet",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Alpin Bisiklet - Bisiklet Mağazası",
    description:
      "Türkiye'nin en güvenilir bisiklet mağazası. Dağ, yol, şehir bisikleti ve aksesuarlar.",
    url: BASE_URL,
    type: "website",
  },
};

export default function StorePage() {
  return (
    <>
      <LocalBusinessSchema />

      {/* Full-screen Parallax Hero */}
      <ParallaxHero />

      {/* Trust Features Bar */}
      <HomeFeaturesBar />

      {/* Categories */}
      <FeaturedCategories />

      {/* Product Showcase — horizontal scroll */}
      <ProductShowcase />

      {/* New Products Grid */}
      <NewProductsSection />

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Discounted Products Carousel */}
      <DiscountedProductsSection />

      {/* 3D Bicycle Showcase */}
      <HomeShowcase3D />

      {/* Popular Products Grid */}
      <PopularProductsSection />

      {/* Blog Section */}
      <BlogSection />

      {/* Stats Section */}
      <HomeStats />

      {/* CTA Newsletter Banner */}
      <HomeCTA />
    </>
  );
}

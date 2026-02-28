"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import type { ProductListItem } from "@/types";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  _count: { products: number };
}

export default function BrandDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: brandData, isLoading: brandLoading, isError } = useQuery({
    queryKey: ["brand-slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/brands/slug/${slug}`);
      if (!res.ok) throw new Error("Marka bulunamadı");
      return res.json();
    },
    retry: false,
  });

  const brand: Brand | undefined = brandData?.data;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["brand-products", brand?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?brandId=${brand!.id}&limit=48&isActive=true`);
      if (!res.ok) throw new Error("Ürünler yüklenemedi");
      return res.json();
    },
    enabled: !!brand?.id,
  });

  const products: ProductListItem[] = productsData?.data ?? [];

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Marka bulunamadı</h1>
        <p className="text-muted-foreground mb-6">Bu marka mevcut değil veya kaldırılmış.</p>
        <Button onClick={() => router.push("/markalar")}>Tüm Markalar</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri */}
      <Link
        href="/markalar"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Markalar
      </Link>

      {/* Hero */}
      {brandLoading ? (
        <div className="animate-pulse space-y-4 mb-12">
          <div className="h-32 w-48 bg-muted rounded-xl mx-auto" />
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-72 bg-muted rounded mx-auto" />
        </div>
      ) : brand ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {brand.logo && (
            <div className="relative h-28 w-56 mx-auto mb-6">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="224px"
              />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{brand.name}</h1>
          {brand.description && (
            <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
              {brand.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-muted-foreground">
              {brand._count.products} ürün
            </span>
            {brand.website && (
              <>
                <span className="text-muted-foreground">·</span>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Resmi Site
                </a>
              </>
            )}
          </div>
        </motion.div>
      ) : null}

      {/* Ürünler */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          {brand?.name} Ürünleri
        </h2>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Bu markaya ait ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

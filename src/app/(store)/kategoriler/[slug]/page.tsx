"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import type { ProductListItem } from "@/types";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent: { id: number; name: string; slug: string } | null;
  children: Array<{
    id: number;
    name: string;
    slug: string;
    image: string | null;
    _count: { products: number };
  }>;
  _count: { products: number };
}

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: categoryData, isLoading: categoryLoading, isError } = useQuery({
    queryKey: ["category-slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/categories/slug/${slug}`);
      if (!res.ok) throw new Error("Kategori bulunamadı");
      return res.json();
    },
    retry: false,
  });

  const category: Category | undefined = categoryData?.data;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["category-products", category?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?categoryId=${category!.id}&limit=48&isActive=true`);
      if (!res.ok) throw new Error("Ürünler yüklenemedi");
      return res.json();
    },
    enabled: !!category?.id,
  });

  const products: ProductListItem[] = productsData?.data ?? [];

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Kategori bulunamadı</h1>
        <p className="text-muted-foreground mb-6">Bu kategori mevcut değil veya kaldırılmış.</p>
        <Button onClick={() => router.push("/urunler")}>Tüm Ürünler</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri */}
      {category?.parent ? (
        <Link
          href={`/kategoriler/${category.parent.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {category.parent.name}
        </Link>
      ) : (
        <Link
          href="/urunler"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Tüm Ürünler
        </Link>
      )}

      {/* Hero */}
      {categoryLoading ? (
        <div className="animate-pulse space-y-3 mb-12">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
      ) : category ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          {category.image && (
            <div className="relative h-40 md:h-56 w-full rounded-2xl overflow-hidden mb-6 bg-muted">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
                <p className="text-white/80 text-sm mt-1">{category._count.products} ürün</p>
              </div>
            </div>
          )}

          {!category.image && (
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{category._count.products} ürün</p>
            </div>
          )}

          {/* Alt kategoriler */}
          {category.children.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground mb-3">Alt Kategoriler</p>
              <div className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/kategoriler/${child.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {child.name}
                    <span className="text-xs opacity-60">({child._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : null}

      {/* Ürünler */}
      <div>
        {category && !category.image && (
          <h2 className="text-xl font-semibold mb-6">{category.name} Ürünleri</h2>
        )}

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Bu kategoride henüz ürün yok.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/urunler">Tüm Ürünlere Bak</Link>
            </Button>
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

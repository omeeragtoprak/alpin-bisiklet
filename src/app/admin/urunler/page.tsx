import { Suspense } from "react";
import { getAdminProducts } from "@/lib/data/admin-products";
import { ProductsClient } from "./products-client";
import { TableSkeleton } from "@/components/admin/loading-skeleton";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const initialData = await getAdminProducts({
    page: Number(getString(sp.page)) || 1,
    limit: Number(getString(sp.limit)) || 20,
    search: getString(sp.search) || "",
    categoryId: sp.categoryId ? Number(getString(sp.categoryId)) : undefined,
    brandId: sp.brandId ? Number(getString(sp.brandId)) : undefined,
    isActive: (getString(sp.isActive) as "all" | "true" | "false") || "all",
    inStock: getString(sp.inStock) === "true",
    isFeatured: getString(sp.isFeatured) === "true",
    hasDiscount: getString(sp.hasDiscount) === "true",
    isNew: getString(sp.isNew) === "true",
    orderBy: getString(sp.orderBy) || "createdAt:desc",
    minPrice: sp.minPrice ? Number(getString(sp.minPrice)) : undefined,
    maxPrice: sp.maxPrice ? Number(getString(sp.maxPrice)) : undefined,
  });

  return (
    <Suspense fallback={<TableSkeleton />}>
      <ProductsClient initialData={initialData} />
    </Suspense>
  );
}

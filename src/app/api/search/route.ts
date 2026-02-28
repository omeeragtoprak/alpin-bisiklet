import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/search?q=bianchi&limit=8
 *
 * Hızlı öneri arama (autocomplete):
 * - Ürünler: isim, marka adı, SKU üzerinden
 * - Markalar: isim üzerinden
 * - Kategoriler: isim üzerinden
 *
 * Minimum 3 karakter beklenir (client-side kontrol + server-side guard).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 6, 20);

    // Server-side guard
    if (q.length < 3) {
      return NextResponse.json(
        { products: [], brands: [], categories: [], total: 0 },
      );
    }

    const searchMode = "insensitive" as const;

    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: searchMode } },
            { sku: { contains: q, mode: searchMode } },
            { brand: { name: { contains: q, mode: searchMode } } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          images: {
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true, alt: true },
          },
          brand: { select: { name: true } },
          category: { select: { name: true } },
        },
        take: limit,
        orderBy: { isFeatured: "desc" },
      }),

      prisma.brand.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: searchMode },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        take: 4,
        orderBy: { name: "asc" },
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: searchMode },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
        take: 4,
        orderBy: { order: "asc" },
      }),
    ]);

    const total = products.length + brands.length + categories.length;

    return NextResponse.json({ products, brands, categories, total });
  } catch (error) {
    console.error("Search GET error:", error);
    return NextResponse.json(
      { error: "Arama başarısız" },
      { status: 500 },
    );
  }
}

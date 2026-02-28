import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/generate-slug";

export interface ImportRow {
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  categorySlug?: string;
  brandSlug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; name: string; error: string }>;
  created: Array<{ id: number; name: string; slug: string }>;
}

// POST /api/products/import
// Body: { rows: ImportRow[] }
export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rows: ImportRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Tek seferde en fazla 500 ürün yüklenebilir" },
        { status: 400 },
      );
    }

    // Cache categories & brands for lookup
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, slug: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { id: true, slug: true } }),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
    const brandMap = new Map(brands.map((b) => [b.slug, b.id]));

    const result: ImportResult = { success: 0, failed: 0, errors: [], created: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2: header row + 1-based index

      try {
        if (!row.name?.trim()) throw new Error("Ürün adı zorunlu");
        if (!row.price || Number(row.price) <= 0) throw new Error("Geçerli bir fiyat girin");

        const categoryId = row.categorySlug ? categoryMap.get(row.categorySlug) : undefined;
        const brandId = row.brandSlug ? brandMap.get(row.brandSlug) : undefined;

        const slug = generateSlug(row.name);

        // slug çakışması — sona sayı ekle
        const existingSlug = await prisma.product.findFirst({ where: { slug }, select: { id: true } });
        const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

        const product = await prisma.product.create({
          data: {
            name: row.name.trim(),
            slug: finalSlug,
            description: row.description?.trim() || null,
            price: Number(row.price),
            comparePrice: row.comparePrice ? Number(row.comparePrice) : null,
            stock: Number(row.stock ?? 0),
            sku: row.sku?.trim() || null,
            barcode: row.barcode?.trim() || null,
            categoryId: categoryId ?? null,
            brandId: brandId ?? null,
            isActive: row.isActive !== false,
            isFeatured: row.isFeatured === true,
            isNew: row.isNew === true,
          },
          select: { id: true, name: true, slug: true },
        });

        result.created.push(product);
        result.success++;
      } catch (err) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          name: row.name || `Satır ${rowNum}`,
          error: err instanceof Error ? err.message : "Bilinmeyen hata",
        });
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Products import error:", error);
    return NextResponse.json({ error: "İçe aktarma başarısız" }, { status: 500 });
  }
}

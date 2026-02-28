import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/categories/slug/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true, _count: { select: { products: { where: { isActive: true } } } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Category slug GET error:", error);
    return NextResponse.json({ error: "Kategori getirilemedi" }, { status: 500 });
  }
}

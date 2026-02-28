import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/brands/slug/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const brand = await prisma.brand.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ data: brand });
  } catch (error) {
    console.error("Brand slug GET error:", error);
    return NextResponse.json({ error: "Marka getirilemedi" }, { status: 500 });
  }
}

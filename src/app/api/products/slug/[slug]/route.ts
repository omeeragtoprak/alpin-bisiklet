import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products/slug/[slug] - Tek ürün getir (slug ile)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { order: "asc" } },
                videos: { orderBy: { order: "asc" } },
                attributes: { orderBy: { order: "asc" } },
                variants: {
                    where: { isActive: true },
                    orderBy: { name: "asc" },
                },
                reviews: {
                    where: { isApproved: true },
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { name: true, image: true } },
                    },
                },
                _count: { select: { reviews: true } },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Ürün bulunamadı" },
                { status: 404 },
            );
        }

        return NextResponse.json({ data: product });
    } catch (error) {
        console.error("Product slug GET error:", error);
        return NextResponse.json(
            { error: "Ürün getirilemedi" },
            { status: 500 },
        );
    }
}

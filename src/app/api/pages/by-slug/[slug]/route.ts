import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pages/by-slug/[slug] - Public, sadece yayınlanmış sayfalar
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        const page = await prisma.page.findFirst({
            where: {
                slug,
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                metaTitle: true,
                metaDescription: true,
                updatedAt: true,
            },
        });

        if (!page) {
            return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ data: page });
    } catch (error) {
        console.error("Page by-slug GET error:", error);
        return NextResponse.json({ error: "Sayfa getirilemedi" }, { status: 500 });
    }
}

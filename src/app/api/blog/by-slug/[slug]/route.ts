import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/blog/by-slug/[slug] - Public, sadece yayınlanmış yazılar
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        const blog = await prisma.blog.findFirst({
            where: { slug, isPublished: true },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                excerpt: true,
                coverImage: true,
                metaTitle: true,
                metaDescription: true,
                publishedAt: true,
                updatedAt: true,
            },
        });

        if (!blog) {
            return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ data: blog });
    } catch (error) {
        console.error("Blog by-slug GET error:", error);
        return NextResponse.json({ error: "Blog yazısı getirilemedi" }, { status: 500 });
    }
}

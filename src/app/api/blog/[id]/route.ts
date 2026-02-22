import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateBlogSchema } from "@/lib/validations";
import { sanitizeContent } from "@/lib/sanitize-content";
import { requireAdmin } from "@/lib/auth-server";

// GET /api/blog/[id] - Admin only
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const { id } = await params;
        const numId = Number(id);
        if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

        const blog = await prisma.blog.findUnique({ where: { id: numId } });
        if (!blog) return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 });

        return NextResponse.json({ data: blog });
    } catch (error) {
        console.error("Blog GET [id] error:", error);
        return NextResponse.json({ error: "Blog yazısı getirilemedi" }, { status: 500 });
    }
}

// PATCH /api/blog/[id] - Admin only
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const { id } = await params;
        const numId = Number(id);
        if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

        const body = await request.json();
        const validated = updateBlogSchema.parse(body);

        // isPublished true olup publishedAt yoksa tarihi set et
        const existing = await prisma.blog.findUnique({ where: { id: numId }, select: { publishedAt: true, isPublished: true } });
        const publishedAt =
            validated.isPublished && !existing?.publishedAt ? new Date()
            : validated.isPublished === false ? null
            : undefined;

        const blog = await prisma.blog.update({
            where: { id: numId },
            data: {
                ...validated,
                ...(validated.content !== undefined ? { content: sanitizeContent(validated.content) } : {}),
                ...(publishedAt !== undefined ? { publishedAt } : {}),
            },
        });

        return NextResponse.json({ data: blog });
    } catch (error) {
        console.error("Blog PATCH error:", error);
        return NextResponse.json({ error: "Blog yazısı güncellenemedi" }, { status: 500 });
    }
}

// DELETE /api/blog/[id] - Admin only
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const { id } = await params;
        const numId = Number(id);
        if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

        await prisma.blog.delete({ where: { id: numId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Blog DELETE error:", error);
        return NextResponse.json({ error: "Blog yazısı silinemedi" }, { status: 500 });
    }
}

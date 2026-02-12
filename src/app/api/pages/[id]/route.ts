import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updatePageSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/pages/[id]
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
        const page = await prisma.page.findUnique({ where: { id: numId } });
        if (!page) return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
        return NextResponse.json({ data: page });
    } catch (error) {
        console.error("Page GET error:", error);
        return NextResponse.json({ message: "Sayfa alınamadı" }, { status: 500 });
    }
}

// PUT /api/pages/[id]
export async function PUT(
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
        const validated = updatePageSchema.parse(body);
        const page = await prisma.page.update({ where: { id: numId }, data: validated });
        return NextResponse.json({ data: page });
    } catch (error) {
        console.error("Page PUT error:", error);
        return NextResponse.json({ message: "Sayfa güncellenemedi" }, { status: 500 });
    }
}

// DELETE /api/pages/[id]
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
        await prisma.page.delete({ where: { id: numId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Page DELETE error:", error);
        return NextResponse.json({ message: "Sayfa silinemedi" }, { status: 500 });
    }
}

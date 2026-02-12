import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateBannerSchema } from "@/lib/validations";

// GET /api/banners/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    try {
        const banner = await prisma.banner.findUnique({
            where: { id: numId },
        });

        if (!banner) {
            return NextResponse.json({ error: "Banner bulunamadı" }, { status: 404 });
        }

        return NextResponse.json(banner);
    } catch (error) {
        console.error("Banner GET error:", error);
        return NextResponse.json(
            { error: "Banner getirilemedi" },
            { status: 500 },
        );
    }
}

// PATCH /api/banners/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
        }

        const body = await request.json();
        const validated = updateBannerSchema.parse(body);

        const banner = await prisma.banner.update({
            where: { id: numId },
            data: {
                ...validated,
                startDate: validated.startDate ? new Date(validated.startDate) : undefined,
                endDate: validated.endDate ? new Date(validated.endDate) : undefined,
            },
        });

        return NextResponse.json(banner);
    } catch (error) {
        console.error("Banner PATCH error:", error);
        return NextResponse.json(
            { error: "Banner güncellenemedi" },
            { status: 500 },
        );
    }
}

// DELETE /api/banners/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
        }

        await prisma.banner.delete({
            where: { id: numId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Banner DELETE error:", error);
        return NextResponse.json(
            { error: "Banner silinemedi" },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateCouponSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/coupons/[id]
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
        const coupon = await prisma.coupon.findUnique({
            where: { id: numId },
            include: { orders: { select: { id: true, orderNumber: true, total: true, createdAt: true } } },
        });

        if (!coupon) return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
        return NextResponse.json({ data: coupon });
    } catch (error) {
        console.error("Coupon GET error:", error);
        return NextResponse.json({ message: "Kupon alınamadı" }, { status: 500 });
    }
}

// PUT /api/coupons/[id]
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
        const validated = updateCouponSchema.parse(body);
        const coupon = await prisma.coupon.update({
            where: { id: numId },
            data: validated,
        });
        return NextResponse.json({ data: coupon });
    } catch (error) {
        console.error("Coupon PUT error:", error);
        return NextResponse.json({ message: "Kupon güncellenemedi" }, { status: 500 });
    }
}

// DELETE /api/coupons/[id]
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
        await prisma.coupon.delete({ where: { id: numId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Coupon DELETE error:", error);
        return NextResponse.json({ message: "Kupon silinemedi" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-server";

// GET /api/orders/[id] - Kullanıcının sipariş detayı
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const { id } = await params;
        const numId = Number(id);
        if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

        const order = await prisma.order.findUnique({
            where: { id: numId },
            include: {
                items: {
                    include: {
                        product: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
                        variant: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
                payment: true,
                statusHistory: { orderBy: { createdAt: "desc" } },
            },
        });

        if (!order || order.userId !== session.user.id) {
            return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ data: order });
    } catch (error) {
        console.error("Order GET error:", error);
        return NextResponse.json({ error: "Sipariş getirilemedi" }, { status: 500 });
    }
}

// PATCH /api/orders/[id] — Admin: sipariş durumunu güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const adminSession = await requireAdmin();
        if (!adminSession) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

        const { id } = await params;
        const numId = Number(id);
        if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

        const body = await request.json();
        const { status, paymentStatus, trackingNumber, notes } = body;

        const existing = await prisma.order.findUnique({
            where: { id: numId },
            select: { status: true, couponId: true },
        });
        if (!existing) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

        const order = await prisma.order.update({
            where: { id: numId },
            data: {
                ...(status && { status }),
                ...(paymentStatus && { paymentStatus }),
                ...(trackingNumber !== undefined && { trackingNumber }),
                ...(notes !== undefined && { notes }),
            },
        });

        // Sipariş DELIVERED olduğunda kuponu kullanılmış say
        if (status === "DELIVERED" && existing.status !== "DELIVERED" && existing.couponId) {
            await prisma.coupon.update({
                where: { id: existing.couponId },
                data: { usedCount: { increment: 1 } },
            });
        }

        return NextResponse.json({ data: order });
    } catch (error) {
        console.error("Order PATCH error:", error);
        return NextResponse.json({ error: "Sipariş güncellenemedi" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/admin/orders/[id]
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
        const order = await prisma.order.findUnique({
            where: { id: numId },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                items: {
                    include: {
                        product: { include: { images: { take: 1 } } },
                        variant: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
                payment: true,
                statusHistory: { orderBy: { createdAt: "desc" } },
                coupon: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ data: order });
    } catch (error) {
        console.error("Admin order GET error:", error);
        return NextResponse.json({ message: "Sipariş alınamadı" }, { status: 500 });
    }
}

// PUT /api/admin/orders/[id] - Sipariş durumu güncelle
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
        const { status, adminNote, trackingNumber, shippingMethod } = body;

        const order = await prisma.order.update({
            where: { id: numId },
            data: {
                ...(status && { status }),
                ...(adminNote !== undefined && { adminNote }),
                ...(trackingNumber !== undefined && { trackingNumber }),
                ...(shippingMethod !== undefined && { shippingMethod }),
                ...(status && {
                    statusHistory: {
                        create: {
                            status,
                            note: adminNote || `Durum güncellendi: ${status}`,
                        },
                    },
                }),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: true,
                statusHistory: { orderBy: { createdAt: "desc" } },
            },
        });

        return NextResponse.json({ data: order });
    } catch (error) {
        console.error("Admin order PUT error:", error);
        return NextResponse.json({ message: "Sipariş güncellenemedi" }, { status: 500 });
    }
}

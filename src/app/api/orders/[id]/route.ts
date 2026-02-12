import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

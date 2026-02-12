import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") {
        return null;
    }
    return session;
}

// GET /api/admin/orders - Tüm siparişler (Admin)
export async function GET(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { user: { name: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    items: { select: { id: true, productName: true, quantity: true, price: true, total: true } },
                    payment: { select: { status: true, cardType: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Admin orders GET error:", error);
        return NextResponse.json({ message: "Siparişler alınamadı" }, { status: 500 });
    }
}

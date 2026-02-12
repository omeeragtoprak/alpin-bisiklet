import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCouponSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/coupons
export async function GET(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.coupon.count(),
        ]);

        return NextResponse.json({
            data: coupons,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Coupons GET error:", error);
        return NextResponse.json({ message: "Kuponlar alınamadı" }, { status: 500 });
    }
}

// POST /api/coupons
export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const body = await request.json();
        const validated = createCouponSchema.parse(body);
        const coupon = await prisma.coupon.create({ data: validated });
        return NextResponse.json({ data: coupon }, { status: 201 });
    } catch (error) {
        console.error("Coupon POST error:", error);
        return NextResponse.json({ message: "Kupon oluşturulamadı" }, { status: 500 });
    }
}

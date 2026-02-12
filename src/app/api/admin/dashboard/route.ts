import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/admin/dashboard
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [
            totalOrders,
            monthlyOrders,
            lastMonthOrders,
            totalCustomers,
            monthlyCustomers,
            totalProducts,
            activeProducts,
            recentOrders,
            lowStockProducts,
            pendingOrders,
            monthlyRevenue,
            lastMonthRevenue,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                },
            }),
            prisma.product.findMany({
                where: {
                    trackStock: true,
                    stock: { lte: prisma.product.fields.lowStockAlert },
                },
                select: { id: true, name: true, stock: true, lowStockAlert: true },
                take: 10,
            }).catch(() => []),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.aggregate({
                where: { createdAt: { gte: startOfMonth }, paymentStatus: "PAID" },
                _sum: { total: true },
            }),
            prisma.order.aggregate({
                where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, paymentStatus: "PAID" },
                _sum: { total: true },
            }),
        ]);

        const currentRevenue = monthlyRevenue._sum.total || 0;
        const previousRevenue = lastMonthRevenue._sum.total || 0;
        const revenueChange = previousRevenue > 0
            ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
            : "0";
        const orderChange = lastMonthOrders > 0
            ? (((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
            : "0";

        return NextResponse.json({
            data: {
                stats: {
                    totalRevenue: currentRevenue,
                    revenueChange: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
                    totalOrders,
                    monthlyOrders,
                    orderChange: `${Number(orderChange) >= 0 ? "+" : ""}${orderChange}%`,
                    totalCustomers,
                    monthlyCustomers,
                    totalProducts,
                    activeProducts,
                    pendingOrders,
                },
                recentOrders: recentOrders.map((o) => ({
                    id: o.orderNumber,
                    customer: o.user?.name || "Bilinmeyen",
                    total: `${o.total.toLocaleString("tr-TR")} TL`,
                    status: o.status,
                    date: o.createdAt,
                })),
                lowStockProducts,
            },
        });
    } catch (error) {
        console.error("Dashboard GET error:", error);
        return NextResponse.json({ message: "Dashboard verileri alınamadı" }, { status: 500 });
    }
}

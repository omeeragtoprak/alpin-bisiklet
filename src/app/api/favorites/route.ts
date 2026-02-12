import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/favorites
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const favorites = await prisma.favorite.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        images: { take: 1 },
                        category: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: favorites });
    } catch (error) {
        console.error("Favorites GET error:", error);
        return NextResponse.json({ message: "Favoriler alınamadı" }, { status: 500 });
    }
}

// POST /api/favorites
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const { productId } = await request.json();

        const existing = await prisma.favorite.findFirst({
            where: { userId: session.user.id, productId: Number(productId) },
        });

        if (existing) {
            // Toggle: remove if exists
            await prisma.favorite.delete({ where: { id: existing.id } });
            return NextResponse.json({ data: null, removed: true });
        }

        const favorite = await prisma.favorite.create({
            data: { userId: session.user.id, productId: Number(productId) },
        });

        return NextResponse.json({ data: favorite }, { status: 201 });
    } catch (error) {
        console.error("Favorite POST error:", error);
        return NextResponse.json({ message: "Favori eklenemedi" }, { status: 500 });
    }
}

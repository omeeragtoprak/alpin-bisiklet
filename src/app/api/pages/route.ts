import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPageSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/pages
export async function GET(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const pages = await prisma.page.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data: pages });
    } catch (error) {
        console.error("Pages GET error:", error);
        return NextResponse.json({ message: "Sayfalar alınamadı" }, { status: 500 });
    }
}

// POST /api/pages
export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const body = await request.json();
        const validated = createPageSchema.parse(body);
        const slug = validated.slug || validated.title
            .toLowerCase()
            .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
            .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const page = await prisma.page.create({ data: { ...validated, slug } });
        return NextResponse.json({ data: page }, { status: 201 });
    } catch (error) {
        console.error("Page POST error:", error);
        return NextResponse.json({ message: "Sayfa oluşturulamadı" }, { status: 500 });
    }
}

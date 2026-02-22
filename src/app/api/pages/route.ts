import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageSchema } from "@/lib/validations";
import { sanitizeContent } from "@/lib/sanitize-content";
import { generateSlug } from "@/lib/generate-slug";
import { requireAdmin } from "@/lib/auth-server";

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
        return NextResponse.json({ error: "Sayfalar alınamadı" }, { status: 500 });
    }
}

// POST /api/pages
export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const body = await request.json();
        const validated = createPageSchema.parse(body);
        const slug = validated.slug || generateSlug(validated.title);
        const page = await prisma.page.create({
            data: { ...validated, content: sanitizeContent(validated.content), slug },
        });
        return NextResponse.json({ data: page }, { status: 201 });
    } catch (error) {
        console.error("Page POST error:", error);
        return NextResponse.json({ error: "Sayfa oluşturulamadı" }, { status: 500 });
    }
}

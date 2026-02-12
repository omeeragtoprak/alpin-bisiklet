import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const settingsSchema = z.object({
    settings: z.array(z.object({
        key: z.string().min(1),
        value: z.string(),
        type: z.string().optional(),
        group: z.string().optional(),
    })),
});

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

// GET /api/settings
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const settings = await prisma.setting.findMany({
            orderBy: [{ group: "asc" }, { key: "asc" }],
        });

        // Group by group
        const grouped: Record<string, Record<string, string>> = {};
        for (const s of settings) {
            if (!grouped[s.group]) grouped[s.group] = {};
            grouped[s.group][s.key] = s.value;
        }

        return NextResponse.json({ data: grouped });
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json({ message: "Ayarlar alınamadı" }, { status: 500 });
    }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const body = await request.json();
        const { settings } = settingsSchema.parse(body);

        for (const s of settings) {
            await prisma.setting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: {
                    key: s.key,
                    value: s.value,
                    type: s.type || "string",
                    group: s.group || "general",
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings PUT error:", error);
        return NextResponse.json({ message: "Ayarlar güncellenemedi" }, { status: 500 });
    }
}

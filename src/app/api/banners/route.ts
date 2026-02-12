import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createBannerSchema } from "@/lib/validations";

// GET /api/banners
export async function GET(request: NextRequest) {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: "asc" },
        });
        return NextResponse.json({ data: banners });
    } catch (error) {
        console.error("Banners GET error:", error);
        return NextResponse.json(
            { error: "Bannerlar getirilemedi" },
            { status: 500 },
        );
    }
}

// POST /api/banners
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
        }

        const body = await request.json();
        const validated = createBannerSchema.parse(body);

        const banner = await prisma.banner.create({
            data: {
                ...validated,
                startDate: validated.startDate ? new Date(validated.startDate) : undefined,
                endDate: validated.endDate ? new Date(validated.endDate) : undefined,
            },
        });

        return NextResponse.json(banner, { status: 201 });
    } catch (error) {
        console.error("Banner POST error:", error);
        return NextResponse.json(
            { error: "Banner oluşturulamadı" },
            { status: 500 },
        );
    }
}

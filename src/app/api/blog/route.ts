import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createBlogSchema } from "@/lib/validations";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user?.role !== "ADMIN") return null;
    return session;
}

function generateSlug(title: string) {
    return title.toLowerCase()
        .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// GET /api/blog - Public, yayınlanmış yazıları listeler
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
        const search = searchParams.get("search") || "";
        const adminMode = searchParams.get("admin") === "1";

        // Admin modunda auth kontrolü yap
        if (adminMode) {
            const session = await requireAdmin();
            if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
        }

        const where = adminMode
            ? (search ? { title: { contains: search, mode: "insensitive" as const } } : {})
            : {
                isPublished: true,
                ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
            };

        const [total, blogs] = await Promise.all([
            prisma.blog.count({ where }),
            prisma.blog.findMany({
                where,
                orderBy: { publishedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: true,
                    isPublished: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);

        return NextResponse.json({
            data: blogs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Blog GET error:", error);
        return NextResponse.json({ error: "Blog yazıları getirilemedi" }, { status: 500 });
    }
}

// POST /api/blog - Admin only
export async function POST(request: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    try {
        const body = await request.json();
        const validated = createBlogSchema.parse(body);
        const slug = validated.slug || generateSlug(validated.title);

        const blog = await prisma.blog.create({
            data: {
                ...validated,
                slug,
                publishedAt: validated.isPublished ? new Date() : null,
            },
        });

        return NextResponse.json({ data: blog }, { status: 201 });
    } catch (error) {
        console.error("Blog POST error:", error);
        return NextResponse.json({ error: "Blog yazısı oluşturulamadı" }, { status: 500 });
    }
}

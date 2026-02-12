import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations";

// GET /api/categories
export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			include: {
				parent: { select: { id: true, name: true } },
				_count: { select: { products: true, children: true } },
			},
			orderBy: [{ order: "asc" }, { name: "asc" }],
		});

		return NextResponse.json({ data: categories });
	} catch (error) {
		console.error("Categories GET error:", error);
		return NextResponse.json(
			{ error: "Kategoriler getirilemedi" },
			{ status: 500 },
		);
	}
}

// POST /api/categories
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createCategorySchema.parse(body);

		const slug = validated.slug || validated.name
			.toLowerCase()
			.replace(/ğ/g, "g")
			.replace(/ü/g, "u")
			.replace(/ş/g, "s")
			.replace(/ı/g, "i")
			.replace(/ö/g, "o")
			.replace(/ç/g, "c")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const category = await prisma.category.create({
			data: {
				...validated,
				slug,
			},
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error("Category POST error:", error);
		return NextResponse.json(
			{ error: "Kategori oluşturulamadı" },
			{ status: 500 },
		);
	}
}

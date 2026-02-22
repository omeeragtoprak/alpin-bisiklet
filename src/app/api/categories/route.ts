import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/generate-slug";
import { requireAdmin } from "@/lib/auth-server";

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
	const session = await requireAdmin();
	if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

	try {
		const body = await request.json();
		const validated = createCategorySchema.parse(body);

		const slug = validated.slug || generateSlug(validated.name);

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

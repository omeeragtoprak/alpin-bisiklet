import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createBrandSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/generate-slug";
import { requireAdmin } from "@/lib/auth-server";

// GET /api/brands - Marka listesi
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");

		const where: { isActive: boolean; products?: { some: { isActive: boolean; categoryId: number } } } = { isActive: true };

		// Belirli bir kategoride ürünü olan markalar
		if (categoryId) {
			where.products = {
				some: {
					isActive: true,
					categoryId: Number(categoryId),
				},
			};
		}

		const brands = await prisma.brand.findMany({
			where,
			include: {
				_count: {
					select: {
						products: categoryId
							? { where: { isActive: true, categoryId: Number(categoryId) } }
							: { where: { isActive: true } },
					},
				},
			},
			orderBy: { name: "asc" },
		});

		return NextResponse.json({ data: brands });
	} catch (error) {
		console.error("Brands GET error:", error);
		return NextResponse.json(
			{ error: "Markalar getirilemedi" },
			{ status: 500 },
		);
	}
}

// POST /api/brands - Yeni marka olustur
export async function POST(request: NextRequest) {
	const session = await requireAdmin();
	if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

	try {
		const body = await request.json();
		const validated = createBrandSchema.parse(body);

		const slug = generateSlug(validated.name);

		const brand = await prisma.brand.create({
			data: {
				...validated,
				slug: validated.slug || slug,
			},
		});

		return NextResponse.json(brand, { status: 201 });
	} catch (error) {
		console.error("Brand POST error:", error);
		return NextResponse.json(
			{ error: "Marka olusturulamadi" },
			{ status: 500 },
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createBrandSchema } from "@/lib/validations";

// GET /api/brands - Marka listesi
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("categoryId");

		const where: any = { isActive: true };

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
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createBrandSchema.parse(body);

		const slug = validated.name
			.toLowerCase()
			.replace(/ğ/g, "g")
			.replace(/ü/g, "u")
			.replace(/ş/g, "s")
			.replace(/ı/g, "i")
			.replace(/ö/g, "o")
			.replace(/ç/g, "c")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

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

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations";

// GET /api/products - Ürün listesi
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = Number(searchParams.get("page")) || 1;
		const limit = Number(searchParams.get("limit")) || 20;
		const search = searchParams.get("search") || "";
		const categoryId = searchParams.get("categoryId");
		const brandId = searchParams.get("brandId");
		const isActive = searchParams.get("isActive");
		const isFeatured = searchParams.get("isFeatured");

		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ sku: { contains: search, mode: "insensitive" } },
				{ barcode: { contains: search, mode: "insensitive" } },
			];
		}

		if (categoryId) where.categoryId = Number(categoryId);
		if (brandId) where.brandId = Number(brandId);
		if (isActive !== null) where.isActive = isActive === "true";
		if (isFeatured !== null) where.isFeatured = isFeatured === "true";

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				include: {
					category: { select: { id: true, name: true } },
					brand: { select: { id: true, name: true } },
					images: { orderBy: { order: "asc" }, take: 1 },
					_count: { select: { variants: true } },
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.product.count({ where }),
		]);

		return NextResponse.json({
			data: products,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Products GET error:", error);
		return NextResponse.json(
			{ error: "Ürünler getirilemedi" },
			{ status: 500 },
		);
	}
}

// POST /api/products - Yeni ürün oluştur
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const validated = createProductSchema.parse(body);
		const { images, variants, ...productData } = validated;

		const slug = productData.name
			.toLowerCase()
			.replace(/ğ/g, "g")
			.replace(/ü/g, "u")
			.replace(/ş/g, "s")
			.replace(/ı/g, "i")
			.replace(/ö/g, "o")
			.replace(/ç/g, "c")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const product = await prisma.product.create({
			data: {
				...productData,
				slug,
				...(images?.length
					? {
						images: {
							create: images.map((img, i) => ({
								url: img.url,
								alt: img.alt || "",
								order: i,
							})),
						},
					}
					: {}),
				...(variants?.length
					? {
						variants: {
							create: variants.map((v) => ({
								name: v.name,
								sku: v.sku || "",
								price: v.price || 0,
								stock: v.stock || 0,
								isActive: v.isActive ?? true,
							})),
						},
					}
					: {}),
			},
			include: {
				category: true,
				brand: true,
				images: true,
			},
		});

		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		console.error("Product POST error:", error);
		return NextResponse.json(
			{ error: "Ürün oluşturulamadı" },
			{ status: 500 },
		);
	}
}

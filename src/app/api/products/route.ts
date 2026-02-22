import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/generate-slug";
import { requireAdmin } from "@/lib/auth-server";

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
		const isNew = searchParams.get("isNew");
		const hasDiscount = searchParams.get("hasDiscount");
		const orderBy = searchParams.get("orderBy");
		const riderHeight = searchParams.get("riderHeight") ? Number(searchParams.get("riderHeight")) : null;
		const riderInseam = searchParams.get("riderInseam") ? Number(searchParams.get("riderInseam")) : null;

		const skip = (page - 1) * limit;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: Record<string, any> = {};

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
		if (isNew !== null) where.isNew = isNew === "true";
		if (hasDiscount === "true") where.comparePrice = { not: null };

		if (riderHeight || riderInseam) {
			where.variants = {
				some: {
					...(riderHeight && { minHeight: { lte: riderHeight }, maxHeight: { gte: riderHeight } }),
					...(riderInseam && { minInseam: { lte: riderInseam }, maxInseam: { gte: riderInseam } }),
				},
			};
		}

		// Determine ordering
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let orderByClause: Record<string, any> = { createdAt: "desc" };
		if (orderBy === "price_asc") orderByClause = { price: "asc" };
		else if (orderBy === "price_desc") orderByClause = { price: "desc" };
		else if (orderBy === "name_asc") orderByClause = { name: "asc" };
		else if (orderBy === "newest") orderByClause = { createdAt: "desc" };

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
				orderBy: orderByClause,
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
	const session = await requireAdmin();
	if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

	try {
		const body = await request.json();
		const validated = createProductSchema.parse(body);
		const { images, variants, ...productData } = validated;

		const slug = generateSlug(productData.name);

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
								sku: v.sku || undefined,
								price: v.price || undefined,
								stock: v.stock || 0,
								isActive: v.isActive ?? true,
								sizeLabel: v.sizeLabel || undefined,
								minHeight: v.minHeight || undefined,
								maxHeight: v.maxHeight || undefined,
								minInseam: v.minInseam || undefined,
								maxInseam: v.maxInseam || undefined,
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

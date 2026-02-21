import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products/related/[productId]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ productId: string }> },
) {
	try {
		const { productId: productIdStr } = await params;
		const productId = Number(productIdStr);

		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: "Geçersiz ürün ID" },
				{ status: 400 },
			);
		}

		// 1. Fetch current product with its category (id + parentId)
		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: {
				id: true,
				categoryId: true,
				category: {
					select: { id: true, parentId: true },
				},
			},
		});

		if (!product) {
			return NextResponse.json(
				{ error: "Ürün bulunamadı" },
				{ status: 404 },
			);
		}

		// 2. Determine "same category tree" category IDs
		let sameCategoryIds: number[] = [];

		if (product.categoryId) {
			if (product.category?.parentId) {
				// Has a parent → siblings (same parentId) + self
				const siblings = await prisma.category.findMany({
					where: {
						parentId: product.category.parentId,
						isActive: true,
					},
					select: { id: true },
				});
				sameCategoryIds = siblings.map((c) => c.id);
				// Ensure self is included
				if (!sameCategoryIds.includes(product.categoryId)) {
					sameCategoryIds.push(product.categoryId);
				}
			} else {
				// Root category → children + self
				const children = await prisma.category.findMany({
					where: {
						OR: [
							{ parentId: product.categoryId },
							{ id: product.categoryId },
						],
						isActive: true,
					},
					select: { id: true },
				});
				sameCategoryIds = children.map((c) => c.id);
			}
		}

		const includeFields = {
			category: { select: { id: true, name: true } },
			brand: { select: { id: true, name: true } },
			images: { orderBy: { order: "asc" as const }, take: 1 },
		};

		// 3. Fetch similar products (same categoryId, exclude current)
		const similar = await prisma.product.findMany({
			where: {
				isActive: true,
				id: { not: productId },
				categoryId: product.categoryId ?? undefined,
			},
			include: includeFields,
			take: 6,
			orderBy: { createdAt: "desc" },
		});

		// 4. Fetch complementary (categories outside same tree, isFeatured first)
		const complementaryBase: any = {
			isActive: true,
		};

		if (sameCategoryIds.length > 0) {
			complementaryBase.categoryId = { notIn: sameCategoryIds };
		} else if (product.categoryId) {
			complementaryBase.categoryId = { not: product.categoryId };
		}

		// First pass: isFeatured products
		const featured = await prisma.product.findMany({
			where: {
				...complementaryBase,
				isFeatured: true,
				id: { not: productId },
			},
			include: includeFields,
			take: 6,
			orderBy: { createdAt: "desc" },
		});

		let complementary = featured;

		// Fill remaining slots with non-featured if needed
		if (complementary.length < 6) {
			const featuredIds = complementary.map((p) => p.id);
			const additional = await prisma.product.findMany({
				where: {
					...complementaryBase,
					id: { notIn: [...featuredIds, productId] },
				},
				include: includeFields,
				take: 6 - complementary.length,
				orderBy: { createdAt: "desc" },
			});
			complementary = [...complementary, ...additional];
		}

		return NextResponse.json({ similar, complementary });
	} catch (error) {
		console.error("Related products error:", error);
		return NextResponse.json(
			{ error: "İlgili ürünler getirilemedi" },
			{ status: 500 },
		);
	}
}

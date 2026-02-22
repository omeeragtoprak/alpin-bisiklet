import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations";

// GET /api/products/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const numId = Number(id);
	if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
	try {
		const product = await prisma.product.findUnique({
			where: { id: numId },
			include: {
				category: true,
				brand: true,
				images: { orderBy: { order: "asc" } },
				videos: { orderBy: { order: "asc" } },
				attributes: { orderBy: { order: "asc" } },
				variants: true,
			},
		});

		if (!product) {
			return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
		}

		return NextResponse.json(product);
	} catch (error) {
		console.error("Product GET error:", error);
		return NextResponse.json(
			{ error: "Ürün getirilemedi" },
			{ status: 500 },
		);
	}
}

// PATCH /api/products/[id]
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const numId = Number(id);
	if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const validated = updateProductSchema.parse(body);
		const { variants, images, videos, ...productData } = validated as any;

		// Variant upsert: sil ve yeniden oluştur
		if (variants !== undefined) {
			await prisma.productVariant.deleteMany({ where: { productId: numId } });
		}

		// Video upsert: sil ve yeniden oluştur
		if (videos !== undefined) {
			await prisma.productVideo.deleteMany({ where: { productId: numId } });
		}

		const product = await prisma.product.update({
			where: { id: numId },
			data: {
				...productData,
				...(variants !== undefined && variants.length > 0
					? {
						variants: {
							create: variants.map((v: any) => ({
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
				...(videos !== undefined && videos.length > 0
					? {
						videos: {
							create: videos.map((v: any, i: number) => ({
								url: v.url,
								thumbnail: v.thumbnail || null,
								title: v.title || null,
								order: i,
							})),
						},
					}
					: {}),
			},
			include: {
				category: true,
				brand: true,
				images: true,
				variants: true,
			},
		});

		return NextResponse.json(product);
	} catch (error) {
		console.error("Product PATCH error:", error);
		return NextResponse.json(
			{ error: "Ürün güncellenemedi" },
			{ status: 500 },
		);
	}
}

// DELETE /api/products/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const numId = Number(id);
	if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		await prisma.product.delete({
			where: { id: numId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Product DELETE error:", error);
		return NextResponse.json({ error: "Ürün silinemedi" }, { status: 500 });
	}
}

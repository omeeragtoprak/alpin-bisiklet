import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products/barcode/[code]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ code: string }> },
) {
	try {
		const { code } = await params;
		const product = await prisma.product.findUnique({
			where: { barcode: code },
			include: {
				category: { select: { name: true } },
				brand: { select: { name: true } },
				images: { take: 1, orderBy: { order: "asc" } },
				variants: {
					where: { barcode: code },
					take: 1,
				},
			},
		});

		if (!product) {
			return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
		}

		return NextResponse.json({ data: product });
	} catch (error) {
		console.error("Barcode GET error:", error);
		return NextResponse.json(
			{ error: "Barkod okunamadı" },
			{ status: 500 },
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// PATCH /api/categories/reorder
// body: { items: [{ id: number, order: number }] }
export async function PATCH(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const { items } = body as { items: { id: number; order: number }[] };

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
		}

		// Transaction içinde tüm order değerlerini güncelle
		await prisma.$transaction(
			items.map(({ id, order }) =>
				prisma.category.update({
					where: { id },
					data: { order },
				})
			)
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Category reorder error:", error);
		return NextResponse.json(
			{ error: "Sıralama güncellenemedi" },
			{ status: 500 }
		);
	}
}

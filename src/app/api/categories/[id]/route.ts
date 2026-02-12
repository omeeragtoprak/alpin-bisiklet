import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validations";

// GET /api/categories/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const numId = Number(id);
	if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
	try {
		const category = await prisma.category.findUnique({
			where: { id: numId },
			include: {
				parent: { select: { id: true, name: true } },
				children: { select: { id: true, name: true } },
				_count: { select: { products: true } },
			},
		});

		if (!category) {
			return NextResponse.json({ error: "Kategori bulunamadi" }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error) {
		console.error("Category GET error:", error);
		return NextResponse.json(
			{ error: "Kategori getirilemedi" },
			{ status: 500 },
		);
	}
}

// PATCH /api/categories/[id]
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
		const validated = updateCategorySchema.parse(body);

		// Generate slug if name is provided
		let slug: string | undefined;
		if (validated.name) {
			slug = validated.name
				.toLowerCase()
				.replace(/ğ/g, "g")
				.replace(/ü/g, "u")
				.replace(/ş/g, "s")
				.replace(/ı/g, "i")
				.replace(/ö/g, "o")
				.replace(/ç/g, "c")
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}

		const category = await prisma.category.update({
			where: { id: numId },
			data: {
				...validated,
				...(slug ? { slug } : {}),
			},
		});

		return NextResponse.json(category);
	} catch (error) {
		console.error("Category PATCH error:", error);
		return NextResponse.json(
			{ error: "Kategori guncellenemedi" },
			{ status: 500 },
		);
	}
}

// DELETE /api/categories/[id]
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

		await prisma.category.delete({
			where: { id: numId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Category DELETE error:", error);
		return NextResponse.json(
			{ error: "Kategori silinemedi" },
			{ status: 500 },
		);
	}
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateBrandSchema } from "@/lib/validations";

// GET /api/brands/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const numId = Number(id);
	if (Number.isNaN(numId)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
	try {
		const brand = await prisma.brand.findUnique({
			where: { id: numId },
			include: {
				_count: { select: { products: true } },
			},
		});

		if (!brand) {
			return NextResponse.json({ error: "Marka bulunamadi" }, { status: 404 });
		}

		return NextResponse.json(brand);
	} catch (error) {
		console.error("Brand GET error:", error);
		return NextResponse.json(
			{ error: "Marka getirilemedi" },
			{ status: 500 },
		);
	}
}

// PATCH /api/brands/[id]
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
		const validated = updateBrandSchema.parse(body);

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

		const brand = await prisma.brand.update({
			where: { id: numId },
			data: {
				...validated,
				...(slug ? { slug } : {}),
			},
		});

		return NextResponse.json(brand);
	} catch (error) {
		console.error("Brand PATCH error:", error);
		return NextResponse.json(
			{ error: "Marka guncellenemedi" },
			{ status: 500 },
		);
	}
}

// DELETE /api/brands/[id]
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

		await prisma.brand.delete({
			where: { id: numId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Brand DELETE error:", error);
		return NextResponse.json(
			{ error: "Marka silinemedi" },
			{ status: 500 },
		);
	}
}

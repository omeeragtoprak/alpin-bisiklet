import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateEldenTaksitSchema } from "@/lib/validations";

// GET /api/elden-taksit/[id] — Detay
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { id } = await params;
		const plan = await prisma.eldenTaksit.findUnique({
			where: { id: Number(id) },
			include: {
				user: { select: { id: true, name: true, email: true } },
				product: { select: { id: true, name: true, slug: true, price: true } },
				installments: { orderBy: { installmentNo: "asc" } },
			},
		});

		if (!plan) {
			return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });
		}

		return NextResponse.json({ data: plan });
	} catch (error) {
		console.error("EldenTaksit GET[id] error:", error);
		return NextResponse.json({ error: "Plan alınamadı" }, { status: 500 });
	}
}

// PATCH /api/elden-taksit/[id] — Güncelle
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const result = updateEldenTaksitSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(
				{ error: "Geçersiz veri", details: result.error.flatten() },
				{ status: 400 },
			);
		}

		const data = result.data;
		const plan = await prisma.eldenTaksit.update({
			where: { id: Number(id) },
			data: {
				...(data.customerName && { customerName: data.customerName }),
				...(data.customerPhone && { customerPhone: data.customerPhone }),
				...(data.customerEmail !== undefined && { customerEmail: data.customerEmail || null }),
				...(data.userId !== undefined && { userId: data.userId || null }),
				...(data.productId !== undefined && { productId: data.productId }),
				...(data.productNote !== undefined && { productNote: data.productNote }),
				...(data.totalAmount && { totalAmount: data.totalAmount }),
				...(data.installmentCount && { installmentCount: data.installmentCount }),
				...(data.installmentAmount && { installmentAmount: data.installmentAmount }),
				...(data.startDate && { startDate: new Date(data.startDate) }),
				...(data.notes !== undefined && { notes: data.notes }),
				...(data.status && { status: data.status }),
			},
		});

		return NextResponse.json({ data: plan });
	} catch (error) {
		console.error("EldenTaksit PATCH error:", error);
		return NextResponse.json({ error: "Plan güncellenemedi" }, { status: 500 });
	}
}

// DELETE /api/elden-taksit/[id] — Sil (cascade)
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { id } = await params;
		await prisma.eldenTaksit.delete({ where: { id: Number(id) } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("EldenTaksit DELETE error:", error);
		return NextResponse.json({ error: "Plan silinemedi" }, { status: 500 });
	}
}

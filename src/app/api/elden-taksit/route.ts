import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createEldenTaksitSchema } from "@/lib/validations";
import { sendEldenTaksitCreatedEmail } from "@/lib/mail";

// GET /api/elden-taksit — Plan listesi
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = Math.max(1, Number(searchParams.get("page") || 1));
		const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
		const status = searchParams.get("status") || "";
		const search = searchParams.get("search") || "";

		const where: Record<string, unknown> = {};
		if (status && ["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
			where.status = status;
		}
		if (search) {
			where.OR = [
				{ customerName: { contains: search, mode: "insensitive" } },
				{ customerPhone: { contains: search } },
				{ customerEmail: { contains: search, mode: "insensitive" } },
			];
		}

		const [total, plans] = await Promise.all([
			prisma.eldenTaksit.count({ where }),
			prisma.eldenTaksit.findMany({
				where,
				include: {
					product: { select: { id: true, name: true } },
					installments: { select: { isPaid: true, paidAmount: true, amount: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);

		const data = plans.map((plan) => {
			const paidCount = plan.installments.filter((i) => i.isPaid).length;
			const totalPaid = plan.installments
				.filter((i) => i.isPaid)
				.reduce((sum, i) => sum + (i.paidAmount ?? i.amount), 0);
			const remaining = plan.totalAmount - totalPaid;
			return { ...plan, paidCount, totalPaid, remaining };
		});

		return NextResponse.json({
			data,
			meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
		});
	} catch (error) {
		console.error("EldenTaksit GET error:", error);
		return NextResponse.json({ error: "Liste alınamadı" }, { status: 500 });
	}
}

// POST /api/elden-taksit — Yeni plan oluştur
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const body = await request.json();
		const result = createEldenTaksitSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(
				{ error: "Geçersiz veri", details: result.error.flatten() },
				{ status: 400 },
			);
		}

		const data = result.data;
		const startDate = new Date(data.startDate);

		const plan = await prisma.eldenTaksit.create({
			data: {
				userId: data.userId || null,
				customerName: data.customerName,
				customerPhone: data.customerPhone,
				customerEmail: data.customerEmail || null,
				productId: data.productId ?? null,
				productNote: data.productNote || null,
				totalAmount: data.totalAmount,
				installmentCount: data.installmentCount,
				installmentAmount: data.installmentAmount,
				startDate,
				notes: data.notes || null,
				status: "ACTIVE",
				installments: {
					create: Array.from({ length: data.installmentCount }, (_, i) => {
						const dueDate = new Date(startDate);
						dueDate.setMonth(dueDate.getMonth() + i);
						return {
							installmentNo: i + 1,
							dueDate,
							amount: data.installmentAmount,
						};
					}),
				},
			},
			include: { installments: true },
		});

		// E-posta gönder
		if (data.customerEmail) {
			try {
				await sendEldenTaksitCreatedEmail(data.customerEmail, data.customerName, {
					id: plan.id,
					customerName: plan.customerName,
					totalAmount: plan.totalAmount,
					installmentCount: plan.installmentCount,
					installmentAmount: plan.installmentAmount,
					startDate: plan.startDate,
				});
			} catch (mailErr) {
				console.error("Mail gönderilemedi:", mailErr);
			}
		}

		return NextResponse.json({ data: plan }, { status: 201 });
	} catch (error) {
		console.error("EldenTaksit POST error:", error);
		return NextResponse.json({ error: "Plan oluşturulamadı" }, { status: 500 });
	}
}

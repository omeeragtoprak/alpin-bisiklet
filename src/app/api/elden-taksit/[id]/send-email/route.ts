import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
	sendEldenTaksitCreatedEmail,
	sendEldenTaksitReminderEmail,
} from "@/lib/mail";

// POST /api/elden-taksit/[id]/send-email — Manuel email gönder
export async function POST(
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
		const { type, paymentId } = body as { type: "created" | "reminder"; paymentId?: number };

		const plan = await prisma.eldenTaksit.findUnique({
			where: { id: Number(id) },
			include: { installments: { orderBy: { installmentNo: "asc" } } },
		});

		if (!plan) {
			return NextResponse.json({ error: "Plan bulunamadı" }, { status: 404 });
		}
		if (!plan.customerEmail) {
			return NextResponse.json({ error: "Müşterinin e-postası yok" }, { status: 400 });
		}

		const planSummary = {
			id: plan.id,
			customerName: plan.customerName,
			totalAmount: plan.totalAmount,
			installmentCount: plan.installmentCount,
			installmentAmount: plan.installmentAmount,
			startDate: plan.startDate,
		};

		if (type === "created") {
			await sendEldenTaksitCreatedEmail(plan.customerEmail, plan.customerName, planSummary);
		} else if (type === "reminder") {
			const targetPayment = paymentId
				? plan.installments.find((p) => p.id === paymentId)
				: plan.installments.find((p) => !p.isPaid);

			if (!targetPayment) {
				return NextResponse.json({ error: "Taksit bulunamadı" }, { status: 404 });
			}

			await sendEldenTaksitReminderEmail(
				plan.customerEmail,
				plan.customerName,
				{
					installmentNo: targetPayment.installmentNo,
					dueDate: targetPayment.dueDate,
					amount: targetPayment.amount,
				},
				planSummary,
			);
		} else {
			return NextResponse.json({ error: "Geçersiz email tipi" }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("EldenTaksit send-email error:", error);
		return NextResponse.json({ error: "Email gönderilemedi" }, { status: 500 });
	}
}

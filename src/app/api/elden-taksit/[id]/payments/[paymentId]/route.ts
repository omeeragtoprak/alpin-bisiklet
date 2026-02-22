import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { markInstallmentPaidSchema } from "@/lib/validations";
import { sendEldenTaksitPaymentReceivedEmail } from "@/lib/mail";

// PATCH /api/elden-taksit/[id]/payments/[paymentId] — Taksit güncelle
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; paymentId: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session || session.user.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { id, paymentId } = await params;
		const body = await request.json();
		const result = markInstallmentPaidSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(
				{ error: "Geçersiz veri", details: result.error.flatten() },
				{ status: 400 },
			);
		}

		const data = result.data;

		// Taksiti güncelle
		const payment = await prisma.eldenTaksitPayment.update({
			where: { id: Number(paymentId), eldenTaksitId: Number(id) },
			data: {
				isPaid: data.isPaid,
				paidAt: data.isPaid ? (data.paidAt ? new Date(data.paidAt) : new Date()) : null,
				paidAmount: data.isPaid ? (data.paidAmount ?? null) : null,
				notes: data.notes ?? null,
			},
		});

		// Tüm taksitler ödendiyse planı tamamla
		const plan = await prisma.eldenTaksit.findUnique({
			where: { id: Number(id) },
			include: { installments: true },
		});

		if (plan) {
			const allPaid = plan.installments.every((i) =>
				i.id === payment.id ? data.isPaid : i.isPaid,
			);
			if (allPaid && plan.status === "ACTIVE") {
				await prisma.eldenTaksit.update({
					where: { id: Number(id) },
					data: { status: "COMPLETED" },
				});
			}

			// Makbuz maili gönder
			if (data.isPaid && plan.customerEmail) {
				try {
					await sendEldenTaksitPaymentReceivedEmail(
						plan.customerEmail,
						plan.customerName,
						{
							installmentNo: payment.installmentNo,
							dueDate: payment.dueDate,
							amount: payment.amount,
							paidAmount: payment.paidAmount,
						},
						{
							id: plan.id,
							customerName: plan.customerName,
							totalAmount: plan.totalAmount,
							installmentCount: plan.installmentCount,
							installmentAmount: plan.installmentAmount,
							startDate: plan.startDate,
						},
					);
				} catch (mailErr) {
					console.error("Mail gönderilemedi:", mailErr);
				}
			}
		}

		return NextResponse.json({ data: payment });
	} catch (error) {
		console.error("EldenTaksitPayment PATCH error:", error);
		return NextResponse.json({ error: "Taksit güncellenemedi" }, { status: 500 });
	}
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { refundPayment, isIyzicoConfigured } from "@/lib/iyzico";

// POST /api/payment/refund
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
        }

        if (!isIyzicoConfigured()) {
            return NextResponse.json({ error: "Ödeme sistemi yapılandırılmamış" }, { status: 503 });
        }

        const { orderId, amount } = await request.json();

        const payment = await prisma.payment.findUnique({
            where: { orderId: Number(orderId) },
        });

        if (!payment || !payment.iyzicoPaymentId) {
            return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });
        }

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        const result = await refundPayment({
            locale: "tr",
            conversationId: `refund_${orderId}_${Date.now()}`,
            paymentTransactionId: payment.iyzicoPaymentId,
            price: (amount || payment.amount).toFixed(2),
            currency: "TRY",
            ip,
        });

        if (result.status === "success") {
            await prisma.payment.update({
                where: { orderId: Number(orderId) },
                data: { status: "REFUNDED" },
            });

            await prisma.order.update({
                where: { id: Number(orderId) },
                data: {
                    paymentStatus: "REFUNDED",
                    status: "REFUNDED",
                    statusHistory: {
                        create: { status: "REFUNDED", note: "İade işlemi tamamlandı" },
                    },
                },
            });
        }

        return NextResponse.json({ data: result });
    } catch (error) {
        console.error("Payment refund error:", error);
        return NextResponse.json({ error: "İade işlemi başarısız" }, { status: 500 });
    }
}

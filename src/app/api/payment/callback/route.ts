import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retrievePayment } from "@/lib/iyzico";

// POST /api/payment/callback - 3D Secure geri dönüş
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const status = formData.get("status") as string;
        const paymentId = formData.get("paymentId") as string;
        const conversationId = formData.get("conversationId") as string;

        // conversationId'den order id'yi çıkar
        const orderId = conversationId?.replace("order_", "");

        if (!orderId) {
            return NextResponse.redirect(new URL("/hesabim/siparislerim?error=order_not_found", request.url));
        }

        const numericOrderId = Number(orderId);
        if (Number.isNaN(numericOrderId)) {
            return NextResponse.redirect(new URL("/hesabim/siparislerim?error=invalid_order", request.url));
        }

        if (status === "success" && paymentId) {
            // Iyzico API'den ödemeyi doğrula
            const verification = await retrievePayment({
                locale: "tr",
                conversationId,
                paymentId,
            });

            if (verification.status !== "success") {
                // Ödeme Iyzico tarafından doğrulanamadı
                await prisma.payment.updateMany({
                    where: { iyzicoConversationId: conversationId },
                    data: { status: "FAILED" },
                });

                return NextResponse.redirect(
                    new URL(`/hesabim/siparislerim?error=verification_failed&order=${orderId}`, request.url),
                );
            }

            // Sipariş tutarını kontrol et
            const order = await prisma.order.findUnique({
                where: { id: numericOrderId },
                select: { total: true },
            });

            if (!order) {
                return NextResponse.redirect(
                    new URL("/hesabim/siparislerim?error=order_not_found", request.url),
                );
            }

            // Ödeme tutarı ile sipariş tutarını karşılaştır (kuruş farkı toleransı)
            if (verification.paidPrice && Math.abs(Number(verification.paidPrice) - Number(order.total)) > 0.01) {
                await prisma.payment.updateMany({
                    where: { iyzicoConversationId: conversationId },
                    data: { status: "FAILED" },
                });

                return NextResponse.redirect(
                    new URL(`/hesabim/siparislerim?error=amount_mismatch&order=${orderId}`, request.url),
                );
            }

            // Ödeme başarılı ve doğrulandı
            await prisma.payment.updateMany({
                where: { iyzicoConversationId: conversationId },
                data: {
                    iyzicoPaymentId: paymentId,
                    status: "PAID",
                },
            });

            await prisma.order.update({
                where: { id: numericOrderId },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    statusHistory: {
                        create: { status: "CONFIRMED", note: "3D Secure ödeme onaylandı" },
                    },
                },
            });

            return NextResponse.redirect(
                new URL(`/hesabim/siparislerim?success=true&order=${orderId}`, request.url),
            );
        } else {
            // Ödeme başarısız
            await prisma.payment.updateMany({
                where: { iyzicoConversationId: conversationId },
                data: { status: "FAILED" },
            });

            return NextResponse.redirect(
                new URL(`/hesabim/siparislerim?error=payment_failed&order=${orderId}`, request.url),
            );
        }
    } catch (error) {
        console.error("Payment callback error:", error);
        return NextResponse.redirect(new URL("/hesabim/siparislerim?error=unknown", request.url));
    }
}

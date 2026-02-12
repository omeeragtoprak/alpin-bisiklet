import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPayment, create3DPayment, isIyzicoConfigured } from "@/lib/iyzico";
import type { IyzicoPaymentRequest, IyzicoBasketItem } from "@/lib/iyzico";

// POST /api/payment/initialize
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
        }

        if (!isIyzicoConfigured()) {
            return NextResponse.json(
                { error: "Ödeme sistemi henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin." },
                { status: 503 },
            );
        }

        const body = await request.json();
        const {
            orderId,
            cardHolderName,
            cardNumber,
            expireMonth,
            expireYear,
            cvc,
            use3D = true,
        } = body;

        // Siparişi getir
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) },
            include: {
                user: true,
                items: { include: { product: { include: { category: true } } } },
                shippingAddress: true,
                billingAddress: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
        }

        // Basket items
        const basketItems: IyzicoBasketItem[] = order.items.map((item) => ({
            id: String(item.id),
            name: item.productName,
            category1: item.product?.category?.name || "Bisiklet",
            itemType: "PHYSICAL" as const,
            price: item.total.toFixed(2),
        }));

        // IP address
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

        const paymentRequest: IyzicoPaymentRequest = {
            locale: "tr",
            conversationId: `order_${order.id}`,
            price: order.subtotal.toFixed(2),
            paidPrice: order.total.toFixed(2),
            currency: "TRY",
            installment: "1",
            basketId: `B_${order.orderNumber}`,
            paymentChannel: "WEB",
            paymentGroup: "PRODUCT",
            paymentCard: {
                cardHolderName,
                cardNumber,
                expireMonth,
                expireYear,
                cvc,
            },
            buyer: {
                id: session.user.id,
                name: session.user.name?.split(" ")[0] || "Ad",
                surname: session.user.name?.split(" ").slice(1).join(" ") || "Soyad",
                email: session.user.email,
                identityNumber: body.identityNumber || "11111111111",
                registrationAddress: order.shippingAddress?.address || "Adres",
                ip,
                city: order.shippingAddress?.city || "Istanbul",
                country: "Turkey",
            },
            shippingAddress: {
                contactName: `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() || "Ad Soyad",
                city: order.shippingAddress?.city || "Istanbul",
                country: "Turkey",
                address: order.shippingAddress?.address || "Adres",
            },
            billingAddress: {
                contactName: `${order.billingAddress?.firstName || order.shippingAddress?.firstName || ""} ${order.billingAddress?.lastName || order.shippingAddress?.lastName || ""}`.trim() || "Ad Soyad",
                city: order.billingAddress?.city || order.shippingAddress?.city || "Istanbul",
                country: "Turkey",
                address: order.billingAddress?.address || order.shippingAddress?.address || "Adres",
            },
            basketItems,
        };

        if (use3D) {
            paymentRequest.callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`;
        }

        const result = use3D ? await create3DPayment(paymentRequest) : await createPayment(paymentRequest);

        if (result.status === "success") {
            // Ödeme kaydı oluştur
            await prisma.payment.upsert({
                where: { orderId: order.id },
                update: {
                    iyzicoPaymentId: result.paymentId,
                    iyzicoConversationId: result.conversationId,
                    status: "PAID",
                    amount: order.total,
                    cardType: result.cardType,
                    cardAssociation: result.cardAssociation,
                    cardFamily: result.cardFamily,
                    binNumber: result.binNumber,
                    lastFourDigits: result.lastFourDigits,
                },
                create: {
                    orderId: order.id,
                    iyzicoPaymentId: result.paymentId,
                    iyzicoConversationId: result.conversationId,
                    status: "PAID",
                    amount: order.total,
                    cardType: result.cardType,
                    cardAssociation: result.cardAssociation,
                    cardFamily: result.cardFamily,
                    binNumber: result.binNumber,
                    lastFourDigits: result.lastFourDigits,
                },
            });

            // Sipariş durumunu güncelle
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    statusHistory: {
                        create: { status: "CONFIRMED", note: "Ödeme onaylandı" },
                    },
                },
            });
        } else {
            // Hata durumunda
            await prisma.payment.upsert({
                where: { orderId: order.id },
                update: {
                    status: "FAILED",
                    errorCode: result.errorCode,
                    errorMessage: result.errorMessage,
                },
                create: {
                    orderId: order.id,
                    status: "FAILED",
                    amount: order.total,
                    errorCode: result.errorCode,
                    errorMessage: result.errorMessage,
                },
            });
        }

        return NextResponse.json({ data: result });
    } catch (error) {
        console.error("Payment initialize error:", error);
        return NextResponse.json({ error: "Ödeme başlatılamadı" }, { status: 500 });
    }
}

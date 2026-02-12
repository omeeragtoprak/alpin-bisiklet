import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/orders - Sipariş oluştur
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session) {
			return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
		}

		const body = await request.json();
		const {
			shippingAddressId,
			billingAddressId,
			paymentMethod,
			couponCode,
			customerNote,
		} = body;

		// Sepeti getir
		const cart = await prisma.cart.findFirst({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						product: true,
						variant: true,
					},
				},
			},
		});

		if (!cart || cart.items.length === 0) {
			return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
		}

		// Fiyat hesapla
		let subtotal = 0;
		for (const item of cart.items) {
			const price = item.variant?.price || item.product.price;
			subtotal += Number(price) * item.quantity;
		}

		const shippingCost = subtotal >= 500 ? 0 : 50; // 500 TL üzeri ücretsiz
		let discount = 0;

		// Kupon kontrolü
		if (couponCode) {
			const coupon = await prisma.coupon.findFirst({
				where: {
					code: couponCode,
					isActive: true,
					validFrom: { lte: new Date() },
					validTo: { gte: new Date() },
				},
			});

			if (coupon) {
				if (coupon.type === "PERCENTAGE") {
					discount = (subtotal * Number(coupon.value)) / 100;
					if (coupon.maxDiscount) {
						discount = Math.min(discount, Number(coupon.maxDiscount));
					}
				} else if (coupon.type === "FIXED") {
					discount = Number(coupon.value);
				} else if (coupon.type === "FREE_SHIPPING") {
					discount = shippingCost;
				}
			}
		}

		const tax = 0; // KDV hesabı gerekirse
		const total = subtotal + shippingCost - discount + tax;

		// Sipariş numarası oluştur
		const orderNumber = `SP-${new Date().getFullYear()}-${Date.now()}`;

		// Sipariş oluştur
		const order = await prisma.order.create({
			data: {
				orderNumber,
				userId: session.user.id,
				status: "PENDING",
				subtotal,
				shippingCost,
				discount,
				tax,
				total,
				shippingAddressId,
				billingAddressId,
				paymentMethod,
				paymentStatus: "PENDING",
				couponCode,
				customerNote,
				items: {
					create: cart.items.map((item) => ({
						productId: item.productId,
						variantId: item.variantId,
						productName: item.product.name,
						variantName: item.variant?.name,
						sku: item.variant?.sku || item.product.sku,
						quantity: item.quantity,
						price: Number(item.variant?.price || item.product.price),
						total:
							Number(item.variant?.price || item.product.price) * item.quantity,
					})),
				},
				statusHistory: {
					create: {
						status: "PENDING",
						note: "Sipariş oluşturuldu",
					},
				},
			},
			include: {
				items: true,
				shippingAddress: true,
				billingAddress: true,
			},
		});

		// Sepeti temizle
		await prisma.cartItem.deleteMany({
			where: { cartId: cart.id },
		});

		return NextResponse.json({ data: order }, { status: 201 });
	} catch (error) {
		console.error("Order POST error:", error);
		return NextResponse.json(
			{ error: "Sipariş oluşturulamadı" },
			{ status: 500 },
		);
	}
}

// GET /api/orders - Kullanıcının siparişlerini getir
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session) {
			return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
		}

		const orders = await prisma.order.findMany({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						product: {
							include: {
								images: { take: 1 },
							},
						},
					},
				},
				shippingAddress: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({ data: orders });
	} catch (error) {
		console.error("Orders GET error:", error);
		return NextResponse.json(
			{ error: "Siparişler getirilemedi" },
			{ status: 500 },
		);
	}
}

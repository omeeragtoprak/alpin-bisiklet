import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getProductPricing } from "@/lib/pricing";

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

		// Sepeti getir (DB veya client-side Zustand)
		const dbCart = await prisma.cart.findFirst({
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

		type CartItemRow = {
			id: number | string;
			cartId: string;
			productId: number;
			variantId: string | null;
			quantity: number;
			createdAt: Date;
			updatedAt: Date;
			product: Awaited<ReturnType<typeof prisma.product.findFirstOrThrow>>;
			variant: null | { id: string; price: unknown; name: string; sku: string | null };
		};

		let effectiveItems: CartItemRow[];
		let dbCartId: string | null = dbCart?.id ?? null;

		if (dbCart && dbCart.items.length > 0) {
			effectiveItems = dbCart.items as CartItemRow[];
		} else if (body.cartItems && Array.isArray(body.cartItems) && body.cartItems.length > 0) {
			// Zustand mağazasından gelen sepet öğelerini DB'den doğrula
			const clientItems = body.cartItems as Array<{
				productId: string | number;
				variantId?: string | null;
				quantity: number;
			}>;
			const productIds = clientItems.map((i) => Number(i.productId));
			const products = await prisma.product.findMany({
				where: { id: { in: productIds }, isActive: true },
			});
			effectiveItems = clientItems
				.map((ci, idx) => {
					const product = products.find((p) => p.id === Number(ci.productId));
					if (!product) return null;
					return {
						id: idx,
						cartId: "",
						productId: Number(ci.productId),
						variantId: ci.variantId ?? null,
						quantity: ci.quantity,
						createdAt: new Date(),
						updatedAt: new Date(),
						product,
						variant: null,
					} as CartItemRow;
				})
				.filter((x): x is CartItemRow => x !== null);
		} else {
			return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
		}

		if (effectiveItems.length === 0) {
			return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
		}

		// Aktif toplu indirimler
		const now = new Date();
		const activeDiscounts = await prisma.discount.findMany({
			where: {
				isActive: true,
				OR: [{ validFrom: null }, { validFrom: { lte: now } }],
				AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
			},
			include: { category: { select: { id: true } } },
		});

		// Fiyat hesapla — güvenlik: client fiyatı görmezden gel, server-side hesapla
		let subtotal = 0;
		const itemPrices: Record<number | string, number> = {};
		for (const item of effectiveItems) {
			let effectivePrice: number;
			if (item.variant?.price != null) {
				effectivePrice = Number(item.variant.price);
			} else {
				const applicable = activeDiscounts.filter((d) =>
					d.type === "STORE_WIDE" ||
					(d.type === "CATEGORY" && d.category?.id === item.product.categoryId) ||
					(d.type === "ON_SALE" &&
						item.product.comparePrice != null &&
						item.product.comparePrice > item.product.price),
				);
				const pricing = getProductPricing(item.product, applicable);
				effectivePrice = pricing.effectivePrice;
			}
			itemPrices[item.id] = effectivePrice;
			subtotal += effectivePrice * item.quantity;
		}

		const shippingCost = subtotal >= 500 ? 0 : 50; // 500 TL üzeri ücretsiz
		let discount = 0;
		let appliedCouponId: number | undefined;

		// Gelişmiş kupon kontrolü
		if (couponCode) {
			const coupon = await prisma.coupon.findFirst({
				where: {
					code: couponCode.toUpperCase(),
					isActive: true,
					validFrom: { lte: new Date() },
					validTo: { gte: new Date() },
				},
				include: {
					categories: { select: { categoryId: true } },
					products: { select: { productId: true } },
				},
			});

			if (coupon) {
				let couponValid = true;

				// Kullanıcıya özel kupon kontrolü
				if (coupon.userId && coupon.userId !== session.user.id) {
					couponValid = false;
				}

				// maxUses kontrolü
				if (couponValid && coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
					couponValid = false;
				}

				// maxUsesPerUser kontrolü
				if (couponValid && coupon.maxUsesPerUser != null) {
					const userUsage = await prisma.order.count({
						where: { userId: session.user.id, couponId: coupon.id },
					});
					if (userUsage >= coupon.maxUsesPerUser) couponValid = false;
				}

				// firstOrderOnly kontrolü
				if (couponValid && coupon.firstOrderOnly) {
					const orderCount = await prisma.order.count({ where: { userId: session.user.id } });
					if (orderCount > 0) couponValid = false;
				}

				if (couponValid) {
					// Kapsam belirleme
					const hasCategoryScope = coupon.categories.length > 0;
					const hasProductScope = coupon.products.length > 0;
					const scopedCategoryIds = new Set(coupon.categories.map((c) => c.categoryId));
					const scopedProductIds = new Set(coupon.products.map((p) => p.productId));

					let applicableSubtotal = subtotal;
					if (hasCategoryScope || hasProductScope) {
						applicableSubtotal = 0;
						for (const item of effectiveItems) {
							const ep = itemPrices[item.id] ?? Number(item.variant?.price || item.product.price);
							const catId = item.product.categoryId;
							const inScope =
								(hasProductScope && scopedProductIds.has(item.productId)) ||
								(hasCategoryScope && catId != null && scopedCategoryIds.has(catId));
							if (inScope) applicableSubtotal += ep * item.quantity;
						}
					}

					if (coupon.type === "PERCENTAGE") {
						discount = (applicableSubtotal * Number(coupon.value)) / 100;
						if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
					} else if (coupon.type === "FIXED") {
						discount = Math.min(Number(coupon.value), applicableSubtotal);
					} else if (coupon.type === "FREE_SHIPPING") {
						discount = shippingCost;
					}
					appliedCouponId = coupon.id;
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
				couponId: appliedCouponId,
				customerNote,
				items: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					create: effectiveItems.map((item) => {
						const ep = itemPrices[item.id] ?? Number(item.variant?.price || item.product.price);
						return {
							productId: item.productId,
							variantId: item.variantId,
							productName: item.product.name,
							variantName: item.variant?.name,
							sku: item.variant?.sku || item.product.sku,
							quantity: item.quantity,
							price: ep,
							total: ep * item.quantity,
						};
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					}) as any[],
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

		// Kupon kullanım sayısını artır
		if (appliedCouponId) {
			await prisma.coupon.update({
				where: { id: appliedCouponId },
				data: { usedCount: { increment: 1 } },
			});
		}

		// Sepeti temizle (sadece DB sepeti varsa)
		if (dbCartId) {
			await prisma.cartItem.deleteMany({
				where: { cartId: dbCartId },
			});
		}

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

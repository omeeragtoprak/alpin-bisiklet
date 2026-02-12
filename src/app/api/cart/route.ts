import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/cart - Sepeti getir
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		const sessionId = request.cookies.get("cart_session")?.value;

		if (!session && !sessionId) {
			return NextResponse.json({ data: null });
		}

		const cart = await prisma.cart.findFirst({
			where: session
				? { userId: session.user.id }
				: { sessionId },
			include: {
				items: {
					include: {
						product: {
							include: {
								images: { take: 1, orderBy: { order: "asc" } },
								brand: { select: { name: true } },
							},
						},
						variant: true,
					},
				},
			},
		});

		return NextResponse.json({ data: cart });
	} catch (error) {
		console.error("Cart GET error:", error);
		return NextResponse.json(
			{ error: "Sepet getirilemedi" },
			{ status: 500 },
		);
	}
}

// POST /api/cart - Sepete ürün ekle
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { productId, variantId, quantity = 1 } = body;

		const session = await auth.api.getSession({ headers: await headers() });
		let sessionId = request.cookies.get("cart_session")?.value;

		// Ürünü kontrol et
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product || !product.isActive) {
			return NextResponse.json(
				{ error: "Ürün bulunamadı" },
				{ status: 404 },
			);
		}

		// Stok kontrolü
		if (product.trackStock && product.stock < quantity) {
			return NextResponse.json(
				{ error: "Yeterli stok yok" },
				{ status: 400 },
			);
		}

		// Sepeti bul veya oluştur
		let cart = await prisma.cart.findFirst({
			where: session
				? { userId: session.user.id }
				: sessionId
					? { sessionId }
					: { id: "never-match" },
		});

		if (!cart) {
			// Yeni session ID oluştur
			if (!sessionId) {
				sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			}

			cart = await prisma.cart.create({
				data: {
					userId: session?.user?.id,
					sessionId: !session ? sessionId : undefined,
				},
			});
		}

		// Sepette aynı ürün var mı kontrol et
		const existingItem = await prisma.cartItem.findFirst({
			where: {
				cartId: cart.id,
				productId,
				variantId: variantId || null,
			},
		});

		if (existingItem) {
			// Miktarı artır
			await prisma.cartItem.update({
				where: { id: existingItem.id },
				data: { quantity: existingItem.quantity + quantity },
			});
		} else {
			// Yeni item ekle
			await prisma.cartItem.create({
				data: {
					cartId: cart.id,
					productId,
					variantId,
					quantity,
				},
			});
		}

		const response = NextResponse.json({ success: true });

		// Session ID'yi cookie'ye kaydet
		if (!session && sessionId) {
			response.cookies.set("cart_session", sessionId, {
				maxAge: 60 * 60 * 24 * 30, // 30 gün
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
			});
		}

		return response;
	} catch (error) {
		console.error("Cart POST error:", error);
		return NextResponse.json(
			{ error: "Ürün sepete eklenemedi" },
			{ status: 500 },
		);
	}
}

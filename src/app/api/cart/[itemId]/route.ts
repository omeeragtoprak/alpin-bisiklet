import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getCartOwner(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	const sessionId = request.cookies.get("cart_session")?.value;
	if (!session && !sessionId) return null;
	return { userId: session?.user?.id, sessionId };
}

// PATCH /api/cart/[itemId] - Miktar güncelle
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	try {
		const { itemId } = await params;
		const numId = Number(itemId);
		if (Number.isNaN(numId)) {
			return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
		}

		const owner = await getCartOwner(request);
		if (!owner) {
			return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
		}

		const body = await request.json();
		const { quantity } = body;

		if (quantity < 1) {
			return NextResponse.json(
				{ error: "Miktar en az 1 olmalı" },
				{ status: 400 },
			);
		}

		const item = await prisma.cartItem.findUnique({
			where: { id: numId },
			include: { product: true, cart: true },
		});

		if (!item) {
			return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
		}

		// Cart item'in kullanıcıya ait olduğunu doğrula
		const isOwner = owner.userId
			? item.cart.userId === owner.userId
			: item.cart.sessionId === owner.sessionId;

		if (!isOwner) {
			return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
		}

		// Stok kontrolü
		if (item.product.trackStock && quantity > item.product.stock) {
			return NextResponse.json(
				{ error: "Yeterli stok yok" },
				{ status: 400 },
			);
		}

		await prisma.cartItem.update({
			where: { id: numId },
			data: { quantity },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("CartItem PATCH error:", error);
		return NextResponse.json(
			{ error: "Miktar güncellenemedi" },
			{ status: 500 },
		);
	}
}

// DELETE /api/cart/[itemId] - Sepetten çıkar
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	try {
		const { itemId } = await params;
		const numId = Number(itemId);
		if (Number.isNaN(numId)) {
			return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
		}

		const owner = await getCartOwner(request);
		if (!owner) {
			return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
		}

		const item = await prisma.cartItem.findUnique({
			where: { id: numId },
			include: { cart: true },
		});

		if (!item) {
			return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
		}

		// Cart item'in kullanıcıya ait olduğunu doğrula
		const isOwner = owner.userId
			? item.cart.userId === owner.userId
			: item.cart.sessionId === owner.sessionId;

		if (!isOwner) {
			return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 });
		}

		await prisma.cartItem.delete({
			where: { id: numId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("CartItem DELETE error:", error);
		return NextResponse.json(
			{ error: "Ürün sepetten çıkarılamadı" },
			{ status: 500 },
		);
	}
}

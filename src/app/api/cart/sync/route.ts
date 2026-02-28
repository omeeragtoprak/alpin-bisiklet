import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface SyncItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

/**
 * POST /api/cart/sync
 *
 * Zustand sepetini DB ile senkronize eder:
 * 1. Client'tan gelen local item'ları DB'ye upsert eder (quantity: max(local, db))
 * 2. Tüm DB cart item'larını (güncel fiyatlarla) döner
 * 3. Client bu response ile Zustand'ı günceller
 *
 * Sadece oturum açmış kullanıcılar için çalışır.
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Oturum açılmamış" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const localItems: SyncItem[] = Array.isArray(body.items) ? body.items : [];

    // Kullanıcının DB cart'ını bul veya oluştur
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Local item'ları DB'ye upsert et (sadece geçerli ürünler)
    if (localItems.length > 0) {
      const productIds = localItems.map((i) => i.productId).filter(Boolean);
      const validProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, stock: true, trackStock: true },
      });
      const validProductMap = new Map(validProducts.map((p) => [p.id, p]));

      for (const item of localItems) {
        const product = validProductMap.get(item.productId);
        if (!product) continue;

        const qty = Math.max(1, item.quantity);
        const safeQty =
          product.trackStock && product.stock < qty ? product.stock : qty;
        if (safeQty <= 0) continue;

        const existing = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
          },
        });

        if (existing) {
          // DB'dekini lokal ile topla (kullanıcı iki cihazda ürün eklemiş olabilir)
          const merged = Math.min(
            existing.quantity + safeQty,
            product.trackStock ? product.stock : 9999,
          );
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: merged },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: safeQty,
            },
          });
        }
      }
    }

    // Güncel DB cart'ı döndür (fiyat + görsel dahil)
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
                category: { select: { name: true } },
              },
            },
            variant: { select: { id: true, name: true } },
          },
        },
      },
    });

    const cartItems = (updatedCart?.items ?? []).map((item) => ({
      id: String(item.product.id),
      variantId: item.variantId ? String(item.variantId) : undefined,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      image: item.product.images[0]?.url ?? "",
      quantity: item.quantity,
      category: item.product.category?.name ?? "",
    }));

    return NextResponse.json({ data: cartItems });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Sepet senkronize edilemedi" }, { status: 500 });
  }
}

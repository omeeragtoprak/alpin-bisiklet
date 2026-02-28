/**
 * /api/cart — Mevcut durum notu:
 *
 * Sepet yönetimi Zustand (localStorage) üzerinden yapılıyor.
 * DB senkronizasyonu /api/cart/sync endpoint'i üzerinden gerçekleşir:
 *  - Login sonrası: Zustand → DB merge
 *  - Başka cihazda login: DB → Zustand populate
 *
 * GET /api/cart — admin veya 3. parti entegrasyon için debug amaçlı korunuyor.
 * POST /api/cart — kaldırıldı, yerine /api/cart/sync kullanılıyor.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/cart - Kullanıcının DB sepetini getir (debug / admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ data: null });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: "asc" } },
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
    return NextResponse.json({ error: "Sepet getirilemedi" }, { status: 500 });
  }
}

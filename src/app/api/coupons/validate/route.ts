import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface CartItem {
  productId: number;
  categoryId?: number | null;
  quantity: number;
  price: number; // effective price
}

// POST /api/coupons/validate
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = await request.json();
    const { code, items }: { code: string; items: CartItem[] } = body;

    if (!code || !items?.length) {
      return NextResponse.json({ valid: false, message: "Kupon kodu veya sepet bilgisi eksik" });
    }

    const now = new Date();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      include: {
        categories: { select: { categoryId: true } },
        products: { select: { productId: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Geçersiz veya süresi dolmuş kupon kodu" });
    }

    // maxUses kontrolü
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: "Bu kupon maksimum kullanım sayısına ulaştı" });
    }

    // maxUsesPerUser kontrolü
    if (coupon.maxUsesPerUser != null) {
      const userUsageCount = await prisma.order.count({
        where: { userId: session.user.id, couponId: coupon.id },
      });
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json({ valid: false, message: "Bu kuponu daha fazla kullanamazsınız" });
      }
    }

    // firstOrderOnly kontrolü
    if (coupon.firstOrderOnly) {
      const orderCount = await prisma.order.count({
        where: { userId: session.user.id },
      });
      if (orderCount > 0) {
        return NextResponse.json({ valid: false, message: "Bu kupon yalnızca ilk siparişlerde geçerlidir" });
      }
    }

    // Kapsam belirleme — hangi ürünler kupon kapsamında?
    const hasCategoryScope = coupon.categories.length > 0;
    const hasProductScope = coupon.products.length > 0;
    const scopedCategoryIds = new Set(coupon.categories.map((c) => c.categoryId));
    const scopedProductIds = new Set(coupon.products.map((p) => p.productId));

    let applicableItems = items;
    if (hasCategoryScope || hasProductScope) {
      applicableItems = items.filter((item) => {
        if (hasProductScope && scopedProductIds.has(item.productId)) return true;
        if (hasCategoryScope && item.categoryId != null && scopedCategoryIds.has(item.categoryId)) return true;
        return false;
      });

      if (applicableItems.length === 0) {
        return NextResponse.json({
          valid: false,
          message: "Bu kupon sepetinizdeki ürünlere uygulanamaz",
        });
      }
    }

    // applicableSubtotal — indirim bu tutar üzerinden hesaplanır
    const applicableSubtotal = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // minPurchase kontrolü (toplam sepet üzerinden)
    if (coupon.minPurchase != null && totalSubtotal < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        message: `Bu kupon için minimum ${coupon.minPurchase.toLocaleString("tr-TR")} ₺ tutarında alışveriş gerekli`,
      });
    }

    // minQuantity kontrolü (uygulanabilir ürünlerin toplam adedi)
    if (coupon.minQuantity != null) {
      const totalQty = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty < coupon.minQuantity) {
        return NextResponse.json({
          valid: false,
          message: `Bu kupon için en az ${coupon.minQuantity} adet ürün gerekli`,
        });
      }
    }

    // İndirim hesaplama
    let discount = 0;
    const totalShipping = 50; // varsayılan kargo, sepet sayfasından gelemeyebilir

    if (coupon.type === "PERCENTAGE") {
      discount = (applicableSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount != null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === "FIXED") {
      discount = Math.min(coupon.value, applicableSubtotal);
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = totalShipping;
    }

    discount = Math.round(discount * 100) / 100;

    return NextResponse.json({
      valid: true,
      discount,
      message: `Kupon uygulandı! ${discount.toLocaleString("tr-TR")} ₺ indirim kazandınız.`,
      applicableSubtotal,
      couponType: coupon.type,
      couponValue: coupon.value,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ valid: false, message: "Kupon doğrulanamadı" }, { status: 500 });
  }
}

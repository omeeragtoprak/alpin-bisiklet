import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateDiscountSchema } from "@/lib/validations";

// PATCH /api/discounts/[id] — Admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const discountId = Number(id);
    if (Number.isNaN(discountId)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateDiscountSchema.parse(body);

    const discount = await prisma.discount.update({
      where: { id: discountId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.validFrom !== undefined && {
          validFrom: data.validFrom ? new Date(data.validFrom) : null,
        }),
        ...(data.validTo !== undefined && {
          validTo: data.validTo ? new Date(data.validTo) : null,
        }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: discount });
  } catch (error) {
    console.error("Discount PATCH error:", error);
    return NextResponse.json({ error: "İndirim güncellenemedi" }, { status: 500 });
  }
}

// DELETE /api/discounts/[id] — Admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const { id } = await params;
    const discountId = Number(id);
    if (Number.isNaN(discountId)) {
      return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
    }

    await prisma.discount.delete({ where: { id: discountId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Discount DELETE error:", error);
    return NextResponse.json({ error: "İndirim silinemedi" }, { status: 500 });
  }
}

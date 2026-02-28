import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createDiscountSchema } from "@/lib/validations";

// GET /api/discounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");

    const now = new Date();

    const where: Record<string, unknown> = {};

    if (isActiveParam === "true") {
      where.isActive = true;
      where.OR = [{ validFrom: null }, { validFrom: { lte: now } }];
      where.AND = [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }];
    }

    const discounts = await prisma.discount.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: discounts });
  } catch (error) {
    console.error("Discounts GET error:", error);
    return NextResponse.json({ error: "Discounts getirilemedi" }, { status: 500 });
  }
}

// POST /api/discounts — Admin only
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const body = await request.json();
    const data = createDiscountSchema.parse(body);

    const discount = await prisma.discount.create({
      data: {
        name: data.name,
        type: data.type,
        categoryId: data.categoryId ?? null,
        value: data.value,
        isActive: data.isActive,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validTo: data.validTo ? new Date(data.validTo) : null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: discount }, { status: 201 });
  } catch (error) {
    console.error("Discount POST error:", error);
    return NextResponse.json({ error: "İndirim oluşturulamadı" }, { status: 500 });
  }
}

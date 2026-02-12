import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/addresses/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const { id } = await params;

        const address = await prisma.address.findUnique({ where: { id } });

        if (!address || address.userId !== session.user.id) {
            return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
        }

        return NextResponse.json({ data: address });
    } catch (error) {
        console.error("Address GET error:", error);
        return NextResponse.json({ error: "Adres getirilemedi" }, { status: 500 });
    }
}

// PATCH /api/addresses/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const { id } = await params;

        // Adresin kullanıcıya ait olduğunu doğrula
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
        }

        const body = await request.json();
        const { title, firstName, lastName, phone, city, district, neighborhood, address: addressLine, postalCode, isDefault } = body;

        // Varsayılan adres yapılıyorsa diğerlerini kaldır
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.address.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(firstName !== undefined && { firstName }),
                ...(lastName !== undefined && { lastName }),
                ...(phone !== undefined && { phone }),
                ...(city !== undefined && { city }),
                ...(district !== undefined && { district }),
                ...(neighborhood !== undefined && { neighborhood }),
                ...(addressLine !== undefined && { address: addressLine }),
                ...(postalCode !== undefined && { postalCode }),
                ...(isDefault !== undefined && { isDefault }),
            },
        });

        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error("Address PATCH error:", error);
        return NextResponse.json({ error: "Adres güncellenemedi" }, { status: 500 });
    }
}

// DELETE /api/addresses/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

        const { id } = await params;

        // Adresin kullanıcıya ait olduğunu doğrula
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
        }

        await prisma.address.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Address DELETE error:", error);
        return NextResponse.json({ error: "Adres silinemedi" }, { status: 500 });
    }
}

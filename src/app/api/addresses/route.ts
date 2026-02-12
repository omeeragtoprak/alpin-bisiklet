import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/addresses - Kullanıcının adreslerini getir
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ data: addresses });
    } catch (error) {
        console.error("Addresses GET error:", error);
        return NextResponse.json(
            { error: "Adresler getirilemedi" },
            { status: 500 },
        );
    }
}

// POST /api/addresses - Yeni adres oluştur
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            firstName,
            lastName,
            phone,
            city,
            district,
            neighborhood,
            address: addressLine,
            postalCode,
            isDefault,
        } = body;

        // Validation
        if (!title || !firstName || !lastName || !phone || !city || !district || !addressLine) {
            return NextResponse.json(
                { error: "Zorunlu alanları doldurunuz" },
                { status: 400 },
            );
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId: session.user.id,
                title,
                firstName,
                lastName,
                phone,
                city,
                district,
                neighborhood,
                address: addressLine,
                postalCode,
                isDefault: isDefault || false,
            },
        });

        return NextResponse.json({ data: newAddress }, { status: 201 });
    } catch (error) {
        console.error("Address POST error:", error);
        return NextResponse.json(
            { error: "Adres oluşturulamadı" },
            { status: 500 },
        );
    }
}

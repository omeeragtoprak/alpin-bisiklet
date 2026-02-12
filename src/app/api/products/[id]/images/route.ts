import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { uploadImage, deleteFile } from "@/lib/upload";

// POST /api/products/[id]/images
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const alt = formData.get("alt") as string;
		const order = Number(formData.get("order")) || 0;

		if (!file) {
			return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
		}

		const uploadResult = await uploadImage(file);

		if (!uploadResult.success) {
			return NextResponse.json(
				{ error: uploadResult.error },
				{ status: 400 },
			);
		}

		const image = await prisma.productImage.create({
			data: {
				productId: Number(id),
				url: uploadResult.url!,
				alt: alt || "",
				order,
			},
		});

		return NextResponse.json(image, { status: 201 });
	} catch (error) {
		console.error("Product image upload error:", error);
		return NextResponse.json(
			{ error: "Görsel yüklenemedi" },
			{ status: 500 },
		);
	}
}

// DELETE /api/products/[id]/images
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || session.user?.role !== "ADMIN") {
			return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const imageId = searchParams.get("imageId");

		if (!imageId) {
			return NextResponse.json(
				{ error: "imageId gerekli" },
				{ status: 400 },
			);
		}

		const image = await prisma.productImage.findUnique({
			where: { id: Number(imageId) },
		});

		if (!image) {
			return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
		}

		// Dosyayı sil
		await deleteFile(image.url);

		// Veritabanından sil
		await prisma.productImage.delete({
			where: { id: Number(imageId) },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Product image delete error:", error);
		return NextResponse.json(
			{ error: "Görsel silinemedi" },
			{ status: 500 },
		);
	}
}

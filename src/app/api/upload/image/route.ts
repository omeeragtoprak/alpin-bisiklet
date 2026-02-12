import { requireAuth } from "@/lib/auth-server";
import { uploadImage, uploadImages } from "@/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Tek dosya mı yoksa birden fazla mı?
    if (files.length === 1) {
      const result = await uploadImage(files[0]);
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    // Birden fazla dosya
    const results = await uploadImages(files);
    const allSuccess = results.every((r) => r.success);

    return NextResponse.json(
      {
        success: allSuccess,
        results,
        urls: results.filter((r) => r.success).map((r) => r.url),
      },
      { status: allSuccess ? 200 : 207 }
    );
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

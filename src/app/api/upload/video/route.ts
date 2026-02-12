import { requireAuth } from "@/lib/auth-server";
import { uploadVideo } from "@/lib/upload";
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
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    const result = await uploadVideo(file);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Video upload API error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

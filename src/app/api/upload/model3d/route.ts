import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { uploadModel3d } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: "Yetkilendirme gerekli" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Dosya bulunamadı" }, { status: 400 });
    }

    const result = await uploadModel3d(file);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: result.url, filename: result.filename });
  } catch (error) {
    console.error("Model upload hatası:", error);
    return NextResponse.json({ success: false, error: "Yükleme başarısız" }, { status: 500 });
  }
}

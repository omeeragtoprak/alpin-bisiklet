import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

/**
 * POST /api/banners/seed-examples
 * Admin only — her pozisyon için birer örnek banner oluşturur.
 * Unsplash/placeholder görseller kullanılır.
 */
export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const examples = [
    {
      title: "Yaz Kampanyası",
      subtitle: "Ana Slider Örneği",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=700&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop",
      link: "/urunler",
      buttonText: "Ürünleri Keşfet",
      position: "HERO" as const,
      order: 0,
      isActive: true,
    },
    {
      title: "Dağ Bisikleti İndirimi",
      subtitle: "Yan Bar Örneği",
      image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=600&h=450&fit=crop",
      link: "/urunler?kategoriler=dag-bisikleti",
      buttonText: "İncele",
      position: "SIDEBAR" as const,
      order: 0,
      isActive: true,
    },
    {
      title: "Aksesuar Koleksiyonu",
      subtitle: "Kategori Banner Örneği",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1400&h=350&fit=crop",
      link: "/urunler",
      buttonText: "Tümünü Gör",
      position: "CATEGORY" as const,
      order: 0,
      isActive: true,
    },
    {
      title: "Özel Teklif",
      subtitle: "Ürün Sayfası Banner",
      image: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=1400&h=450&fit=crop",
      link: "/urunler",
      buttonText: "Fırsatı Kaçırma",
      position: "PRODUCT" as const,
      order: 0,
      isActive: true,
    },
    {
      title: "%20 İndirim",
      subtitle: "Popup Banner Örneği",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=800&fit=crop",
      link: "/urunler",
      buttonText: "İndirimi Al",
      position: "POPUP" as const,
      order: 0,
      isActive: true,
    },
  ];

  const created = await Promise.all(
    examples.map((ex) =>
      prisma.banner.create({ data: ex }),
    ),
  );

  return NextResponse.json({
    message: `${created.length} örnek banner oluşturuldu`,
    banners: created,
  });
}

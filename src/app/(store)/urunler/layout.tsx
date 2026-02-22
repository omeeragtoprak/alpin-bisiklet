import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

export const metadata: Metadata = {
  title: "Bisiklet ve Aksesuar | Ürünler",
  description:
    "Dağ bisikleti, yol bisikleti, şehir bisikleti, elektrikli bisiklet ve tüm bisiklet aksesuarları. Merida, Giant, Trek, Scott ve daha fazla marka. Ücretsiz kargo.",
  keywords: [
    "bisiklet satın al",
    "dağ bisikleti fiyatları",
    "yol bisikleti",
    "şehir bisikleti",
    "elektrikli bisiklet",
    "bisiklet aksesuar",
    "bisiklet kask",
    "bisiklet yedek parça",
    "merida bisiklet fiyatları",
    "giant bisiklet",
  ],
  alternates: {
    canonical: `${BASE_URL}/urunler`,
  },
  openGraph: {
    title: "Bisiklet ve Aksesuar | Alpin Bisiklet",
    description:
      "Tüm bisiklet modelleri ve aksesuarları. Ücretsiz kargo, güvenli ödeme.",
    url: `${BASE_URL}/urunler`,
    type: "website",
  },
};

export default function UrunlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

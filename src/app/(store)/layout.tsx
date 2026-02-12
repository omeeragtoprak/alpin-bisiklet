import { StoreHeader, StoreFooter, CartDrawer } from "@/components/store";
import { PageTransition } from "@/components/animations";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Alpin Bisiklet - Türkiye'nin En Güvenilir Bisiklet Mağazası",
    template: "%s | Alpin Bisiklet",
  },
  description:
    "Dağ bisikleti, yol bisikleti, şehir bisikleti ve aksesuarlar. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.",
  keywords: [
    "bisiklet",
    "dağ bisikleti",
    "yol bisikleti",
    "bisiklet aksesuarları",
    "bisiklet yedek parça",
    "kask",
    "bisiklet giysi",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Alpin Bisiklet",
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <StoreHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <StoreFooter />
    </div>
  );
}


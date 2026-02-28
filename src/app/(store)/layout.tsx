import { StoreHeader, StoreFooter, CartDrawer } from "@/components/store";
import { PageTransition } from "@/components/animations";
import { BlogPopup } from "@/components/store/blog-popup";
import { WhatsAppWidget } from "@/components/store/whatsapp-widget";
import { PopupBanner } from "@/components/store/banners/popup-banner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Alpin Bisiklet - Türkiye'nin En Güvenilir Bisiklet Mağazası",
    template: "%s | Alpin Bisiklet",
  },
  description:
    "Dağ bisikleti, yol bisikleti, şehir bisikleti ve aksesuarlar. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Alpin Bisiklet",
    images: [{ url: "/logo.png", width: 200, height: 200, alt: "Alpin Bisiklet" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alpinbisiklet",
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
      <BlogPopup />
      <PopupBanner />
      <WhatsAppWidget />
    </div>
  );
}


import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/json-ld";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "sileo";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Alpin Bisiklet - Türkiye'nin En Güvenilir Bisiklet Mağazası",
    template: "%s | Alpin Bisiklet",
  },
  description:
    "30 yılı aşkın tecrübemizle dağ bisikleti, yol bisikleti, şehir bisikleti, elektrikli bisiklet, aksesuar ve yedek parça. Türkiye geneli kargo, güvenli ödeme.",
  keywords: [
    "bisiklet",
    "alpin bisiklet",
    "dağ bisikleti",
    "yol bisikleti",
    "şehir bisikleti",
    "elektrikli bisiklet",
    "bisiklet aksesuarları",
    "bisiklet yedek parça",
    "kask",
    "bisiklet giysi",
    "merida bisiklet",
    "trek bisiklet",
    "giant bisiklet",
    "bisiklet mağazası",
    "türkiye bisiklet",
  ],
  authors: [{ name: "Alpin Bisiklet", url: BASE_URL }],
  creator: "Alpin Bisiklet",
  publisher: "Alpin Bisiklet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "Alpin Bisiklet",
    title: "Alpin Bisiklet - Türkiye'nin En Güvenilir Bisiklet Mağazası",
    description:
      "30 yılı aşkın tecrübemizle dağ bisikleti, yol bisikleti, şehir bisikleti, elektrikli bisiklet, aksesuar ve yedek parça.",
    images: [
      {
        url: "/logo.png",
        width: 200,
        height: 200,
        alt: "Alpin Bisiklet Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpin Bisiklet - Türkiye'nin En Güvenilir Bisiklet Mağazası",
    description:
      "30 yılı aşkın tecrübemizle dağ bisikleti, yol bisikleti, şehir bisikleti ve aksesuar.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={0}>
              <OrganizationSchema />
              <WebSiteSchema />
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  urunler: "Urunler",
  kategoriler: "Kategoriler",
  markalar: "Markalar",
  siparisler: "Siparisler",
  musteriler: "Musteriler",
  kuponlar: "Kuponlar",
  bannerlar: "Bannerlar",
  sayfalar: "Sayfalar",
  barkod: "Barkod",
  raporlar: "Raporlar",
  ayarlar: "Ayarlar",
  yeni: "Yeni",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on dashboard
  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const label =
      segmentLabels[segment] || (isNaN(Number(segment)) ? segment : `#${segment}`);
    const isLast = i === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/admin"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

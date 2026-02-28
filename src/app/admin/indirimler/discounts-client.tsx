"use client";

import Link from "next/link";
import { Edit, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/empty-state";

interface DiscountProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  isActive: boolean;
  discountPercent: number;
  images: { url: string }[];
}

export function DiscountsClient({ products }: { products: DiscountProduct[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        {products.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="İndirimli ürün yok"
            description="Karşılaştırma fiyatı girilmiş ürün bulunmuyor."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Ürün</th>
                  <th className="text-left p-4 text-sm font-medium">İndirimli Fiyat</th>
                  <th className="text-left p-4 text-sm font-medium">Karşılaştırma Fiyatı</th>
                  <th className="text-left p-4 text-sm font-medium">İndirim %</th>
                  <th className="text-left p-4 text-sm font-medium">Durum</th>
                  <th className="text-left p-4 text-sm font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.images[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <span className="font-medium text-sm line-clamp-2">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-primary">
                      {p.price.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="p-4 text-sm text-muted-foreground line-through">
                      {p.comparePrice?.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="p-4">
                      {p.discountPercent > 0 ? (
                        <span className="text-sm font-bold text-destructive">%{p.discountPercent}</span>
                      ) : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {p.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/urunler/${p.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

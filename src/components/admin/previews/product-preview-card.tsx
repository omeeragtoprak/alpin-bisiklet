"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductPreviewCardProps {
  name?: string;
  price?: number;
  comparePrice?: number;
  images?: { url: string }[];
  category?: string;
  brand?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export function ProductPreviewCard({
  name,
  price,
  comparePrice,
  images,
  category,
  brand,
  isNew,
  isFeatured,
}: ProductPreviewCardProps) {
  const mainImage = images?.[0]?.url;
  const hasDiscount = comparePrice && comparePrice > (price || 0);
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - (price || 0)) / comparePrice) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Urun Karti Onizleme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-[280px] mx-auto">
          <div className="group relative overflow-hidden rounded-lg bg-muted" style={{ aspectRatio: "1/1" }}>
            {mainImage ? (
              <img
                src={mainImage}
                alt={name || "Urun"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Gorsel yok
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew && (
                <Badge className="bg-blue-500 text-white text-[10px]">Yeni</Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500 text-white text-[10px]">
                  %{discountPercent}
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
                aria-label="Favorilere ekle"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Add to cart */}
            <div className="absolute bottom-2 left-2 right-2">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
              >
                <ShoppingCart className="h-4 w-4" />
                Sepete Ekle
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-3 space-y-1">
            {(brand || category) && (
              <p className="text-xs text-muted-foreground">
                {brand}
                {brand && category && " / "}
                {category}
              </p>
            )}
            <h4 className="text-sm font-medium line-clamp-2">
              {name || "Urun adi"}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">
                {price
                  ? new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(price)
                  : "0 TL"}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

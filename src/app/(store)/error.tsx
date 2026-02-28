"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Store error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="p-5 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Bir sorun oluştu</h1>
          <p className="text-muted-foreground">
            Bu sayfa yüklenirken beklenmedik bir hata oluştu.
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">
            Hata kodu: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
          <Button variant="outline" asChild>
            <Link href="/urunler">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Ürünlere Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

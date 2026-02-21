import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id?: number;
  name: string;
  stock: number;
  lowStockAlert?: number;
  threshold?: number;
}

interface StockAlertProps {
  products: Product[];
}

export function StockAlert({ products }: StockAlertProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-base">Stok Uyarıları</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/urunler">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Stok uyarısı yok
          </p>
        ) : (
          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product.id || product.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Eşik: {product.lowStockAlert ?? product.threshold ?? 5}
                  </p>
                </div>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                  {product.stock} adet
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

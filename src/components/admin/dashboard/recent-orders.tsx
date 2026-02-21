import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/empty-state";

interface Order {
  id: string;
  customer: string;
  total: string;
  status: string;
  statusLabel?: string;
  statusColor?: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Son Siparişler</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/siparisler">
            Tümünü Gör
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState
            title="Henüz sipariş yok"
            description="Siparişler burada görünecek"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Sipariş No
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Müşteri
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Tutar
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <span className="font-medium text-sm">{order.id}</span>
                    </td>
                    <td className="py-3 px-2 text-sm">{order.customer}</td>
                    <td className="py-3 px-2 text-sm font-medium">
                      {order.total}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.statusColor || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.statusLabel || order.status}
                      </span>
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

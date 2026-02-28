import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Percent, CreditCard, Truck } from "lucide-react";
import { DeleteCouponButton } from "./delete-coupon-button";

const typeLabels: Record<string, { label: string; Icon: typeof Percent }> = {
  PERCENTAGE: { label: "Yüzde", Icon: Percent },
  FIXED: { label: "Sabit", Icon: CreditCard },
  FREE_SHIPPING: { label: "Kargo", Icon: Truck },
};

async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: { select: { category: { select: { name: true } } } },
      products: { select: { product: { select: { name: true } } } },
      _count: { select: { orders: true } },
    },
  });
}

export default async function CouponsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/giris");

  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      <PageHeader title="Kuponlar" description="İndirim kuponları yönetimi">
        <Button asChild>
          <Link href="/admin/kuponlar/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kupon
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-4">Henüz kupon eklenmedi</p>
              <Button asChild size="sm">
                <Link href="/admin/kuponlar/yeni">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Kuponu Oluştur
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium">Kupon</th>
                    <th className="text-left p-4 text-sm font-medium">Tür</th>
                    <th className="text-left p-4 text-sm font-medium">Değer</th>
                    <th className="text-left p-4 text-sm font-medium">Kullanım</th>
                    <th className="text-left p-4 text-sm font-medium">Geçerlilik</th>
                    <th className="text-left p-4 text-sm font-medium">Kapsam</th>
                    <th className="text-left p-4 text-sm font-medium">Durum</th>
                    <th className="text-left p-4 text-sm font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const now = new Date();
                    const isExpired = new Date(coupon.validTo) < now;
                    const info = typeLabels[coupon.type];
                    const scope =
                      coupon.categories.length > 0
                        ? `${coupon.categories.length} kategori`
                        : coupon.products.length > 0
                          ? `${coupon.products.length} ürün`
                          : "Tüm ürünler";

                    return (
                      <tr key={coupon.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <span className="font-mono font-bold">{coupon.code}</span>
                            {coupon.firstOrderOnly && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                İlk sipariş
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{info?.label || coupon.type}</td>
                        <td className="p-4 font-medium">
                          {coupon.type === "PERCENTAGE"
                            ? `%${coupon.value}`
                            : coupon.type === "FREE_SHIPPING"
                              ? "Ücretsiz"
                              : `${coupon.value.toLocaleString("tr-TR")} ₺`}
                        </td>
                        <td className="p-4 text-sm">
                          {coupon.usedCount}
                          {coupon.maxUses ? `/${coupon.maxUses}` : ""}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(coupon.validFrom).toLocaleDateString("tr-TR")} —{" "}
                          {new Date(coupon.validTo).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{scope}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpired
                                ? "bg-red-100 text-red-800"
                                : coupon.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isExpired ? "Süresi Dolmuş" : coupon.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="p-4 flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/kuponlar/${coupon.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteCouponButton id={coupon.id} code={coupon.code} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

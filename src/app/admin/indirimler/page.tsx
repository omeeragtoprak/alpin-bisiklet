import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { DiscountsClient } from "./discounts-client";

async function getDiscountedProducts() {
  const products = await prisma.product.findMany({
    where: {
      comparePrice: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      comparePrice: true,
      isActive: true,
      images: { take: 1, select: { url: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    discountPercent:
      p.comparePrice != null && p.comparePrice > p.price
        ? Math.round((1 - p.price / p.comparePrice) * 100)
        : 0,
  }));
}

export default async function DiscountsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/giris");

  const products = await getDiscountedProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="İndirimler"
        description="Toplu indirimler ve indirimli ürün yönetimi"
      />
      <DiscountsClient products={products} />
    </div>
  );
}

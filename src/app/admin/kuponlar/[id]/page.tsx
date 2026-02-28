import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import prisma from "@/lib/prisma";
import { CouponForm } from "@/components/admin/coupons/coupon-form";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/giris");

  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();

  const coupon = await prisma.coupon.findUnique({
    where: { id: numId },
    include: {
      categories: { include: { category: { select: { id: true, name: true } } } },
      products: { include: { product: { select: { id: true, name: true } } } },
    },
  });

  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Kupon Düzenle" description={coupon.code}>
        <Button variant="outline" asChild>
          <Link href="/admin/kuponlar">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Geri
          </Link>
        </Button>
      </PageHeader>
      <CouponForm
        initialData={{
          ...coupon,
          validFrom: coupon.validFrom.toISOString(),
          validTo: coupon.validTo.toISOString(),
        }}
      />
    </div>
  );
}

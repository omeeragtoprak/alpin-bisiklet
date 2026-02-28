import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupons/coupon-form";

export default async function NewCouponPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/giris");

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Kupon" description="İndirim kuponu oluşturun">
        <Button variant="outline" asChild>
          <Link href="/admin/kuponlar">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Geri
          </Link>
        </Button>
      </PageHeader>
      <CouponForm />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Box,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { RecentOrders } from "@/components/admin/dashboard/recent-orders";
import { StockAlert } from "@/components/admin/dashboard/stock-alert";
import {
  StatsSkeleton,
  CardSkeleton,
} from "@/components/admin/loading-skeleton";
import { EmptyState } from "@/components/admin/empty-state";

async function getDashboard() {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Dashboard verileri alinamadi");
  const json = await res.json();
  return json.data;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "bg-gray-100 text-gray-800" },
  CONFIRMED: { label: "Onaylandi", color: "bg-purple-100 text-purple-800" },
  PROCESSING: { label: "Hazirlaniyor", color: "bg-yellow-100 text-yellow-800" },
  SHIPPED: { label: "Kargoda", color: "bg-blue-100 text-blue-800" },
  DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Iptal", color: "bg-red-100 text-red-800" },
};

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    refetchInterval: 60000,
  });

  if (error) {
    return (
      <EmptyState
        title="Veriler yuklenemedi"
        description={(error as Error).message}
      />
    );
  }

  const stats = data
    ? [
        {
          name: "Aylik Gelir",
          value: `${Number(data.stats.totalRevenue).toLocaleString("tr-TR")} TL`,
          change: data.stats.revenueChange,
          trend: data.stats.revenueChange.startsWith("-")
            ? ("down" as const)
            : ("up" as const),
          icon: DollarSign,
          color: "text-green-600",
          bgColor: "bg-green-100",
          href: "/admin/raporlar",
        },
        {
          name: "Siparisler",
          value: String(data.stats.monthlyOrders),
          change: data.stats.orderChange,
          trend: data.stats.orderChange.startsWith("-")
            ? ("down" as const)
            : ("up" as const),
          icon: ShoppingCart,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          href: "/admin/siparisler",
        },
        {
          name: "Musteriler",
          value: String(data.stats.totalCustomers),
          change: `+${data.stats.monthlyCustomers} bu ay`,
          trend: "up" as const,
          icon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          href: "/admin/musteriler",
        },
        {
          name: "Urunler",
          value: `${data.stats.activeProducts}/${data.stats.totalProducts}`,
          change: `${data.stats.pendingOrders} bekleyen siparis`,
          trend: "up" as const,
          icon: Package,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          href: "/admin/urunler",
        },
      ]
    : [];

  const recentOrders = (data?.recentOrders || []).map(
    (o: { id: string; customer: string; total: string; status: string }) => ({
      ...o,
      statusLabel: statusLabels[o.status]?.label || o.status,
      statusColor:
        statusLabels[o.status]?.color || "bg-gray-100 text-gray-800",
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Grid */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={stat.href}>
                <StatsCard {...stat} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <RecentOrders orders={recentOrders} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <StockAlert products={data?.lowStockProducts || []} />
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Hizli Islemler
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link
                  href="/admin/urunler/yeni"
                  className="flex flex-col items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Yeni Urun</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link
                  href="/admin/siparisler"
                  className="flex flex-col items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs">Siparisler</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link
                  href="/admin/barkod"
                  className="flex flex-col items-center gap-2"
                >
                  <Box className="h-5 w-5" />
                  <span className="text-xs">Barkod Tara</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link
                  href="/admin/raporlar"
                  className="flex flex-col items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">Raporlar</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

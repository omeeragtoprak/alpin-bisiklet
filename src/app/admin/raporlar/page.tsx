"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { StatsSkeleton } from "@/components/admin/loading-skeleton";

interface DashboardData {
    stats: {
        totalRevenue: number;
        revenueChange: string;
        totalOrders: number;
        monthlyOrders: number;
        orderChange: string;
        totalCustomers: number;
        monthlyCustomers: number;
        totalProducts: number;
        activeProducts: number;
        pendingOrders: number;
    };
    recentOrders: Array<{
        id: string;
        customer: string;
        total: string;
        status: string;
        date: string;
    }>;
    lowStockProducts: Array<{
        id: number;
        name: string;
        stock: number;
        lowStockAlert: number;
    }>;
}

const statusLabels: Record<string, string> = {
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    PROCESSING: "Hazırlanıyor",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
};

export default function ReportsPage() {
    const { data, isLoading } = useQuery<{ data: DashboardData }>({
        queryKey: ["admin-reports"],
        queryFn: async () => {
            const res = await fetch("/api/admin/dashboard");
            return res.json();
        },
    });

    const stats = data?.data?.stats;
    const recentOrders = data?.data?.recentOrders || [];
    const lowStock = data?.data?.lowStockProducts || [];

    const cards = [
        {
            title: "Aylık Gelir",
            value: stats ? `${stats.totalRevenue.toLocaleString("tr-TR")} ₺` : "—",
            change: stats?.revenueChange || "",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Aylık Sipariş",
            value: stats?.monthlyOrders?.toString() || "—",
            change: stats?.orderChange || "",
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Toplam Müşteri",
            value: stats?.totalCustomers?.toString() || "—",
            change: stats ? `Bu ay +${stats.monthlyCustomers}` : "",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            title: "Aktif Ürün",
            value: stats ? `${stats.activeProducts}/${stats.totalProducts}` : "—",
            change: stats ? `${stats.pendingOrders} bekleyen sipariş` : "",
            icon: Package,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Raporlar" description="İş istatistikleri ve analizler" />

            {isLoading ? (
                <StatsSkeleton />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cards.map((card, i) => (
                            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2 rounded-lg ${card.bg}`}>
                                                <card.icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
                                            </div>
                                            {card.change && (
                                                <span className={`flex items-center gap-1 text-xs font-medium ${card.change.startsWith("+") ? "text-green-600" :
                                                        card.change.startsWith("-") ? "text-red-600" : "text-muted-foreground"
                                                    }`}>
                                                    {card.change.startsWith("+") ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> :
                                                        card.change.startsWith("-") ? <TrendingDown className="h-3 w-3" aria-hidden="true" /> : null}
                                                    {card.change}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-2xl font-bold">{card.value}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                                    Son Siparişler
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentOrders.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Henüz sipariş yok</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                <div>
                                                    <p className="text-sm font-medium">{order.customer}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{order.total}</p>
                                                    <p className="text-xs text-muted-foreground">{statusLabels[order.status] || order.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Low Stock */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />
                                    Düşük Stok Uyarıları
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {lowStock.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Stok uyarısı yok ✓</p>
                                ) : (
                                    <div className="space-y-3">
                                        {lowStock.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {product.stock === 0 ? "Tükendi" : `${product.stock} adet`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

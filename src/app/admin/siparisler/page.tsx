"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
    ShoppingCart,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { toast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: "Onaylandı", color: "bg-blue-100 text-blue-800" },
    PROCESSING: { label: "Hazırlanıyor", color: "bg-purple-100 text-purple-800" },
    SHIPPED: { label: "Kargoda", color: "bg-indigo-100 text-indigo-800" },
    DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "İptal", color: "bg-red-100 text-red-800" },
    REFUNDED: { label: "İade", color: "bg-orange-100 text-orange-800" },
};

const statusOptions = Object.entries(statusLabels).map(([value, { label }]) => ({ value, label }));

interface Order {
    id: number;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    user?: { name: string; email: string };
    items?: Array<{ productName: string; quantity: number; total: number }>;
    payment?: { status: string };
}

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-orders", page, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: "10" });
            if (search) params.set("search", search);
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`/api/admin/orders?${params}`);
            return res.json();
        },
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast({ title: "Siparis durumu guncellendi" });
        },
        onError: () => {
            toast({ title: "Durum guncellenirken hata olustu", variant: "destructive" });
        },
    });

    const orders: Order[] = data?.data || [];
    const meta = data?.meta || { total: 0, page: 1, totalPages: 0 };

    return (
        <div className="space-y-6">
            <PageHeader title="Siparisler" description="Siparis yonetimi ve takibi" />

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Sipariş no veya müşteri ara..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10"
                        aria-label="Sipariş ara"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value === "ALL" ? "" : value); setPage(1); }}>
                    <SelectTrigger className="w-[180px]" aria-label="Durum filtresi">
                        <SelectValue placeholder="Tum Durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tum Durumlar</SelectItem>
                        {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Order Detail Sheet */}
            <Sheet open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
                <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Siparis #{selectedOrder?.orderNumber}</SheetTitle>
                        <SheetDescription>Siparis detaylari ve durum guncelleme</SheetDescription>
                    </SheetHeader>
                    {selectedOrder && (
                        <div className="space-y-6 p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Musteri</span>
                                    <p className="font-medium">{selectedOrder.user?.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Toplam</span>
                                    <p className="font-medium">{selectedOrder.total?.toLocaleString("tr-TR")} TL</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tarih</span>
                                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString("tr-TR")}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Durum Guncelle</span>
                                    <Select value={selectedOrder.status} onValueChange={(value) => updateStatus.mutate({ id: selectedOrder.id, status: value })}>
                                        <SelectTrigger className="w-full mt-1" aria-label="Siparis durumunu guncelle">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Urunler</h3>
                                    <div className="space-y-1">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                                                <span>{item.productName} x {item.quantity}</span>
                                                <span className="font-medium">{item.total?.toLocaleString("tr-TR")} TL</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : orders.length === 0 ? (
                        <EmptyState icon={ShoppingCart} title="Henuz siparis yok" description="Siparisler burada listelenecek" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 text-sm font-medium">Sipariş No</th>
                                        <th className="text-left p-4 text-sm font-medium">Müşteri</th>
                                        <th className="text-left p-4 text-sm font-medium">Toplam</th>
                                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                                        <th className="text-left p-4 text-sm font-medium">Tarih</th>
                                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-sm">{order.user?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{order.total?.toLocaleString("tr-TR")} ₺</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[order.status]?.color || "bg-muted"}`}>
                                                    {statusLabels[order.status]?.label || order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="p-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                    aria-label={`Sipariş ${order.orderNumber} detayını görüntüle`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Toplam {meta.total} sipariş
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            aria-label="Önceki sayfa"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center text-sm px-3">
                            {page}/{meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= meta.totalPages}
                            onClick={() => setPage(page + 1)}
                            aria-label="Sonraki sayfa"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

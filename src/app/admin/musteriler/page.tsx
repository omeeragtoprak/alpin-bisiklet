"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Users, Search, Mail, Phone, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    _count: { orders: number };
}

export default function CustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: "10" });
            if (search) params.set("search", search);
            const res = await fetch(`/api/admin/users?${params}`);
            return res.json();
        },
    });

    const users: UserItem[] = data?.data || [];
    const meta = data?.meta || { total: 0, page: 1, totalPages: 0 };

    return (
        <div className="space-y-6">
            <PageHeader title="Musteriler" description="Musteri listesi ve yonetimi" />

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                    placeholder="İsim, email veya telefon ara..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-10"
                    aria-label="Müşteri ara"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : users.length === 0 ? (
                        <EmptyState icon={Users} title="Henuz musteri yok" description="Musteriler burada listelenecek" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 text-sm font-medium">Müşteri</th>
                                        <th className="text-left p-4 text-sm font-medium">İletişim</th>
                                        <th className="text-left p-4 text-sm font-medium">Rol</th>
                                        <th className="text-left p-4 text-sm font-medium">Sipariş</th>
                                        <th className="text-left p-4 text-sm font-medium">Kayıt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, i) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                            {user.name?.charAt(0).toUpperCase() || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name || "İsimsiz"}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {user.emailVerified ? "✓ Doğrulanmış" : "Doğrulanmamış"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3" aria-hidden="true" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Phone className="h-3 w-3" aria-hidden="true" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                                    }`}>
                                                    {user.role === "ADMIN" ? "Admin" : "Müşteri"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <ShoppingCart className="h-3 w-3" aria-hidden="true" />
                                                    {user._count.orders}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Toplam {meta.total} müşteri</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Önceki sayfa">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center text-sm px-3">{page}/{meta.totalPages}</span>
                        <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} aria-label="Sonraki sayfa">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

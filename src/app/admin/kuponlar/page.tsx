"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Ticket, Plus, Trash2, Edit, Percent, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";

const typeLabels: Record<string, { label: string; icon: typeof Percent }> = {
    PERCENTAGE: { label: "Yüzde İndirim", icon: Percent },
    FIXED: { label: "Sabit Tutar", icon: CreditCard },
    FREE_SHIPPING: { label: "Ücretsiz Kargo", icon: Truck },
};

interface Coupon {
    id: number;
    code: string;
    type: string;
    value: number;
    minPurchase: number | null;
    maxDiscount: number | null;
    maxUses: number | null;
    usedCount: number;
    validFrom: string;
    validTo: string;
    isActive: boolean;
}

export default function CouponsPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState({
        code: "",
        type: "PERCENTAGE" as string,
        value: 0,
        minPurchase: "",
        maxDiscount: "",
        maxUses: "",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
    });
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-coupons"],
        queryFn: async () => {
            const res = await fetch("/api/coupons");
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const url = editingId ? `/api/coupons/${editingId}` : "/api/coupons";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
            toast({ title: editingId ? "Kupon guncellendi" : "Kupon olusturuldu" });
            setShowForm(false);
            setEditingId(null);
            resetForm();
        },
        onError: () => {
            toast({ title: "Kupon kaydedilirken hata olustu", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`/api/coupons/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
            toast({ title: "Kupon silindi" });
            setDeleteId(null);
        },
        onError: () => {
            toast({ title: "Kupon silinirken hata olustu", variant: "destructive" });
            setDeleteId(null);
        },
    });

    function resetForm() {
        setForm({
            code: "", type: "PERCENTAGE", value: 0, minPurchase: "", maxDiscount: "",
            maxUses: "", validFrom: new Date().toISOString().split("T")[0],
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            isActive: true,
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        createMutation.mutate({
            code: form.code.toUpperCase(),
            type: form.type,
            value: Number(form.value),
            minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
            maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
            maxUses: form.maxUses ? Number(form.maxUses) : null,
            validFrom: new Date(form.validFrom),
            validTo: new Date(form.validTo),
            isActive: form.isActive,
        });
    }

    const coupons: Coupon[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader title="Kuponlar" description="Indirim kuponlari yonetimi">
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}>
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Yeni Kupon
                </Button>
            </PageHeader>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingId ? "Kupon Düzenle" : "Yeni Kupon"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="coupon-code">Kupon Kodu</Label>
                                    <Input id="coupon-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="YILBASI25" required />
                                </div>
                                <div>
                                    <Label htmlFor="coupon-type">Tur</Label>
                                    <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                                        <SelectTrigger className="w-full" id="coupon-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Yuzde Indirim</SelectItem>
                                            <SelectItem value="FIXED">Sabit Tutar</SelectItem>
                                            <SelectItem value="FREE_SHIPPING">Ucretsiz Kargo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="coupon-value">Değer {form.type === "PERCENTAGE" ? "(%)" : "(₺)"}</Label>
                                    <Input id="coupon-value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <Label htmlFor="coupon-min">Min. Sepet Tutarı (₺)</Label>
                                    <Input id="coupon-min" type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="coupon-from">Başlangıç</Label>
                                    <Input id="coupon-from" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="coupon-to">Bitiş</Label>
                                    <Input id="coupon-to" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} required />
                                </div>
                                <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                                    <Button type="submit" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>İptal</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : coupons.length === 0 ? (
                        <EmptyState icon={Ticket} title="Henuz kupon yok" description="Indirim kuponlari burada listelenecek" actionLabel="Yeni Kupon" onAction={() => { setShowForm(true); resetForm(); }} />
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
                                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon, i) => {
                                        const isExpired = new Date(coupon.validTo) < new Date();
                                        return (
                                            <motion.tr key={coupon.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-mono font-bold">{coupon.code}</td>
                                                <td className="p-4 text-sm">{typeLabels[coupon.type]?.label || coupon.type}</td>
                                                <td className="p-4 font-medium">{coupon.type === "PERCENTAGE" ? `%${coupon.value}` : coupon.type === "FREE_SHIPPING" ? "Ücretsiz" : `${coupon.value} ₺`}</td>
                                                <td className="p-4 text-sm">{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}</td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {new Date(coupon.validFrom).toLocaleDateString("tr-TR")} - {new Date(coupon.validTo).toLocaleDateString("tr-TR")}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpired ? "bg-red-100 text-red-800" : coupon.isActive ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                                                        }`}>
                                                        {isExpired ? "Süresi Dolmuş" : coupon.isActive ? "Aktif" : "Pasif"}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setEditingId(coupon.id);
                                                        setForm({
                                                            code: coupon.code, type: coupon.type, value: coupon.value,
                                                            minPurchase: coupon.minPurchase?.toString() || "",
                                                            maxDiscount: coupon.maxDiscount?.toString() || "",
                                                            maxUses: coupon.maxUses?.toString() || "",
                                                            validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
                                                            validTo: new Date(coupon.validTo).toISOString().split("T")[0],
                                                            isActive: coupon.isActive,
                                                        });
                                                        setShowForm(true);
                                                    }} aria-label={`${coupon.code} kuponunu düzenle`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(coupon.id)} aria-label={`${coupon.code} kuponunu sil`}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title="Kuponu sil"
                description="Bu kuponu silmek istediginize emin misiniz? Bu islem geri alinamaz."
                loading={deleteMutation.isPending}
                onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
            />
        </div>
    );
}

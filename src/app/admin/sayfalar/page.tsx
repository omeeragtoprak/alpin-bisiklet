"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { FileText, Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";

interface PageItem {
    id: number;
    title: string;
    slug: string;
    isPublished: boolean;
    updatedAt: string;
}

export default function PagesPage() {
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-pages"],
        queryFn: async () => {
            const res = await fetch("/api/pages");
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Silinemedi");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
            toast({ title: "Sayfa silindi" });
            setDeleteTarget(null);
        },
        onError: () => {
            toast({ title: "Sayfa silinirken hata oluştu", variant: "destructive" });
            setDeleteTarget(null);
        },
    });

    const pages: PageItem[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader title="Sayfalar" description="CMS sayfa yönetimi">
                <Button asChild>
                    <Link href="/admin/sayfalar/yeni">
                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Yeni Sayfa
                    </Link>
                </Button>
            </PageHeader>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : pages.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="Henüz sayfa yok"
                            description="CMS sayfaları burada listelenecek"
                            actionLabel="Yeni Sayfa"
                            onAction={() => {}}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 text-sm font-medium">Sayfa</th>
                                        <th className="text-left p-4 text-sm font-medium">Slug</th>
                                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                                        <th className="text-left p-4 text-sm font-medium">Güncelleme</th>
                                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map((page, i) => (
                                        <motion.tr
                                            key={page.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4 font-medium">{page.title}</td>
                                            <td className="p-4 text-sm text-muted-foreground font-mono">/{page.slug}</td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 text-xs font-medium ${page.isPublished ? "text-green-600" : "text-muted-foreground"}`}>
                                                    {page.isPublished
                                                        ? <Eye className="h-3 w-3" aria-hidden="true" />
                                                        : <EyeOff className="h-3 w-3" aria-hidden="true" />}
                                                    {page.isPublished ? "Yayında" : "Taslak"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(page.updatedAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="p-4 flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    aria-label={`${page.title} sayfasını düzenle`}
                                                >
                                                    <Link href={`/admin/sayfalar/${page.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => setDeleteTarget({ id: page.id, title: page.title })}
                                                    aria-label={`${page.title} sayfasını sil`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Sayfayı Sil"
                description={`"${deleteTarget?.title}" sayfasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                loading={deleteMutation.isPending}
                onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
            />
        </div>
    );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Trash2, Edit, Eye, EyeOff, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";

interface BlogItem {
    id: number;
    title: string;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function AdminBlogPage() {
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-blog"],
        queryFn: async () => {
            const res = await fetch("/api/blog?admin=1&limit=100");
            if (!res.ok) throw new Error("Blog yazıları yüklenemedi");
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Blog yazısı silinemedi");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
            toast({ title: "Blog yazısı silindi" });
            setDeleteTarget(null);
        },
        onError: () => {
            toast({ title: "Blog yazısı silinirken hata oluştu", variant: "destructive" });
            setDeleteTarget(null);
        },
    });

    const blogs: BlogItem[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader title="Blog" description="Blog yazılarını yönetin">
                <Button asChild>
                    <Link href="/admin/blog/yeni">
                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Yeni Yazı
                    </Link>
                </Button>
            </PageHeader>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : blogs.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="Henüz blog yazısı yok"
                            description="Blog yazıları burada listelenecek"
                            actionLabel="Yeni Yazı"
                            onAction={() => {}}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 text-sm font-medium">Başlık</th>
                                        <th className="text-left p-4 text-sm font-medium">Slug</th>
                                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                                        <th className="text-left p-4 text-sm font-medium">Tarih</th>
                                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blogs.map((blog, i) => (
                                        <motion.tr
                                            key={blog.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4 font-medium">{blog.title}</td>
                                            <td className="p-4 text-sm text-muted-foreground font-mono">/blog/{blog.slug}</td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 text-xs font-medium ${blog.isPublished ? "text-green-600" : "text-muted-foreground"}`}>
                                                    {blog.isPublished
                                                        ? <Eye className="h-3 w-3" aria-hidden="true" />
                                                        : <EyeOff className="h-3 w-3" aria-hidden="true" />}
                                                    {blog.isPublished ? "Yayında" : "Taslak"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(blog.updatedAt).toLocaleDateString("tr-TR")}
                                            </td>
                                            <td className="p-4 flex gap-1">
                                                <Button variant="ghost" size="sm" asChild aria-label={`${blog.title} yazısını düzenle`}>
                                                    <Link href={`/admin/blog/${blog.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => setDeleteTarget({ id: blog.id, title: blog.title })}
                                                    aria-label={`${blog.title} yazısını sil`}
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
                title="Blog Yazısını Sil"
                description={`"${deleteTarget?.title}" yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                loading={deleteMutation.isPending}
                onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
            />
        </div>
    );
}

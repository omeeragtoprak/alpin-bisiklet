"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { FileText, Plus, Trash2, Edit, Eye, EyeOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PagePreview } from "@/components/admin/previews/page-preview";
import { toast } from "@/hooks/use-toast";

interface PageItem {
    id: number;
    title: string;
    slug: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function PagesPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isPublished: false });
    const slugManualRef = useRef(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!slugManualRef.current && form.title) {
            const slug = form.title.toLowerCase()
                .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
                .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
                .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-pages"],
        queryFn: async () => {
            const res = await fetch("/api/pages");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const url = editingId ? `/api/pages/${editingId}` : "/api/pages";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
            toast({ title: editingId ? "Sayfa güncellendi" : "Sayfa oluşturuldu" });
            setShowForm(false);
            setEditingId(null);
            setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isPublished: false });
        },
        onError: () => {
            toast({ title: "Sayfa kaydedilirken hata oluştu", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`/api/pages/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
            toast({ title: "Sayfa silindi" });
            setDeleteId(null);
        },
        onError: () => {
            toast({ title: "Sayfa silinirken hata oluştu", variant: "destructive" });
            setDeleteId(null);
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        saveMutation.mutate({
            title: form.title,
            slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
            content: form.content,
            metaTitle: form.metaTitle || null,
            metaDescription: form.metaDescription || null,
            isPublished: form.isPublished,
        });
    }

    const pages: PageItem[] = data?.data || [];

    return (
        <div className="space-y-6">
            <PageHeader title="Sayfalar" description="CMS sayfa yönetimi">
                <Button onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    slugManualRef.current = false;
                    setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", isPublished: false });
                }}>
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Yeni Sayfa
                </Button>
            </PageHeader>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? "Sayfa Düzenle" : "Yeni Sayfa"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="page-title">Başlık</Label>
                                            <Input id="page-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hakkımızda" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="page-slug">Slug</Label>
                                            <Input id="page-slug" value={form.slug} onChange={(e) => { slugManualRef.current = true; setForm({ ...form, slug: e.target.value }); }} placeholder="hakkimizda" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="page-content">İçerik</Label>
                                        <Textarea
                                            id="page-content"
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            className="min-h-[200px]"
                                            placeholder="Sayfa içeriğini yazın..."
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="page-meta-title">Meta Başlık (SEO)</Label>
                                            <Input id="page-meta-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label htmlFor="page-meta-desc">Meta Açıklama (SEO)</Label>
                                            <Input id="page-meta-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch id="page-published" checked={form.isPublished} onCheckedChange={(checked) => setForm({ ...form, isPublished: checked })} />
                                        <Label htmlFor="page-published">Yayında</Label>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={saveMutation.isPending}>
                                            {saveMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>İptal</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <PagePreview title={form.title} content={form.content} />
                    </div>
                </motion.div>
            )}

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <TableSkeleton rows={5} />
                    ) : pages.length === 0 ? (
                        <EmptyState icon={FileText} title="Henüz sayfa yok" description="CMS sayfaları burada listelenecek" actionLabel="Yeni Sayfa" onAction={() => { setShowForm(true); }} />
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
                                        <motion.tr key={page.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{page.title}</td>
                                            <td className="p-4 text-sm text-muted-foreground font-mono">/{page.slug}</td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 text-xs font-medium ${page.isPublished ? "text-green-600" : "text-muted-foreground"}`}>
                                                    {page.isPublished ? <Eye className="h-3 w-3" aria-hidden="true" /> : <EyeOff className="h-3 w-3" aria-hidden="true" />}
                                                    {page.isPublished ? "Yayında" : "Taslak"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{new Date(page.updatedAt).toLocaleDateString("tr-TR")}</td>
                                            <td className="p-4 flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setEditingId(page.id);
                                                    slugManualRef.current = true;
                                                    setForm({
                                                        title: page.title, slug: page.slug, content: page.content,
                                                        metaTitle: page.metaTitle || "", metaDescription: page.metaDescription || "",
                                                        isPublished: page.isPublished,
                                                    });
                                                    setShowForm(true);
                                                }} aria-label={`${page.title} sayfasını düzenle`}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(page.id)} aria-label={`${page.title} sayfasini sil`}>
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
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title="Sayfayı Sil"
                description="Bu sayfayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                loading={deleteMutation.isPending}
                onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
            />
        </div>
    );
}

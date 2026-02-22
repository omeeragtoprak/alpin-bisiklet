"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { toast } from "@/hooks/use-toast";

interface PageFormProps {
    initialData?: {
        id: number;
        title: string;
        slug: string;
        content: string;
        metaTitle: string | null;
        metaDescription: string | null;
        isPublished: boolean;
    };
}

export function PageForm({ initialData }: PageFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isEditing = !!initialData;
    const slugManualRef = useRef(false);

    const [form, setForm] = useState({
        title: initialData?.title ?? "",
        slug: initialData?.slug ?? "",
        content: initialData?.content ?? "",
        metaTitle: initialData?.metaTitle ?? "",
        metaDescription: initialData?.metaDescription ?? "",
        isPublished: initialData?.isPublished ?? false,
    });

    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

    // Auto-slug: yalnızca yeni sayfa oluştururken
    useEffect(() => {
        if (isEditing) {
            slugManualRef.current = true;
            return;
        }
        if (!slugManualRef.current && form.title) {
            const slug = form.title.toLowerCase()
                .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
                .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
                .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            setForm(prev => ({ ...prev, slug }));
        }
    }, [form.title, isEditing]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const url = isEditing ? `/api/pages/${initialData.id}` : "/api/pages";
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    slug: form.slug || undefined,
                    content: form.content,
                    metaTitle: form.metaTitle || null,
                    metaDescription: form.metaDescription || null,
                    isPublished: form.isPublished,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Hata");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
            toast({ title: isEditing ? "Sayfa güncellendi" : "Sayfa oluşturuldu" });
            router.push("/admin/sayfalar");
        },
        onError: (err: Error) => {
            toast({ title: err.message || "Sayfa kaydedilemedi", variant: "destructive" });
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        saveMutation.mutate();
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Sol: Form */}
                <div className="space-y-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sayfa Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="page-title">Başlık *</Label>
                                    <Input
                                        id="page-title"
                                        value={form.title}
                                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Hakkımızda"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="page-slug">Slug</Label>
                                    <Input
                                        id="page-slug"
                                        value={form.slug}
                                        onChange={(e) => {
                                            slugManualRef.current = true;
                                            setForm(prev => ({ ...prev, slug: e.target.value }));
                                        }}
                                        placeholder="hakkimizda"
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>İçerik *</Label>
                                <RichTextEditor
                                    value={form.content}
                                    onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                                    placeholder="Sayfa içeriğini yazın..."
                                    minHeight="260px"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">SEO</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="page-meta-title">Meta Başlık</Label>
                                    <Input
                                        id="page-meta-title"
                                        value={form.metaTitle}
                                        onChange={(e) => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                                        placeholder="Arama motorları için başlık"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="page-meta-desc">Meta Açıklama</Label>
                                    <Input
                                        id="page-meta-desc"
                                        value={form.metaDescription}
                                        onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                                        placeholder="Arama motorları için açıklama"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="page-published"
                                checked={form.isPublished}
                                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublished: checked }))}
                            />
                            <Label htmlFor="page-published">Yayında</Label>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/sayfalar")}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sağ: Önizleme */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm">Sayfa Önizleme</CardTitle>
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant={previewMode === "desktop" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setPreviewMode("desktop")}
                                    aria-label="Masaüstü"
                                >
                                    <Monitor className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant={previewMode === "mobile" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setPreviewMode("mobile")}
                                    aria-label="Mobil"
                                >
                                    <Smartphone className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`mx-auto rounded-lg border bg-white dark:bg-white p-6 overflow-auto transition-all duration-300 ${
                                    previewMode === "mobile" ? "max-w-[375px]" : "w-full"
                                }`}
                                style={{ minHeight: 240, maxHeight: 520 }}
                            >
                                {form.title && (
                                    <h1 className={`font-bold text-gray-900 mb-4 ${previewMode === "mobile" ? "text-xl" : "text-3xl"}`}>
                                        {form.title}
                                    </h1>
                                )}
                                {form.content ? (
                                    <div
                                        className="prose prose-neutral max-w-none"
                                        dangerouslySetInnerHTML={{ __html: form.content }}
                                    />
                                ) : (
                                    <p className="text-gray-400 text-sm italic">İçerik yazın...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}

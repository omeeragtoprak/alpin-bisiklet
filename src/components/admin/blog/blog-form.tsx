"use client";

import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const blogFormSchema = z.object({
    title: z.string().min(1, "Başlık gerekli"),
    slug: z.string().optional(),
    content: z.string().min(1, "İçerik gerekli"),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    isPublished: z.boolean(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
    initialData?: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt?: string | null;
        coverImage?: string | null;
        metaTitle?: string | null;
        metaDescription?: string | null;
        isPublished: boolean;
    };
}

export function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const slugManualRef = useRef(false);
    const isEditing = !!initialData;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BlogFormValues>({
        resolver: zodResolver(blogFormSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                slug: initialData.slug,
                content: initialData.content,
                excerpt: initialData.excerpt || "",
                coverImage: initialData.coverImage || "",
                metaTitle: initialData.metaTitle || "",
                metaDescription: initialData.metaDescription || "",
                isPublished: initialData.isPublished,
            }
            : { isPublished: false },
    });

    const titleValue = watch("title");

    useEffect(() => {
        if (isEditing) {
            slugManualRef.current = true;
        }
    }, [isEditing]);

    useEffect(() => {
        if (!slugManualRef.current && titleValue) {
            const slug = titleValue.toLowerCase()
                .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
                .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
                .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            setValue("slug", slug);
        }
    }, [titleValue, setValue]);

    const coverImageValue = watch("coverImage");
    const isPublishedValue = watch("isPublished");

    const saveMutation = useMutation({
        mutationFn: async (data: BlogFormValues) => {
            const url = isEditing ? `/api/blog/${initialData.id}` : "/api/blog";
            const method = isEditing ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Hata");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
            toast({ title: isEditing ? "Blog yazısı güncellendi" : "Blog yazısı oluşturuldu" });
            router.push("/admin/blog");
        },
        onError: (err: Error) => {
            toast({ title: err.message || "Blog yazısı kaydedilemedi", variant: "destructive" });
        },
    });

    function onSubmit(data: BlogFormValues) {
        saveMutation.mutate(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ana içerik */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Yazı Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="blog-title">Başlık *</Label>
                                <Input
                                    id="blog-title"
                                    {...register("title")}
                                    placeholder="Blog yazısı başlığı"
                                />
                                {errors.title && (
                                    <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="blog-slug">Slug</Label>
                                <Input
                                    id="blog-slug"
                                    {...register("slug", {
                                        onChange: () => { slugManualRef.current = true; },
                                    })}
                                    placeholder="blog-yazisi-slug"
                                    className="font-mono text-sm"
                                />
                                {errors.slug && (
                                    <p className="text-destructive text-sm mt-1">{errors.slug.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="blog-excerpt">Özet</Label>
                                <Textarea
                                    id="blog-excerpt"
                                    {...register("excerpt")}
                                    placeholder="Kısa bir özet yazın..."
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="blog-content">İçerik *</Label>
                                <Textarea
                                    id="blog-content"
                                    {...register("content")}
                                    placeholder="Blog yazısının içeriği..."
                                    className="min-h-[300px]"
                                />
                                {errors.content && (
                                    <p className="text-destructive text-sm mt-1">{errors.content.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="blog-meta-title">Meta Başlık</Label>
                                <Input
                                    id="blog-meta-title"
                                    {...register("metaTitle")}
                                    placeholder="Arama motorları için başlık"
                                />
                            </div>
                            <div>
                                <Label htmlFor="blog-meta-desc">Meta Açıklama</Label>
                                <Textarea
                                    id="blog-meta-desc"
                                    {...register("metaDescription")}
                                    placeholder="Arama motorları için açıklama"
                                    className="min-h-[80px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Yayın</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="blog-published"
                                    checked={isPublishedValue}
                                    onCheckedChange={(checked) => setValue("isPublished", checked)}
                                />
                                <Label htmlFor="blog-published">Yayında</Label>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin/blog")}
                                >
                                    İptal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kapak Görseli</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUpload
                                value={coverImageValue ? [coverImageValue] : []}
                                onChange={(urls) => setValue("coverImage", urls[0] || "")}
                                onRemove={() => setValue("coverImage", "")}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}

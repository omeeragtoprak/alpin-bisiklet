"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { createCategorySchema, CreateCategoryInput } from "@/lib/validations";

function toSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

interface CategoryFormProps {
    initialData?: any;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    // Kullanıcı slug'ı manuel düzenlediyse otomatik güncellemeyi durdur
    const slugManualRef = useRef(!!initialData?.slug);

    const form = useForm({
        resolver: zodResolver(createCategorySchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                slug: initialData.slug,
                description: initialData.description || "",
                image: initialData.image || "",
                parentId: initialData.parentId || null,
                isActive: initialData.isActive,
            }
            : {
                name: "",
                slug: "",
                description: "",
                image: "",
                parentId: null,
                isActive: true,
            },
    });

    // İsimden otomatik slug üret
    const nameValue = form.watch("name");
    useEffect(() => {
        if (!slugManualRef.current && nameValue) {
            form.setValue("slug", toSlug(nameValue), { shouldValidate: false });
        }
    }, [nameValue, form]);

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            return res.json();
        },
    });

    const onSubmit = async (data: CreateCategoryInput) => {
        try {
            setLoading(true);
            // Boş slug gönderme, API isimden oluştursun
            const payload = {
                ...data,
                slug: data.slug?.trim() || undefined,
            };
            if (initialData) {
                const res = await fetch(`/api/categories/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Güncelleme başarısız");
            } else {
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Oluşturma başarısız");
            }
            toast({ title: initialData ? "Kategori güncellendi" : "Kategori oluşturuldu" });
            router.push("/admin/kategoriler");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({ title: "Bir hata oluştu", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Yalnızca kök kategoriler (parentId yok) üst kategori olabilir
    // Bu, 2 seviyeli hiyerarşi sağlar: Bisikletler > Dağ Bisikleti
    const availableParents = categories?.data?.filter(
        (c: any) => c.id !== initialData?.id && !c.parentId
    ) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Genel Bilgiler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori Adı</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Dağ Bisikletleri" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug (Bağlantı)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="otomatik-olusturulur"
                                                    {...field}
                                                    onChange={(e) => {
                                                        slugManualRef.current = true;
                                                        field.onChange(e);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                İsme göre otomatik oluşturulur, istersen düzenleyebilirsin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Açıklama</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Kategori açıklaması..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Görsel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori Görseli</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    onChange={(url) => field.onChange(url[0])}
                                                    onRemove={() => field.onChange("")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ayarlar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Üst Kategori</FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(value === "null" ? null : Number(value))
                                                }
                                                value={field.value ? field.value.toString() : "null"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Üst kategori seçin (Opsiyonel)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="null">Yok (Ana Kategori)</SelectItem>
                                                    {availableParents.map((category: any) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id.toString()}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Yalnızca ana kategoriler seçilebilir.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Aktif Durum</FormLabel>
                                                <FormDescription>
                                                    Kategori sitede görünsün mü?
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Güncelle" : "Oluştur"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

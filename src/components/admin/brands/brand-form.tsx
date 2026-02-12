"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { createBrandSchema, CreateBrandInput } from "@/lib/validations";

interface BrandFormProps {
    initialData?: any;
}

export function BrandForm({ initialData }: BrandFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(createBrandSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                slug: initialData.slug,
                description: initialData.description || "",
                logo: initialData.logo || "",
                isActive: initialData.isActive,
            }
            : {
                name: "",
                slug: "",
                description: "",
                logo: "",
                isActive: true,
            },
    });

    const onSubmit = async (data: CreateBrandInput) => {
        try {
            setLoading(true);
            if (initialData) {
                // Update
                const res = await fetch(`/api/brands/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error("Güncelleme başarısız");
            } else {
                // Create
                const res = await fetch("/api/brands", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error("Oluşturma başarısız");
            }
            toast({ title: initialData ? "Marka guncellendi" : "Marka olusturuldu" });
            router.push("/admin/markalar");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({ title: "Bir hata olustu", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

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
                                            <FormLabel>Marka Adı</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Shimano" {...field} />
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
                                                <Input placeholder="Otomatik oluşturulur" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Boş bırakırsanız isme göre otomatik oluşturulur.
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
                                                    placeholder="Marka açıklaması..."
                                                    {...field}
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
                                <CardTitle>Logo & Durum</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="logo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marka Logosu</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Aktif Durum</FormLabel>
                                                <FormDescription>
                                                    Marka sitede görünsün mü?
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

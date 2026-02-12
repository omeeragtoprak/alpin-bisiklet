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
import { createBannerSchema } from "@/lib/validations";
import { BannerPreview } from "@/components/admin/previews/banner-preview";

interface BannerFormProps {
    initialData?: any;
}

export function BannerForm({ initialData }: BannerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(createBannerSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                subtitle: initialData.subtitle || "",
                image: initialData.image,
                mobileImage: initialData.mobileImage || "",
                link: initialData.link || "",
                buttonText: initialData.buttonText || "",
                position: initialData.position,
                order: initialData.order,
                isActive: initialData.isActive,
                startDate: initialData.startDate
                    ? new Date(initialData.startDate).toISOString().split("T")[0]
                    : "",
                endDate: initialData.endDate
                    ? new Date(initialData.endDate).toISOString().split("T")[0]
                    : "",
            }
            : {
                title: "",
                subtitle: "",
                image: "",
                mobileImage: "",
                link: "",
                buttonText: "",
                position: "HERO",
                order: 0,
                isActive: true,
                startDate: "",
                endDate: "",
            },
    });

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            // Clean up empty dates
            const formattedData = {
                ...data,
                startDate: data.startDate === "" ? null : data.startDate,
                endDate: data.endDate === "" ? null : data.endDate,
            };

            if (initialData) {
                // Update
                const res = await fetch(`/api/banners/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formattedData),
                });
                if (!res.ok) throw new Error("Güncelleme başarısız");
            } else {
                // Create
                const res = await fetch("/api/banners", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formattedData),
                });
                if (!res.ok) throw new Error("Oluşturma başarısız");
            }
            toast({ title: initialData ? "Banner guncellendi" : "Banner olusturuldu" });
            router.push("/admin/bannerlar");
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
                                <CardTitle>Temel Bilgiler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Başlık</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Yaz İndirimi" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alt Başlık</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: %50'ye varan..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Yönlendirme Linki</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="/koleksiyon/yaz" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="buttonText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Buton Yazısı</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Alışverişe Başla" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pozisyon</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seçiniz" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="HERO">Ana Slider</SelectItem>
                                                        <SelectItem value="SIDEBAR">Yan Bar</SelectItem>
                                                        <SelectItem value="CATEGORY">Kategori</SelectItem>
                                                        <SelectItem value="PRODUCT">Ürün</SelectItem>
                                                        <SelectItem value="POPUP">Popup</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="order"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sıralama</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Yayın Ayarları</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Başlangıç Tarihi</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bitiş Tarihi</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Aktif Durum</FormLabel>
                                                <FormDescription>
                                                    Banner sitede görüntülensin mi?
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

                    <div className="space-y-8">
                        <BannerPreview
                            title={form.watch("title")}
                            subtitle={form.watch("subtitle")}
                            image={form.watch("image")}
                            mobileImage={form.watch("mobileImage")}
                            buttonText={form.watch("buttonText")}
                            link={form.watch("link")}
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle>Görseller</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Masaüstü Görseli (Zorunlu)</FormLabel>
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
                                    name="mobileImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobil Görseli (Opsiyonel)</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    onChange={(url) => field.onChange(url[0])}
                                                    onRemove={() => field.onChange("")}
                                                />
                                            </FormControl>
                                            <FormDescription>Mobil cihazlar için özel görsel.</FormDescription>
                                            <FormMessage />
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

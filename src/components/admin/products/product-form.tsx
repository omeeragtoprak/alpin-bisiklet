"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash, Plus, Upload, X, Box, Film } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { createProductSchema, CreateProductInput, productVideoSchema } from "@/lib/validations";
type ProductVideoInput = z.infer<typeof productVideoSchema>;
import { ProductPreviewCard } from "@/components/admin/previews/product-preview-card";

// Schema'yı genişletmemiz gerekebilir ama şimdilik createProductSchema kullanıyoruz.
// Edit modunda id hariç aynı yapıyı kullanacağız.

interface ProductFormProps {
    initialData?: any;
    initialBarcode?: string;
}

export function ProductForm({ initialData, initialBarcode }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [model3dUploading, setModel3dUploading] = useState(false);

    const form = useForm({
        resolver: zodResolver(createProductSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                description: initialData.description || "",
                shortDescription: initialData.shortDescription || "",
                price: parseFloat(initialData.price.toString()),
                comparePrice: initialData.comparePrice
                    ? parseFloat(initialData.comparePrice.toString())
                    : undefined,
                cost: initialData.cost ? parseFloat(initialData.cost.toString()) : undefined,
                sku: initialData.sku ?? "",
                barcode: initialData.barcode ?? "",
                stock: initialData.stock ?? 0,
                lowStockAlert: initialData.lowStockAlert ?? 5,
                trackStock: initialData.trackStock ?? true,
                weight: initialData.weight ?? undefined,
                width: initialData.width ?? undefined,
                height: initialData.height ?? undefined,
                length: initialData.length ?? undefined,
                categoryId: initialData.categoryId ?? undefined,
                brandId: initialData.brandId ?? undefined,
                isActive: initialData.isActive,
                isFeatured: initialData.isFeatured,
                isNew: initialData.isNew,
                images: initialData.images || [],
                videos: initialData.videos || [],
                model3dUrl: initialData.model3dUrl ?? "",
                variants: (initialData.variants || []).map((v: any) => ({
                    ...v,
                    name: v.name || "beden",
                    sku: v.sku ?? "",
                    barcode: v.barcode ?? undefined,
                    price: v.price ?? undefined,
                    sizeLabel: v.sizeLabel ?? undefined,
                    minHeight: v.minHeight ?? undefined,
                    maxHeight: v.maxHeight ?? undefined,
                    minInseam: v.minInseam ?? undefined,
                    maxInseam: v.maxInseam ?? undefined,
                })),
            }
            : {
                name: "",
                description: "",
                shortDescription: "",
                price: 0,
                comparePrice: undefined,
                cost: undefined,
                sku: "",
                barcode: initialBarcode || "",
                stock: 0,
                lowStockAlert: 5,
                trackStock: true,
                weight: undefined,
                width: undefined,
                height: undefined,
                length: undefined,
                categoryId: undefined,
                brandId: undefined,
                isActive: true,
                isFeatured: false,
                isNew: false,
                images: [],
                videos: [],
                model3dUrl: "",
                variants: [],
            },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    });

    // Kategorileri getir
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            return res.json();
        },
    });

    // Markaları getir
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const res = await fetch("/api/brands");
            return res.json();
        },
    });

    const selectedCategory = categories?.data?.find((c: any) => c.id === form.watch("categoryId"));
    const categoryType: "BICYCLE" | "CLOTHING" | "GENERAL" = selectedCategory?.type ?? "GENERAL";

    const onSubmit = async (data: CreateProductInput) => {
        try {
            setLoading(true);
            // BICYCLE/CLOTHING modunda name alanı sizeLabel'dan gelir
            if (categoryType !== "GENERAL" && data.variants) {
                data.variants = data.variants.map((v) => ({
                    ...v,
                    name: v.sizeLabel || v.name || "Beden",
                }));
            }
            if (initialData) {
                // Update
                const res = await fetch(`/api/products/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error("Güncelleme başarısız");
            } else {
                // Create
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error("Oluşturma başarısız");
            }
            toast({ title: initialData ? "Urun guncellendi" : "Urun olusturuldu" });
            router.push("/admin/urunler");
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
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("[ProductForm] Zod validation errors:", errors))} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol Kolon - Temel Bilgiler */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Temel Bilgiler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ürün Adı</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Trek Marlin 7" {...field} />
                                            </FormControl>
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
                                                    placeholder="Ürün açıklaması..."
                                                    className="min-h-[120px]"
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
                                <CardTitle>Medya</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Görseller</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value?.map((img) => img.url) || []}
                                                    onChange={(urls) =>
                                                        field.onChange(
                                                            urls.map((url, index) => ({
                                                                url,
                                                                order: index,
                                                            }))
                                                        )
                                                    }
                                                    onRemove={(url) =>
                                                        field.onChange(
                                                            field.value?.filter((img) => img.url !== url)
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* Video Yükleme */}
                                <FormField
                                    control={form.control}
                                    name="videos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Film className="h-4 w-4" />
                                                Videolar / GIF
                                            </FormLabel>
                                            <div className="space-y-3">
                                                {(field.value as ProductVideoInput[] || []).map((vid, idx) => (
                                                    <div key={`video-${idx}`} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                                                        <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <span className="text-xs truncate flex-1 font-mono">{vid.url.split("/").pop()}</span>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                field.onChange(
                                                                    (field.value as ProductVideoInput[] || []).filter((_, i) => i !== idx)
                                                                )
                                                            }
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors ${videoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                                                    {videoUploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    <span className="text-sm">{videoUploading ? "Yükleniyor..." : "Video / GIF Ekle"}</span>
                                                    <input
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/ogg,image/gif"
                                                        className="hidden"
                                                        disabled={videoUploading}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setVideoUploading(true);
                                                            try {
                                                                const fd = new FormData();
                                                                fd.append("file", file);
                                                                const res = await fetch("/api/upload/video", { method: "POST", body: fd });
                                                                const json = await res.json();
                                                                if (json.success) {
                                                                    const cur = (field.value as ProductVideoInput[]) || [];
                                                                    field.onChange([...cur, { url: json.url, order: cur.length }]);
                                                                } else {
                                                                    toast({ title: json.error || "Video yüklenemedi", variant: "destructive" });
                                                                }
                                                            } catch {
                                                                toast({ title: "Video yüklenemedi", variant: "destructive" });
                                                            } finally {
                                                                setVideoUploading(false);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* 3D Model Yükleme */}
                                <FormField
                                    control={form.control}
                                    name="model3dUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Box className="h-4 w-4" />
                                                3D Model (GLB / GLTF)
                                            </FormLabel>
                                            {field.value && typeof field.value === "string" && field.value.length > 0 ? (
                                                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                                                    <Box className="h-4 w-4 text-primary shrink-0" />
                                                    <span className="text-xs truncate flex-1 font-mono">{field.value.split("/").pop()}</span>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => field.onChange("")}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors ${model3dUploading ? "opacity-50 pointer-events-none" : ""}`}>
                                                    {model3dUploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    <span className="text-sm">{model3dUploading ? "Yükleniyor..." : "GLB / GLTF Dosyası Seç"}</span>
                                                    <input
                                                        type="file"
                                                        accept=".glb,.gltf"
                                                        className="hidden"
                                                        disabled={model3dUploading}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setModel3dUploading(true);
                                                            try {
                                                                const fd = new FormData();
                                                                fd.append("file", file);
                                                                const res = await fetch("/api/upload/model3d", { method: "POST", body: fd });
                                                                const json = await res.json();
                                                                if (json.success && json.url) {
                                                                    field.onChange(json.url);
                                                                } else {
                                                                    toast({ title: json.error || "Model yüklenemedi", variant: "destructive" });
                                                                }
                                                            } catch {
                                                                toast({ title: "Model yüklenemedi", variant: "destructive" });
                                                            } finally {
                                                                setModel3dUploading(false);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {categoryType === "BICYCLE" ? "Çerçeve Bedenleri" : categoryType === "CLOTHING" ? "Kıyafet Bedenleri" : "Varyantlar"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="p-4 border rounded-lg space-y-3"
                                        >
                                            {categoryType === "BICYCLE" ? (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">Beden #{index + 1}</span>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.sizeLabel`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Çerçeve Boyutu</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Beden seç" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {["XS", "S", "M", "L", "XL"].map((s) => (
                                                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.stock`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Stok</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.minHeight`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Min Boy (cm)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="150" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.maxHeight`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Max Boy (cm)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="165" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.minInseam`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Min Bacak Boyu (cm)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="65" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.maxInseam`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Max Bacak Boyu (cm)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="75" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="hidden">
                                                                <FormControl>
                                                                    <Input {...field} value={field.value ?? ""} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            ) : categoryType === "CLOTHING" ? (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-muted-foreground">Beden #{index + 1}</span>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.sizeLabel`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Beden</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Beden seç" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((s) => (
                                                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.stock`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Stok</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variants.${index}.price`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Fiyat (TL)</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="Opsiyonel" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} value={field.value ?? ""} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="hidden">
                                                                <FormControl>
                                                                    <Input {...field} value={field.value ?? ""} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            ) : (
                                                <div className="flex items-end gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                                    Varyant Adı
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Örn: Kırmızı - L" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.stock`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-24">
                                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                                    Stok
                                                                </FormLabel>
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
                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-32">
                                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>
                                                                    Fiyat (+/-)
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (categoryType === "BICYCLE") {
                                                append({ name: "beden", stock: 0, isActive: true, sizeLabel: undefined, minHeight: undefined, maxHeight: undefined, minInseam: undefined, maxInseam: undefined });
                                            } else if (categoryType === "CLOTHING") {
                                                append({ name: "beden", stock: 0, isActive: true, sizeLabel: undefined, price: undefined });
                                            } else {
                                                append({ name: "", stock: 0, isActive: true, price: 0 });
                                            }
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {categoryType === "BICYCLE" ? "Çerçeve Boyutu Ekle" : categoryType === "CLOTHING" ? "Beden Ekle" : "Varyant Ekle"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sağ Kolon - Detaylar */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Durum</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Aktif Durum</FormLabel>
                                                <FormDescription>
                                                    Ürün mağazada görünür olsun mu?
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
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Öne Çıkan</FormLabel>
                                                <FormDescription>
                                                    Anasayfada gösterilsin mi?
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Fiyat & Stok</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fiyat (TL)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseFloat(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="comparePrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Karşılaştırma Fiyatı (TL)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Üstü çizili gösterilecek eski fiyat"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Bu fiyat ürün kartında üstü çizili olarak gösterilir (indirim badge'i için).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stok Adedi</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value))
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU (Stok Kodu)</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="barcode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Barkod</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Barkod numarası"
                                                    className="font-mono"
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
                                <CardTitle>Organizasyon</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori</FormLabel>
                                            <Select
                                                disabled={!categories?.data}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Kategori seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories?.data?.map((category: any) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id.toString()}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="brandId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marka</FormLabel>
                                            <Select
                                                disabled={!brands?.data}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Marka seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {brands?.data?.map((brand: any) => (
                                                        <SelectItem
                                                            key={brand.id}
                                                            value={brand.id.toString()}
                                                        >
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <ProductPreviewCard
                            name={form.watch("name")}
                            price={form.watch("price")}
                            comparePrice={form.watch("comparePrice")}
                            images={form.watch("images")}
                            category={categories?.data?.find((c: any) => c.id === form.watch("categoryId"))?.name}
                            brand={brands?.data?.find((b: any) => b.id === form.watch("brandId"))?.name}
                            isNew={form.watch("isNew")}
                            isFeatured={form.watch("isFeatured")}
                        />
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


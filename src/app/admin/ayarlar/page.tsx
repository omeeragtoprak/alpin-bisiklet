"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Store, CreditCard, Truck, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/admin/page-header";
import { CardSkeleton } from "@/components/admin/loading-skeleton";
import { toast } from "@/hooks/use-toast";
import { settingsSchema, type SettingsValues } from "@/lib/validations";

const groupConfig: Record<string, { title: string; description: string; icon: typeof Store }> = {
    general: { title: "Genel Ayarlar", description: "Mağaza genel bilgileri", icon: Store },
    payment: { title: "Ödeme Ayarları", description: "Ödeme yöntemleri yapılandırması", icon: CreditCard },
    shipping: { title: "Kargo Ayarları", description: "Kargo ve teslimat ayarları", icon: Truck },
    seo: { title: "SEO Ayarları", description: "Arama motoru optimizasyonu", icon: SearchIcon },
};

const defaultSettings: Record<string, Array<{ key: keyof SettingsValues; label: string; type: string; placeholder?: string }>> = {
    general: [
        { key: "store_name", label: "Mağaza Adı", type: "string", placeholder: "Alpin Bisiklet" },
        { key: "store_email", label: "İletişim E-posta", type: "string", placeholder: "info@alpinbisiklet.com" },
        { key: "store_phone", label: "Telefon", type: "string", placeholder: "+90 XXX XXX XX XX" },
        { key: "store_address", label: "Adres", type: "string", placeholder: "İstanbul, Türkiye" },
        { key: "tax_rate", label: "KDV Oranı (%)", type: "number", placeholder: "18" },
    ],
    payment: [
        { key: "payment_iyzico_enabled", label: "Iyzico Aktif", type: "boolean" },
        { key: "payment_bank_transfer_enabled", label: "Havale/EFT Aktif", type: "boolean" },
        { key: "payment_cod_enabled", label: "Kapıda Ödeme Aktif", type: "boolean" },
    ],
    shipping: [
        { key: "shipping_free_threshold", label: "Ücretsiz Kargo Limiti (₺)", type: "number", placeholder: "500" },
        { key: "shipping_default_cost", label: "Varsayılan Kargo Ücreti (₺)", type: "number", placeholder: "50" },
        { key: "shipping_estimated_days", label: "Tahmini Teslimat Süresi (gün)", type: "number", placeholder: "3" },
    ],
    seo: [
        { key: "seo_title", label: "Meta Başlık", type: "string", placeholder: "Alpin Bisiklet - Profesyonel Bisiklet Mağazası" },
        { key: "seo_description", label: "Meta Açıklama", type: "string", placeholder: "Türkiye'nin en büyük bisiklet mağazası" },
        { key: "seo_keywords", label: "Anahtar Kelimeler", type: "string", placeholder: "bisiklet, dağ bisikleti, yol bisikleti" },
    ],
};

export default function SettingsPage() {
    const queryClient = useQueryClient();

    const emptyDefaults: SettingsValues = {
        store_name: "",
        store_email: "",
        store_phone: "",
        store_address: "",
        tax_rate: "",
        payment_iyzico_enabled: "false",
        payment_bank_transfer_enabled: "false",
        payment_cod_enabled: "false",
        shipping_free_threshold: "",
        shipping_default_cost: "",
        shipping_estimated_days: "",
        seo_title: "",
        seo_description: "",
        seo_keywords: "",
    };

    const form = useForm<SettingsValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: emptyDefaults,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const res = await fetch("/api/settings");
            return res.json();
        },
    });

    useEffect(() => {
        if (data?.data) {
            const flat: Partial<SettingsValues> = {};
            for (const group of Object.values(data.data as Record<string, Record<string, string>>)) {
                for (const [k, v] of Object.entries(group)) {
                    (flat as Record<string, string>)[k] = v;
                }
            }
            form.reset({ ...emptyDefaults, ...flat });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: async (values: SettingsValues) => {
            const settingsArray = Object.entries(values).map(([key, value]) => {
                const group = key.startsWith("payment_") ? "payment"
                    : key.startsWith("shipping_") ? "shipping"
                        : key.startsWith("seo_") ? "seo"
                            : "general";

                const cfg = defaultSettings[group]?.find((s) => s.key === key);
                return { key, value: String(value), type: cfg?.type || "string", group };
            });
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: settingsArray }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            toast({ title: "Ayarlar kaydedildi" });
        },
        onError: () => {
            toast({ title: "Ayarlar kaydedilirken hata oluştu", variant: "destructive" });
        },
    });

    const groups = Object.keys(defaultSettings);

    return (
        <div className="space-y-6">
            <PageHeader title="Ayarlar" description="Mağaza yapılandırması ve tercihler" />

            {isLoading ? (
                <CardSkeleton />
            ) : (
                <Tabs defaultValue="general">
                    <TabsList>
                        {groups.map((group) => {
                            const cfg = groupConfig[group] || { title: group, icon: Settings };
                            return (
                                <TabsTrigger key={group} value={group}>
                                    <cfg.icon className="h-4 w-4 mr-2" aria-hidden="true" />
                                    {cfg.title}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {groups.map((group) => (
                        <TabsContent key={group} value={group}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{groupConfig[group]?.title || group}</CardTitle>
                                    <CardDescription>{groupConfig[group]?.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {defaultSettings[group]?.map((setting) => (
                                        <div key={setting.key} className="grid grid-cols-3 gap-4 items-center">
                                            <Label htmlFor={setting.key} className="font-medium">{setting.label}</Label>
                                            <div className="col-span-2">
                                                {setting.type === "boolean" ? (
                                                    <Controller
                                                        name={setting.key}
                                                        control={form.control}
                                                        render={({ field }) => (
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    id={setting.key}
                                                                    checked={field.value === "true" || field.value === "1"}
                                                                    onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                                                />
                                                                <span className="text-sm text-muted-foreground">
                                                                    {field.value === "true" || field.value === "1" ? "Aktif" : "Pasif"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    />
                                                ) : (
                                                    <Input
                                                        id={setting.key}
                                                        type={setting.type === "number" ? "number" : "text"}
                                                        {...form.register(setting.key)}
                                                        placeholder={setting.placeholder}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t">
                                        <Button
                                            onClick={form.handleSubmit((values) => saveMutation.mutate(values))}
                                            disabled={saveMutation.isPending}
                                        >
                                            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                                            {saveMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    );
}

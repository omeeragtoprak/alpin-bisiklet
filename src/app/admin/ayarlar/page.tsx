"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
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

const groupConfig: Record<string, { title: string; description: string; icon: typeof Store }> = {
    general: { title: "Genel Ayarlar", description: "Mağaza genel bilgileri", icon: Store },
    payment: { title: "Ödeme Ayarları", description: "Ödeme yöntemleri yapılandırması", icon: CreditCard },
    shipping: { title: "Kargo Ayarları", description: "Kargo ve teslimat ayarları", icon: Truck },
    seo: { title: "SEO Ayarları", description: "Arama motoru optimizasyonu", icon: SearchIcon },
};

const defaultSettings: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
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
    const [values, setValues] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const res = await fetch("/api/settings");
            const json = await res.json();
            // Flatten grouped settings into a single object
            const flat: Record<string, string> = {};
            for (const group of Object.values(json.data || {})) {
                for (const [k, v] of Object.entries(group as Record<string, string>)) {
                    flat[k] = v;
                }
            }
            setValues(flat);
            return json;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
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
            toast({ title: "Ayarlar kaydedilirken hata olustu", variant: "destructive" });
        },
    });

    const groups = Object.keys(defaultSettings);

    return (
        <div className="space-y-6">
            <PageHeader title="Ayarlar" description="Magaza yapilandirmasi ve tercihler" />

            {/* Settings Tabs */}
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
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            id={setting.key}
                                                            checked={values[setting.key] === "true" || values[setting.key] === "1"}
                                                            onCheckedChange={(checked) => setValues({ ...values, [setting.key]: checked ? "true" : "false" })}
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            {values[setting.key] === "true" || values[setting.key] === "1" ? "Aktif" : "Pasif"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Input
                                                        id={setting.key}
                                                        type={setting.type === "number" ? "number" : "text"}
                                                        value={values[setting.key] || ""}
                                                        onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                                                        placeholder={setting.placeholder}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t">
                                        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                                            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                                            {saveMutation.isPending ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
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

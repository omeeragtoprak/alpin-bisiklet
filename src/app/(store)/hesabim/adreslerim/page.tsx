"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { MapPin, Plus, Trash2, Edit, Star, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Address {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    district: string;
    neighborhood: string | null;
    address: string;
    postalCode: string | null;
    isDefault: boolean;
}

const emptyForm = {
    title: "", firstName: "", lastName: "", phone: "",
    city: "", district: "", neighborhood: "", address: "", postalCode: "",
};

export default function AddressesPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const res = await fetch("/api/addresses");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => { await fetch(`/api/addresses/${id}`, { method: "DELETE" }); },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["addresses"] }); },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        saveMutation.mutate(form);
    }

    const addresses: Address[] = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Adreslerim</h1>
                    <p className="text-muted-foreground">Kayıtlı teslimat adresleriniz</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}>
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Yeni Adres
                </Button>
            </div>

            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingId ? "Adresi Düzenle" : "Yeni Adres"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="addr-title">Adres Başlığı</Label>
                                    <Input id="addr-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ev, İş, vb." required />
                                </div>
                                <div>
                                    <Label htmlFor="addr-phone">Telefon</Label>
                                    <Input id="addr-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 5XX XXX XX XX" required />
                                </div>
                                <div>
                                    <Label htmlFor="addr-first">Ad</Label>
                                    <Input id="addr-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="addr-last">Soyad</Label>
                                    <Input id="addr-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="addr-city">İl</Label>
                                    <Input id="addr-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="addr-district">İlçe</Label>
                                    <Input id="addr-district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="addr-detail">Detaylı Adres</Label>
                                    <textarea
                                        id="addr-detail"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background text-sm resize-y"
                                        placeholder="Mahalle, sokak, bina no, daire no..."
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                    <Button type="submit" disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>İptal</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                        <p>Henüz kayıtlı adres yok</p>
                        <p className="text-sm mt-1">Yeni adres ekleyerek siparişlerinizi hızlandırın</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, i) => (
                        <motion.div key={addr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Card className={addr.isDefault ? "border-primary/40 bg-primary/5" : ""}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {addr.title.toLowerCase().includes("iş") ? (
                                                <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            ) : (
                                                <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            )}
                                            <span className="font-bold">{addr.title}</span>
                                            {addr.isDefault && (
                                                <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                    <Star className="h-3 w-3" aria-hidden="true" /> Varsayılan
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setEditingId(addr.id);
                                                setForm({
                                                    title: addr.title, firstName: addr.firstName, lastName: addr.lastName,
                                                    phone: addr.phone, city: addr.city, district: addr.district,
                                                    neighborhood: addr.neighborhood || "", address: addr.address,
                                                    postalCode: addr.postalCode || "",
                                                });
                                                setShowForm(true);
                                            }} aria-label={`${addr.title} adresini düzenle`}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(addr.id)} aria-label={`${addr.title} adresini sil`}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium">{addr.firstName} {addr.lastName}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
                                    <p className="text-sm text-muted-foreground">{addr.district}, {addr.city}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

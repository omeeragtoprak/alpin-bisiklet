"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Plus, Trash2, Edit, Star, Home, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createAddressSchema, type CreateAddressInput } from "@/lib/validations";
import { formatTurkishPhone } from "@/lib/phone";
import { PhoneInput } from "@/components/ui/phone-input";
import { TURKEY_CITIES, getDistricts, CITY_NAMES } from "@/data/turkey-cities";

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

export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      phone: "",
      city: "",
      district: "",
      neighborhood: "",
      address: "",
      postalCode: "",
    },
  });

  const selectedCity = form.watch("city");
  const districts = getDistricts(selectedCity);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch("/api/addresses");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: CreateAddressInput) => {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Kaydedilemedi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: editingId ? "Adres güncellendi" : "Adres eklendi" });
      closeForm();
    },
    onError: () => {
      toast({ title: "Adres kaydedilemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: "Adres silindi" });
    },
    onError: () => {
      toast({ title: "Adres silinemedi", variant: "destructive" });
    },
  });

  function openNew() {
    setEditingId(null);
    form.reset({
      title: "", firstName: "", lastName: "", phone: "",
      city: "", district: "", neighborhood: "", address: "", postalCode: "",
    });
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    form.reset({
      title: addr.title,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: formatTurkishPhone(addr.phone),
      city: addr.city,
      district: addr.district,
      neighborhood: addr.neighborhood || "",
      address: addr.address,
      postalCode: addr.postalCode || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    form.reset();
  }

  const onSubmit = (data: CreateAddressInput) => {
    saveMutation.mutate(data);
  };

  const addresses: Address[] = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adreslerim</h1>
          <p className="text-muted-foreground">Kayıtlı teslimat adresleriniz</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Adres
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="address-form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Adres Başlığı */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres Başlığı *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ev, İş, vb." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Telefon */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon *</FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Ad */}
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ahmet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Soyad */}
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad *</FormLabel>
                            <FormControl>
                              <Input placeholder="Yılmaz" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* İl */}
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İl *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(v) => {
                                field.onChange(v);
                                form.setValue("district", "");
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="İl seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {CITY_NAMES.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* İlçe */}
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İlçe *</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!selectedCity}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      selectedCity ? "İlçe seçiniz" : "Önce il seçiniz"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {districts.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Mahalle */}
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mahalle</FormLabel>
                            <FormControl>
                              <Input placeholder="Cumhuriyet Mah." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Posta Kodu */}
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posta Kodu</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="01000"
                                inputMode="numeric"
                                maxLength={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Detaylı Adres */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Detaylı Adres *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Sokak, bina no, daire no..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button type="submit" disabled={saveMutation.isPending}>
                        {saveMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingId ? "Güncelle" : "Ekle"}
                      </Button>
                      <Button type="button" variant="outline" onClick={closeForm}>
                        İptal
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Henüz kayıtlı adres yok</p>
            <p className="text-sm mt-1">Yeni adres ekleyerek siparişlerinizi hızlandırın</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr, i) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className={addr.isDefault ? "border-primary/40 bg-primary/5" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {addr.title.toLowerCase().includes("iş") ? (
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Home className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-bold">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3" /> Varsayılan
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(addr)}
                        aria-label={`${addr.title} adresini düzenle`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(addr.id)}
                        disabled={deleteMutation.isPending}
                        aria-label={`${addr.title} adresini sil`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{addr.firstName} {addr.lastName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.district}, {addr.city}
                    {addr.postalCode ? ` ${addr.postalCode}` : ""}
                  </p>
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

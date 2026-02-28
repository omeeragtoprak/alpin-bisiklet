"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, TrendingDown, Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
} from "@/hooks";
import { createDiscountSchema } from "@/lib/validations";

interface DiscountProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  isActive: boolean;
  discountPercent: number;
  images: { url: string }[];
}

interface DiscountItem {
  id: number;
  name: string;
  type: string;
  categoryId: number | null;
  value: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  category: { id: number; name: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  CATEGORY: "Kategori",
  STORE_WIDE: "Tüm Mağaza",
  ON_SALE: "İndirimli Ürünler",
};

const TYPE_COLORS: Record<string, string> = {
  CATEGORY: "bg-blue-100 text-blue-800",
  STORE_WIDE: "bg-purple-100 text-purple-800",
  ON_SALE: "bg-green-100 text-green-800",
};

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("tr-TR");
}

function DiscountDialog({
  open,
  onClose,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  editItem: DiscountItem | null;
}) {
  const { toast } = useToast();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const { data: categoryData } = useQuery<{ data: { id: number; name: string }[] }>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoryData?.data ?? [];

  const form = useForm({
    resolver: zodResolver(createDiscountSchema),
    defaultValues: editItem
      ? {
          name: editItem.name,
          type: editItem.type as "CATEGORY" | "STORE_WIDE" | "ON_SALE",
          categoryId: editItem.categoryId ?? undefined,
          value: editItem.value,
          isActive: editItem.isActive,
          validFrom: editItem.validFrom
            ? editItem.validFrom.slice(0, 16)
            : undefined,
          validTo: editItem.validTo
            ? editItem.validTo.slice(0, 16)
            : undefined,
        }
      : {
          name: "",
          type: "CATEGORY",
          isActive: true,
          value: 10,
        },
  });

  const selectedType = form.watch("type");
  const isLoading = createDiscount.isPending || updateDiscount.isPending;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      categoryId: values.type === "CATEGORY" ? (values.categoryId ?? null) : null,
    };

    if (editItem) {
      const res = await updateDiscount.mutateAsync({ id: editItem.id, data: payload });
      if (res.error) {
        toast({ title: "Hata", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "İndirim güncellendi" });
        onClose();
      }
    } else {
      const res = await createDiscount.mutateAsync(payload);
      if (res.error) {
        toast({ title: "Hata", description: res.error, variant: "destructive" });
      } else {
        toast({ title: "İndirim oluşturuldu" });
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editItem ? "İndirimi Düzenle" : "Yeni Toplu İndirim"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İndirim Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Yaz Kampanyası - Bisikletler" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tip seç" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CATEGORY">Kategori</SelectItem>
                      <SelectItem value="STORE_WIDE">Tüm Mağaza</SelectItem>
                      <SelectItem value="ON_SALE">İndirimli Ürünler</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "CATEGORY" && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seç" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İndirim Oranı (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      step={0.5}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç (opsiyonel)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş (opsiyonel)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
                      />
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
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Aktif</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editItem ? "Güncelle" : "Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DiscountsClient({ products }: { products: DiscountProduct[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DiscountItem | null>(null);
  const { data: discountsData, isLoading } = useDiscounts();
  const deleteDiscount = useDeleteDiscount();
  const { toast } = useToast();

  const discounts = discountsData?.data ?? [];

  const openNew = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: DiscountItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const res = await deleteDiscount.mutateAsync(id);
    if (res.error) {
      toast({ title: "Silinemedi", description: res.error, variant: "destructive" });
    } else {
      toast({ title: "İndirim silindi" });
    }
  };

  return (
    <>
      <Tabs defaultValue="bulk">
        <TabsList>
          <TabsTrigger value="bulk">Toplu İndirimler</TabsTrigger>
          <TabsTrigger value="sale">İndirimli Ürünler</TabsTrigger>
        </TabsList>

        {/* Tab 1: Toplu İndirimler */}
        <TabsContent value="bulk" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni İndirim
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : discounts.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title="Toplu indirim yok"
                  description="Henüz toplu/otomatik indirim oluşturulmadı."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 text-sm font-medium">Ad</th>
                        <th className="text-left p-4 text-sm font-medium">Tip</th>
                        <th className="text-left p-4 text-sm font-medium">Kategori</th>
                        <th className="text-left p-4 text-sm font-medium">Oran</th>
                        <th className="text-left p-4 text-sm font-medium">Geçerlilik</th>
                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discounts.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium text-sm">{d.name}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[d.type] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {TYPE_LABELS[d.type] ?? d.type}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {d.category?.name ?? "—"}
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-bold text-destructive">
                              %{d.value}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {d.validFrom || d.validTo
                              ? `${formatDate(d.validFrom)} — ${formatDate(d.validTo)}`
                              : "Süresiz"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                d.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {d.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(d)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(d.id)}
                                disabled={deleteDiscount.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: İndirimli Ürünler */}
        <TabsContent value="sale" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {products.length === 0 ? (
                <EmptyState
                  icon={TrendingDown}
                  title="İndirimli ürün yok"
                  description="Karşılaştırma fiyatı girilmiş ürün bulunmuyor."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 text-sm font-medium">Ürün</th>
                        <th className="text-left p-4 text-sm font-medium">İndirimli Fiyat</th>
                        <th className="text-left p-4 text-sm font-medium">Karşılaştırma Fiyatı</th>
                        <th className="text-left p-4 text-sm font-medium">İndirim %</th>
                        <th className="text-left p-4 text-sm font-medium">Durum</th>
                        <th className="text-left p-4 text-sm font-medium">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {p.images[0]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.images[0].url}
                                  alt={p.name}
                                  className="h-10 w-10 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <span className="font-medium text-sm line-clamp-2">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-semibold text-primary">
                            {p.price.toLocaleString("tr-TR")} ₺
                          </td>
                          <td className="p-4 text-sm text-muted-foreground line-through">
                            {p.comparePrice?.toLocaleString("tr-TR")} ₺
                          </td>
                          <td className="p-4">
                            {p.discountPercent > 0 ? (
                              <span className="text-sm font-bold text-destructive">
                                %{p.discountPercent}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {p.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/urunler/${p.id}`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Düzenle
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DiscountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editItem={editItem}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface CouponFormData {
  code: string;
  type: string;
  value: number;
  minPurchase: string;
  maxDiscount: string;
  maxUses: string;
  maxUsesPerUser: string;
  minQuantity: string;
  firstOrderOnly: boolean;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  categoryIds: number[];
  productIds: number[];
}

interface CouponFormProps {
  initialData?: {
    id: number;
    code: string;
    type: string;
    value: number;
    minPurchase: number | null;
    maxDiscount: number | null;
    maxUses: number | null;
    maxUsesPerUser: number | null;
    minQuantity: number | null;
    firstOrderOnly: boolean;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    categories?: { categoryId: number; category: { id: number; name: string } }[];
    products?: { productId: number; product: { id: number; name: string } }[];
  };
}

type ScopeType = "all" | "categories" | "products";

export function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CouponFormData>({
    code: initialData?.code || "",
    type: initialData?.type || "PERCENTAGE",
    value: initialData?.value ?? 0,
    minPurchase: initialData?.minPurchase?.toString() || "",
    maxDiscount: initialData?.maxDiscount?.toString() || "",
    maxUses: initialData?.maxUses?.toString() || "",
    maxUsesPerUser: initialData?.maxUsesPerUser?.toString() || "",
    minQuantity: initialData?.minQuantity?.toString() || "",
    firstOrderOnly: initialData?.firstOrderOnly || false,
    validFrom: initialData?.validFrom
      ? new Date(initialData.validFrom).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    validTo: initialData?.validTo
      ? new Date(initialData.validTo).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: initialData?.isActive ?? true,
    categoryIds: initialData?.categories?.map((c) => c.categoryId) || [],
    productIds: initialData?.products?.map((p) => p.productId) || [],
  });

  const [scopeType, setScopeType] = useState<ScopeType>(
    (initialData?.categories?.length ?? 0) > 0
      ? "categories"
      : (initialData?.products?.length ?? 0) > 0
        ? "products"
        : "all",
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-for-coupon"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=200&isActive=all");
      return res.json();
    },
    enabled: scopeType === "products",
  });

  const categories: { id: number; name: string }[] = categoriesData?.data || [];
  const products: { id: number; name: string }[] = productsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : null,
        minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
        firstOrderOnly: form.firstOrderOnly,
        validFrom: new Date(form.validFrom),
        validTo: new Date(form.validTo),
        isActive: form.isActive,
        categoryIds: scopeType === "categories" ? form.categoryIds : [],
        productIds: scopeType === "products" ? form.productIds : [],
      };

      const url = initialData ? `/api/coupons/${initialData.id}` : "/api/coupons";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "İşlem başarısız");
      }

      toast({ title: initialData ? "Kupon güncellendi" : "Kupon oluşturuldu" });
      router.push("/admin/kuponlar");
      router.refresh();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  const toggleProduct = (id: number) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="code">Kupon Kodu</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="YILBASI25"
              required
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="type">İndirim Türü</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Yüzde İndirim (%)</SelectItem>
                <SelectItem value="FIXED">Sabit Tutar (₺)</SelectItem>
                <SelectItem value="FREE_SHIPPING">Ücretsiz Kargo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="value">
              Değer {form.type === "PERCENTAGE" ? "(%)" : form.type === "FIXED" ? "(₺)" : ""}
            </Label>
            <Input
              id="value"
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              required
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="validFrom">Başlangıç Tarihi</Label>
            <Input
              id="validFrom"
              type="date"
              value={form.validFrom}
              onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="validTo">Bitiş Tarihi</Label>
            <Input
              id="validTo"
              type="date"
              value={form.validTo}
              onChange={(e) => setForm({ ...form, validTo: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <Label htmlFor="isActive">Aktif</Label>
          </div>
        </CardContent>
      </Card>

      {/* Koşullar */}
      <Card>
        <CardHeader>
          <CardTitle>Koşullar</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="minPurchase">Min. Sepet Tutarı (₺)</Label>
            <Input
              id="minPurchase"
              type="number"
              value={form.minPurchase}
              onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
              placeholder="Sınırsız"
            />
          </div>
          {form.type === "PERCENTAGE" && (
            <div>
              <Label htmlFor="maxDiscount">Maks. İndirim Tutarı (₺)</Label>
              <Input
                id="maxDiscount"
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                placeholder="Sınırsız"
              />
            </div>
          )}
          <div>
            <Label htmlFor="maxUses">Toplam Kullanım Limiti</Label>
            <Input
              id="maxUses"
              type="number"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              placeholder="Sınırsız"
            />
          </div>
          <div>
            <Label htmlFor="maxUsesPerUser">Kullanıcı Başı Limit</Label>
            <Input
              id="maxUsesPerUser"
              type="number"
              value={form.maxUsesPerUser}
              onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
              placeholder="Sınırsız"
            />
          </div>
          <div>
            <Label htmlFor="minQuantity">Min. Ürün Adedi</Label>
            <Input
              id="minQuantity"
              type="number"
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
              placeholder="Yok"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="firstOrderOnly"
              checked={form.firstOrderOnly}
              onCheckedChange={(v) => setForm({ ...form, firstOrderOnly: v })}
            />
            <Label htmlFor="firstOrderOnly">Yalnızca İlk Sipariş</Label>
          </div>
        </CardContent>
      </Card>

      {/* Kapsam */}
      <Card>
        <CardHeader>
          <CardTitle>Kapsam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            {(["all", "categories", "products"] as ScopeType[]).map((s) => (
              <Button
                key={s}
                type="button"
                variant={scopeType === s ? "default" : "outline"}
                size="sm"
                onClick={() => setScopeType(s)}
              >
                {s === "all" ? "Tüm Ürünler" : s === "categories" ? "Belirli Kategoriler" : "Belirli Ürünler"}
              </Button>
            ))}
          </div>

          {scopeType === "categories" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Kuponun geçerli olacağı kategorileri seçin:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
              {form.categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.categoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    return cat ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        {cat.name}
                        <button type="button" onClick={() => toggleCategory(id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {scopeType === "products" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Kuponun geçerli olacağı ürünleri seçin:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="rounded"
                    />
                    <span className="line-clamp-1">{p.name}</span>
                  </label>
                ))}
              </div>
              {form.productIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.productIds.map((id) => {
                    const p = products.find((pr) => pr.id === id);
                    return p ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        {p.name}
                        <button type="button" onClick={() => toggleProduct(id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/kuponlar")}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}

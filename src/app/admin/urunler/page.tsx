"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { createColumns } from "./columns";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminMutation } from "@/hooks/use-admin-mutation";

async function getProducts() {
  const res = await fetch("/api/products?limit=100");
  if (!res.ok) throw new Error("Ürünler getirilemedi");
  return res.json();
}

export default function AdminProductsPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const deleteMutation = useAdminMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ürün silinemedi");
      return res.json();
    },
    invalidateKeys: [["products"]],
    successMessage: "Ürün silindi",
    errorMessage: "Ürün silinirken hata oluştu",
    onSuccess: () => setDeleteTarget(null),
  });

  const columns = useMemo(
    () =>
      createColumns((id, name) => setDeleteTarget({ id, name })),
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ürünler" description="Tüm ürünleri yönetin" />
        <EmptyState title="Hata" description={(error as Error).message} />
      </div>
    );
  }

  const products = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Ürünler" description="Tüm ürünleri yönetin">
        <Button asChild>
          <Link href="/admin/urunler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          title="Henüz ürün yok"
          description="İlk ürününü ekleyerek başlayabilirsin"
          actionLabel="Yeni Ürün Ekle"
          actionHref="/admin/urunler/yeni"
        />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <DataTable columns={columns} data={products} searchKey="name" />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Ürünü Sil"
        description={`"${deleteTarget?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}

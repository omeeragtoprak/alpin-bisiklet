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

async function getBrands() {
  const res = await fetch("/api/brands");
  if (!res.ok) throw new Error("Markalar yüklenemedi");
  return res.json();
}

export default function BrandsPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const deleteMutation = useAdminMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Marka silinemedi");
      return res.json();
    },
    invalidateKeys: [["brands"]],
    successMessage: "Marka silindi",
    errorMessage: "Marka silinirken hata oluştu",
    onSuccess: () => setDeleteTarget(null),
  });

  const columns = useMemo(
    () => createColumns((id, name) => setDeleteTarget({ id, name })),
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Markalar" description="Ürün markalarını yönetin" />
        <EmptyState title="Hata" description={(error as Error).message} />
      </div>
    );
  }

  const brands = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Markalar" description="Ürün markalarını yönetin">
        <Button asChild>
          <Link href="/admin/markalar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Marka
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <TableSkeleton />
      ) : brands.length === 0 ? (
        <EmptyState
          title="Henüz marka yok"
          description="İlk markanızı ekleyerek başlayın"
          actionLabel="Yeni Marka"
          actionHref="/admin/markalar/yeni"
        />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <DataTable columns={columns} data={brands} searchKey="name" />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Markayı Sil"
        description={`"${deleteTarget?.name}" markası kalıcı olarak silinecek.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}

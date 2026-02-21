"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { createColumns } from "./columns";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminMutation } from "@/hooks/use-admin-mutation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoriesReorder } from "@/components/admin/categories/categories-reorder";

async function getCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Kategoriler yuklenemedi");
  return res.json();
}

export default function CategoriesPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const deleteMutation = useAdminMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Kategori silinemedi");
      return res.json();
    },
    invalidateKeys: [["categories"]],
    successMessage: "Kategori silindi",
    errorMessage: "Kategori silinirken hata olustu",
    onSuccess: () => setDeleteTarget(null),
  });

  const columns = useMemo(
    () => createColumns((id, name) => setDeleteTarget({ id, name })),
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Kategoriler" description="Ürün kategorilerini yönetin" />
        <EmptyState title="Hata" description={(error as Error).message} />
      </div>
    );
  }

  const categories = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Kategoriler" description="Ürün kategorilerini yönetin">
        <Button
          variant="outline"
          onClick={() => setReorderOpen(true)}
          disabled={categories.length === 0}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sıralamayı Düzenle
        </Button>
        <Button asChild>
          <Link href="/admin/kategoriler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kategori
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <TableSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Henüz kategori yok"
          description="İlk kategorinizi ekleyerek başlayın"
          actionLabel="Yeni Kategori"
          actionHref="/admin/kategoriler/yeni"
        />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <DataTable columns={columns} data={categories} searchKey="name" />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Kategoriyi Sil"
        description={`"${deleteTarget?.name}" kategorisi kalıcı olarak silinecek.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />

      <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kategori Sıralaması</DialogTitle>
          </DialogHeader>
          <CategoriesReorder
            categories={categories}
            onClose={() => setReorderOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

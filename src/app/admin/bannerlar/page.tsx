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

async function getBanners() {
  const res = await fetch("/api/banners");
  if (!res.ok) throw new Error("Bannerlar yuklenemedi");
  return res.json();
}

export default function BannersPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });

  const deleteMutation = useAdminMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Banner silinemedi");
      return res.json();
    },
    invalidateKeys: [["banners"]],
    successMessage: "Banner silindi",
    errorMessage: "Banner silinirken hata olustu",
    onSuccess: () => setDeleteTarget(null),
  });

  const columns = useMemo(
    () => createColumns((id, title) => setDeleteTarget({ id, title })),
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Banner Yonetimi" description="Site bannerlarini yonetin" />
        <EmptyState title="Hata" description={(error as Error).message} />
      </div>
    );
  }

  const banners = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Banner Yonetimi" description="Site bannerlarini ve slider gorsellerini yonetin">
        <Button asChild>
          <Link href="/admin/bannerlar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Banner
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <TableSkeleton />
      ) : banners.length === 0 ? (
        <EmptyState
          title="Henuz banner yok"
          description="Ilk bannerinizi ekleyerek baslayin"
          actionLabel="Yeni Banner"
          actionHref="/admin/bannerlar/yeni"
        />
      ) : (
        <div className="rounded-lg border bg-card p-4">
          <DataTable columns={columns} data={banners} searchKey="title" />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Banneri Sil"
        description={`"${deleteTarget?.title}" banneri kalici olarak silinecek.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FlaskConical, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { createColumns } from "./columns";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useAdminMutation } from "@/hooks/use-admin-mutation";
import { useToast } from "@/hooks/use-toast";

async function getBanners() {
  const res = await fetch("/api/banners");
  if (!res.ok) throw new Error("Bannerlar yüklenemedi");
  return res.json();
}

export default function BannersPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSeedExamples = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/banners/seed-examples", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Hata");
      toast({ title: "Örnek bannerlar oluşturuldu", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    } catch (err) {
      toast({ title: "Hata", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

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
    errorMessage: "Banner silinirken hata oluştu",
    onSuccess: () => setDeleteTarget(null),
  });

  const columns = useMemo(
    () => createColumns((id, title) => setDeleteTarget({ id, title })),
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Banner Yönetimi" description="Site bannerlarını yönetin" />
        <EmptyState title="Hata" description={(error as Error).message} />
      </div>
    );
  }

  const banners = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Banner Yönetimi" description="Site bannerlarını ve slider görsellerini yönetin">
        <Button
          variant="outline"
          onClick={handleSeedExamples}
          disabled={seeding}
        >
          {seeding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FlaskConical className="mr-2 h-4 w-4" />
          )}
          Örnek Oluştur
        </Button>
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
          title="Henüz banner yok"
          description="İlk bannerinizi ekleyerek başlayın"
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
        description={`"${deleteTarget?.title}" banneri kalıcı olarak silinecek.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}

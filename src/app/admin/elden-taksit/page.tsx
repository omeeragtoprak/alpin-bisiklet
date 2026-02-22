"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
	Landmark,
	Search,
	Plus,
	Eye,
	Trash2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/constants/query-keys";

const statusMap: Record<string, { label: string; className: string }> = {
	ACTIVE: { label: "Aktif", className: "bg-yellow-100 text-yellow-800" },
	COMPLETED: { label: "Tamamlandı", className: "bg-green-100 text-green-800" },
	CANCELLED: { label: "İptal", className: "bg-gray-100 text-gray-700" },
};

interface Plan {
	id: number;
	customerName: string;
	customerPhone: string;
	customerEmail: string | null;
	totalAmount: number;
	installmentCount: number;
	installmentAmount: number;
	status: "ACTIVE" | "COMPLETED" | "CANCELLED";
	paidCount: number;
	totalPaid: number;
	remaining: number;
	product: { id: number; name: string } | null;
	createdAt: string;
}

function formatCurrency(n: number) {
	return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function EldenTaksitPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const queryClient = useQueryClient();

	const filters = { page, search, status: statusFilter };

	const { data, isLoading } = useQuery({
		queryKey: QUERY_KEYS.eldenTaksit.list(filters as Record<string, unknown>),
		queryFn: async () => {
			const params = new URLSearchParams({ page: String(page), limit: "20" });
			if (search) params.set("search", search);
			if (statusFilter) params.set("status", statusFilter);
			const res = await fetch(`/api/elden-taksit?${params}`);
			if (!res.ok) throw new Error("Yüklenemedi");
			return res.json();
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const res = await fetch(`/api/elden-taksit/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Silinemedi");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.eldenTaksit.lists(),
			});
			toast({ title: "Plan silindi" });
			setDeleteId(null);
		},
		onError: () => {
			toast({ title: "Silme başarısız", variant: "destructive" });
		},
	});

	const plans: Plan[] = data?.data || [];
	const meta = data?.meta || { total: 0, page: 1, totalPages: 0 };

	return (
		<div className="space-y-6">
			<PageHeader
				title="Elden Taksit"
				description="Tanıdık müşterilerin taksit planlarını yönetin"
			>
				<Button asChild>
					<Link href="/admin/elden-taksit/yeni">
						<Plus className="mr-2 h-4 w-4" />
						Yeni Plan
					</Link>
				</Button>
			</PageHeader>

			{/* Filtreler */}
			<div className="flex flex-wrap gap-3">
				<div className="relative flex-1 min-w-[200px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="İsim, telefon veya e-posta ara..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className="pl-10"
					/>
				</div>
				<Select
					value={statusFilter || "ALL"}
					onValueChange={(v) => {
						setStatusFilter(v === "ALL" ? "" : v);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue placeholder="Tüm Durumlar" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tüm Durumlar</SelectItem>
						<SelectItem value="ACTIVE">Aktif</SelectItem>
						<SelectItem value="COMPLETED">Tamamlandı</SelectItem>
						<SelectItem value="CANCELLED">İptal</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Tablo */}
			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<TableSkeleton rows={5} />
					) : plans.length === 0 ? (
						<EmptyState
							icon={Landmark}
							title="Henüz taksit planı yok"
							description="Yeni Plan butonu ile ilk planı oluşturun"
						/>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
										<th className="px-4 py-3">Müşteri</th>
										<th className="px-4 py-3">Ürün</th>
										<th className="px-4 py-3">Toplam</th>
										<th className="px-4 py-3">Ödenen</th>
										<th className="px-4 py-3">Kalan</th>
										<th className="px-4 py-3">Taksit</th>
										<th className="px-4 py-3">Durum</th>
										<th className="px-4 py-3">İşlemler</th>
									</tr>
								</thead>
								<tbody>
									{plans.map((plan, i) => (
										<motion.tr
											key={plan.id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: i * 0.04 }}
											className="border-b hover:bg-muted/30 transition-colors"
										>
											<td className="px-4 py-3">
												<p className="font-medium">{plan.customerName}</p>
												<p className="text-xs text-muted-foreground">
													{plan.customerPhone}
												</p>
											</td>
											<td className="px-4 py-3 text-muted-foreground">
												{plan.product?.name || "—"}
											</td>
											<td className="px-4 py-3 font-medium">
												{formatCurrency(plan.totalAmount)}
											</td>
											<td className="px-4 py-3 text-green-700 font-medium">
												{formatCurrency(plan.totalPaid)}
											</td>
											<td className="px-4 py-3 text-red-600 font-medium">
												{formatCurrency(Math.max(0, plan.remaining))}
											</td>
											<td className="px-4 py-3">
												<span className="text-xs">
													{plan.paidCount}/{plan.installmentCount} ay
												</span>
											</td>
											<td className="px-4 py-3">
												<Badge
													variant="outline"
													className={statusMap[plan.status]?.className}
												>
													{statusMap[plan.status]?.label}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-1">
													<Button variant="ghost" size="sm" asChild>
														<Link href={`/admin/elden-taksit/${plan.id}`}>
															<Eye className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setDeleteId(plan.id)}
														className="text-destructive hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sayfalama */}
			{meta.totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Toplam {meta.total} plan
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={page <= 1}
							onClick={() => setPage(page - 1)}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="flex items-center px-3 text-sm">
							{page}/{meta.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= meta.totalPages}
							onClick={() => setPage(page + 1)}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Silme onayı */}
			<ConfirmDialog
				open={deleteId !== null}
				onOpenChange={(open) => !open && setDeleteId(null)}
				title="Planı Sil"
				description="Bu taksit planı ve tüm ödeme kayıtları kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
				confirmLabel="Evet, Sil"
				loading={deleteMutation.isPending}
				onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
			/>
		</div>
	);
}

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle,
	Clock,
	Mail,
	RotateCcw,
	Loader2,
	User,
	Phone,
	Package,
	ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/constants/query-keys";

interface Payment {
	id: number;
	installmentNo: number;
	dueDate: string;
	amount: number;
	isPaid: boolean;
	paidAt: string | null;
	paidAmount: number | null;
	notes: string | null;
}

interface Plan {
	id: number;
	customerName: string;
	customerPhone: string;
	customerEmail: string | null;
	customerNote?: string | null;
	productNote: string | null;
	totalAmount: number;
	installmentCount: number;
	installmentAmount: number;
	startDate: string;
	notes: string | null;
	status: "ACTIVE" | "COMPLETED" | "CANCELLED";
	installments: Payment[];
	product: { id: number; name: string; slug: string } | null;
	user: { id: string; name: string | null; email: string } | null;
}

const statusMap = {
	ACTIVE: { label: "Aktif", className: "bg-yellow-100 text-yellow-800" },
	COMPLETED: { label: "Tamamlandı", className: "bg-green-100 text-green-800" },
	CANCELLED: { label: "İptal", className: "bg-gray-100 text-gray-700" },
};

function formatCurrency(amount: number) {
	return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("tr-TR");
}

interface MarkPaidModalProps {
	payment: Payment | null;
	planId: number;
	onClose: () => void;
}

function MarkPaidModal({ payment, planId, onClose }: MarkPaidModalProps) {
	const queryClient = useQueryClient();
	const [paidAmount, setPaidAmount] = useState(payment ? String(payment.amount) : "");
	const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
	const [notes, setNotes] = useState("");

	const mutation = useMutation({
		mutationFn: async (body: object) => {
			const res = await fetch(
				`/api/elden-taksit/${planId}/payments/${payment?.id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
			);
			if (!res.ok) throw new Error("Güncellenemedi");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.eldenTaksit.detail(planId),
			});
			toast({ title: "Taksit ödendi olarak işaretlendi" });
			onClose();
		},
		onError: () => {
			toast({ title: "Bir hata oluştu", variant: "destructive" });
		},
	});

	if (!payment) return null;

	return (
		<Dialog open={!!payment} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>
						{payment.installmentNo}. Taksiti Ödendi İşaretle
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div className="space-y-1">
						<Label>Ödenen Tutar (₺)</Label>
						<Input
							type="number"
							step={0.01}
							value={paidAmount}
							onChange={(e) => setPaidAmount(e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label>Ödeme Tarihi</Label>
						<Input
							type="date"
							value={paidAt}
							onChange={(e) => setPaidAt(e.target.value)}
						/>
					</div>
					<div className="space-y-1">
						<Label>Not (Opsiyonel)</Label>
						<Textarea
							placeholder="Ödeme notu..."
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
						İptal
					</Button>
					<Button
						onClick={() =>
							mutation.mutate({
								isPaid: true,
								paidAmount: Number(paidAmount),
								paidAt,
								notes: notes || undefined,
							})
						}
						disabled={mutation.isPending}
					>
						{mutation.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Onayla
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function EldenTaksitPlanDetail({ plan }: { plan: Plan }) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [markPaidPayment, setMarkPaidPayment] = useState<Payment | null>(null);

	const paidInstallments = plan.installments.filter((i) => i.isPaid);
	const totalPaid = paidInstallments.reduce(
		(sum, i) => sum + (i.paidAmount ?? i.amount),
		0,
	);
	const remaining = plan.totalAmount - totalPaid;
	const progressPercent = Math.round((totalPaid / plan.totalAmount) * 100);

	const revertMutation = useMutation({
		mutationFn: async (paymentId: number) => {
			const res = await fetch(
				`/api/elden-taksit/${plan.id}/payments/${paymentId}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ isPaid: false }),
				},
			);
			if (!res.ok) throw new Error("Geri alınamadı");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.eldenTaksit.detail(plan.id),
			});
			router.refresh();
			toast({ title: "Ödeme geri alındı" });
		},
		onError: () => {
			toast({ title: "Bir hata oluştu", variant: "destructive" });
		},
	});

	const sendEmailMutation = useMutation({
		mutationFn: async ({
			type,
			paymentId,
		}: {
			type: "created" | "reminder";
			paymentId?: number;
		}) => {
			const res = await fetch(`/api/elden-taksit/${plan.id}/send-email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type, paymentId }),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Mail gönderilemedi");
			}
			return res.json();
		},
		onSuccess: () => {
			toast({ title: "E-posta gönderildi" });
		},
		onError: (err: Error) => {
			toast({ title: err.message, variant: "destructive" });
		},
	});

	return (
		<div className="space-y-6">
			{/* Geri butonu */}
			<Button variant="ghost" size="sm" asChild className="-ml-2">
				<Link href="/admin/elden-taksit">
					<ChevronLeft className="mr-1 h-4 w-4" />
					Listeye Dön
				</Link>
			</Button>

			{/* Üst banner */}
			<Card>
				<CardContent className="py-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<div className="flex items-center gap-3 mb-1">
								<h1 className="text-xl font-bold">{plan.customerName}</h1>
								<Badge
									className={statusMap[plan.status]?.className}
									variant="outline"
								>
									{statusMap[plan.status]?.label}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">{plan.customerPhone}</p>
						</div>
						<div className="flex gap-3 text-right">
							<div>
								<p className="text-xs text-muted-foreground">Toplam</p>
								<p className="font-bold text-lg">{formatCurrency(plan.totalAmount)}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Ödenen</p>
								<p className="font-bold text-lg text-green-600">
									{formatCurrency(totalPaid)}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Kalan</p>
								<p className="font-bold text-lg text-red-600">
									{formatCurrency(Math.max(0, remaining))}
								</p>
							</div>
						</div>
					</div>
					<div className="mt-4 space-y-1">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>
								{paidInstallments.length}/{plan.installmentCount} taksit ödendi
							</span>
							<span>%{progressPercent}</span>
						</div>
						<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
							<div
								className="h-full rounded-full bg-green-500 transition-all"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Müşteri bilgileri */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<User className="h-4 w-4" /> Müşteri Bilgileri
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center gap-2">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<span>{plan.customerPhone}</span>
						</div>
						{plan.customerEmail && (
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span>{plan.customerEmail}</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										sendEmailMutation.mutate({ type: "created" })
									}
									disabled={sendEmailMutation.isPending}
								>
									{sendEmailMutation.isPending ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										<Mail className="h-3 w-3" />
									)}
									<span className="ml-1">Plan Maili</span>
								</Button>
							</div>
						)}
						{plan.user && (
							<div className="text-xs text-muted-foreground">
								Sisteme bağlı:{" "}
								<span className="font-medium text-foreground">
									{plan.user.name || plan.user.email}
								</span>
							</div>
						)}
						{plan.notes && (
							<div className="mt-2 rounded-md bg-muted p-3 text-xs">
								{plan.notes}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Ürün bilgisi */}
				<Card>
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<Package className="h-4 w-4" /> Ürün Bilgisi
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						{plan.product ? (
							<p className="font-medium">{plan.product.name}</p>
						) : (
							<p className="text-muted-foreground">Katalog ürünü yok</p>
						)}
						{plan.productNote && (
							<div className="rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
								{plan.productNote}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Taksit Tablosu */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">
						Taksit Planı ({plan.installmentCount} ay × {formatCurrency(plan.installmentAmount)})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
									<th className="px-4 py-3">#</th>
									<th className="px-4 py-3">Vade Tarihi</th>
									<th className="px-4 py-3">Tutar</th>
									<th className="px-4 py-3">Durum</th>
									<th className="px-4 py-3">Ödeme Tarihi</th>
									<th className="px-4 py-3">İşlemler</th>
								</tr>
							</thead>
							<tbody>
								{plan.installments.map((payment) => (
									<tr
										key={payment.id}
										className={`border-b transition-colors ${
											payment.isPaid
												? "bg-green-50/50"
												: new Date(payment.dueDate) < new Date()
													? "bg-red-50/50"
													: ""
										}`}
									>
										<td className="px-4 py-3 font-medium text-muted-foreground">
											{payment.installmentNo}
										</td>
										<td className="px-4 py-3">{formatDate(payment.dueDate)}</td>
										<td className="px-4 py-3 font-medium">
											{formatCurrency(payment.amount)}
										</td>
										<td className="px-4 py-3">
											{payment.isPaid ? (
												<span className="inline-flex items-center gap-1 text-green-700">
													<CheckCircle className="h-3.5 w-3.5" />
													Ödendi
													{payment.paidAmount && payment.paidAmount !== payment.amount && (
														<span className="text-xs text-muted-foreground">
															({formatCurrency(payment.paidAmount)})
														</span>
													)}
												</span>
											) : (
												<span className="inline-flex items-center gap-1 text-yellow-700">
													<Clock className="h-3.5 w-3.5" />
													Bekliyor
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{payment.paidAt ? formatDate(payment.paidAt) : "—"}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1">
												{payment.isPaid ? (
													<Button
														size="sm"
														variant="ghost"
														className="h-7 text-xs"
														onClick={() => revertMutation.mutate(payment.id)}
														disabled={revertMutation.isPending}
													>
														<RotateCcw className="mr-1 h-3 w-3" />
														Geri Al
													</Button>
												) : (
													<>
														<Button
															size="sm"
															variant="outline"
															className="h-7 text-xs"
															onClick={() => setMarkPaidPayment(payment)}
														>
															<CheckCircle className="mr-1 h-3 w-3" />
															Ödendi
														</Button>
														{plan.customerEmail && (
															<Button
																size="sm"
																variant="ghost"
																className="h-7 text-xs"
																onClick={() =>
																	sendEmailMutation.mutate({
																		type: "reminder",
																		paymentId: payment.id,
																	})
																}
																disabled={sendEmailMutation.isPending}
																title="Hatırlatma e-postası gönder"
															>
																{sendEmailMutation.isPending ? (
																	<Loader2 className="h-3 w-3 animate-spin" />
																) : (
																	<Mail className="h-3 w-3" />
																)}
															</Button>
														)}
													</>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Ödendi modal */}
			<MarkPaidModal
				payment={markPaidPayment}
				planId={plan.id}
				onClose={() => setMarkPaidPayment(null)}
			/>
		</div>
	);
}

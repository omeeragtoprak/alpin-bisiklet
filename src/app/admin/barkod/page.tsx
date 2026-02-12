"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

async function getProducts() {
	const res = await fetch("/api/products");
	if (!res.ok) throw new Error("Ürünler yüklenemedi");
	return res.json();
}

export default function BarcodePage() {
	const { data: productsData, isLoading, refetch } = useQuery({
		queryKey: ["products"],
		queryFn: getProducts,
	});
	const [search, setSearch] = useState("");
	const [updates, setUpdates] = useState<Record<number, { stock: number; price: number }>>({});
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const products = productsData?.data || [];

	const filteredProducts = products.filter((p: any) =>
		p.name.toLowerCase().includes(search.toLowerCase()) ||
		p.barcode?.includes(search) ||
		p.sku?.includes(search)
	);

	const handleUpdateChange = (id: number, field: "stock" | "price", value: number) => {
		setUpdates((prev) => ({
			...prev,
			[id]: {
				...prev[id],
				[field]: value,
				// Preserve other field if exists, or fetch from product
				stock: field === "stock" ? value : (prev[id]?.stock ?? products.find((p: any) => p.id === id)?.stock ?? 0),
				price: field === "price" ? value : (prev[id]?.price ?? parseFloat(products.find((p: any) => p.id === id)?.price ?? "0")),
			},
		}));
	};

	const handleSave = async (id: number) => {
		const update = updates[id];
		if (!update) return;

		try {
			setLoading(true);
			const res = await fetch(`/api/products/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(update),
			});

			if (!res.ok) throw new Error("Güncelleme başarısız");

			toast({
				title: "Başarılı",
				description: "Ürün güncellendi",
			});

			// Clear update for this id
			setUpdates((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			refetch();
		} catch (error) {
			toast({
				title: "Hata",
				description: "Güncelleme yapılamadı",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<PageHeader title="Barkod & Hizli Stok" description="Barkod okutarak hizli stok ve fiyat guncellemesi yapin" />
				<TableSkeleton rows={5} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Barkod & Hizli Stok" description="Barkod okutarak hizli stok ve fiyat guncellemesi yapin" />

			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Barkod, SKU veya İsim ara..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-8"
						autoFocus
					/>
				</div>
			</div>

			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Ürün Adı</TableHead>
							<TableHead>Barkod / SKU</TableHead>
							<TableHead>Fiyat</TableHead>
							<TableHead>Stok</TableHead>
							<TableHead className="w-[100px]">İşlem</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
									Ürün bulunamadı.
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((product: any) => {
								const currentUpdate = updates[product.id];
								const currentPrice = currentUpdate?.price ?? parseFloat(product.price);
								const currentStock = currentUpdate?.stock ?? product.stock;
								const hasChanges = currentUpdate !== undefined;

								return (
									<TableRow key={product.id}>
										<TableCell className="font-medium">
											<div className="flex flex-col">
												<span>{product.name}</span>
												<span className="text-xs text-muted-foreground">{product.category?.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col text-sm">
												{product.barcode && <span>Barkod: {product.barcode}</span>}
												{product.sku && <span>SKU: {product.sku}</span>}
												{!product.barcode && !product.sku && <span className="text-muted-foreground">-</span>}
											</div>
										</TableCell>
										<TableCell>
											<Input
												type="number"
												value={currentPrice}
												onChange={(e) =>
													handleUpdateChange(product.id, "price", parseFloat(e.target.value))
												}
												className="w-24"
											/>
										</TableCell>
										<TableCell>
											<Input
												type="number"
												value={currentStock}
												onChange={(e) =>
													handleUpdateChange(product.id, "stock", parseInt(e.target.value))
												}
												className="w-24"
											/>
										</TableCell>
										<TableCell>
											<Button
												size="sm"
												onClick={() => handleSave(product.id)}
												disabled={!hasChanges || loading}
											>
												{loading && hasChanges ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Save className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

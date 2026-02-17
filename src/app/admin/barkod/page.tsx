"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Loader2,
	ScanBarcode,
	Search,
	Save,
	CheckCircle2,
	AlertTriangle,
	ExternalLink,
	Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

interface Product {
	id: number;
	name: string;
	price: string;
	stock: number;
	barcode: string | null;
	sku: string | null;
	category: { name: string } | null;
	brand: { name: string } | null;
	images: { url: string; alt: string }[];
}

async function searchByBarcode(code: string): Promise<{ data: Product } | null> {
	const res = await fetch(`/api/products/barcode/${encodeURIComponent(code)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("Barkod araması başarısız");
	return res.json();
}

async function getCategories() {
	const res = await fetch("/api/categories");
	if (!res.ok) throw new Error("Kategoriler yüklenemedi");
	return res.json();
}

async function getBrands() {
	const res = await fetch("/api/brands");
	if (!res.ok) throw new Error("Markalar yüklenemedi");
	return res.json();
}

type SearchResult =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "found"; product: Product }
	| { status: "not_found"; barcode: string };

export default function BarcodePage() {
	const [barcodeInput, setBarcodeInput] = useState("");
	const [result, setResult] = useState<SearchResult>({ status: "idle" });
	const [editStock, setEditStock] = useState(0);
	const [editPrice, setEditPrice] = useState(0);
	const [updating, setUpdating] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	// New product form state
	const [newProduct, setNewProduct] = useState({
		name: "",
		price: "",
		stock: "",
		sku: "",
		categoryId: "",
		brandId: "",
	});
	const [creating, setCreating] = useState(false);

	const { data: categoriesData } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	});

	const { data: brandsData } = useQuery({
		queryKey: ["brands"],
		queryFn: getBrands,
	});

	const categories = categoriesData?.data || [];
	const brands = brandsData?.data || [];

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSearch = async () => {
		const code = barcodeInput.trim();
		if (!code) return;

		setResult({ status: "loading" });
		setBarcodeInput("");

		try {
			const data = await searchByBarcode(code);
			if (data?.data) {
				const product = data.data;
				setResult({ status: "found", product });
				setEditStock(product.stock);
				setEditPrice(parseFloat(product.price));
			} else {
				setResult({ status: "not_found", barcode: code });
				setNewProduct({
					name: "",
					price: "",
					stock: "",
					sku: "",
					categoryId: "",
					brandId: "",
				});
			}
		} catch {
			toast({
				title: "Hata",
				description: "Barkod araması sırasında bir hata oluştu",
				variant: "destructive",
			});
			setResult({ status: "idle" });
		}

		// Re-focus for continuous scanning
		setTimeout(() => inputRef.current?.focus(), 100);
	};

	const handleUpdate = async () => {
		if (result.status !== "found") return;

		try {
			setUpdating(true);
			const res = await fetch(`/api/products/${result.product.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ stock: editStock, price: editPrice }),
			});

			if (!res.ok) throw new Error("Güncelleme başarısız");

			const updated = await res.json();
			setResult({
				status: "found",
				product: { ...result.product, stock: editStock, price: String(editPrice), ...updated.data },
			});

			toast({
				title: "Başarılı",
				description: "Ürün stok ve fiyat bilgisi güncellendi",
			});
		} catch {
			toast({
				title: "Hata",
				description: "Güncelleme yapılamadı",
				variant: "destructive",
			});
		} finally {
			setUpdating(false);
		}
	};

	const handleCreateProduct = async () => {
		if (result.status !== "not_found") return;

		if (!newProduct.name || !newProduct.price || !newProduct.stock) {
			toast({
				title: "Eksik Alan",
				description: "Ürün adı, fiyat ve stok alanları zorunludur",
				variant: "destructive",
			});
			return;
		}

		try {
			setCreating(true);
			const body: Record<string, unknown> = {
				name: newProduct.name,
				price: parseFloat(newProduct.price),
				stock: parseInt(newProduct.stock),
				barcode: result.barcode,
			};
			if (newProduct.sku) body.sku = newProduct.sku;
			if (newProduct.categoryId) body.categoryId = parseInt(newProduct.categoryId);
			if (newProduct.brandId) body.brandId = parseInt(newProduct.brandId);

			const res = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || "Ürün oluşturulamadı");
			}

			toast({
				title: "Başarılı",
				description: `"${newProduct.name}" ürünü başarıyla eklendi`,
			});

			setResult({ status: "idle" });
			setNewProduct({
				name: "",
				price: "",
				stock: "",
				sku: "",
				categoryId: "",
				brandId: "",
			});
		} catch (error) {
			toast({
				title: "Hata",
				description: error instanceof Error ? error.message : "Ürün oluşturulamadı",
				variant: "destructive",
			});
		} finally {
			setCreating(false);
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Barkod & Ürün Ekleme"
				description="Barkod okutarak ürün bilgilerini görüntüleyin, güncelleyin veya yeni ürün ekleyin"
			/>

			{/* Hero Barcode Scanner Section */}
			<Card className="border-2 border-dashed border-primary/30 bg-primary/5">
				<CardContent className="flex flex-col items-center gap-4 py-8">
					<div className="rounded-full bg-primary/10 p-4">
						<ScanBarcode className="h-12 w-12 text-primary" />
					</div>
					<div className="text-center">
						<h2 className="text-xl font-semibold">Barkodu Okutun</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Barkod cihazını kullanarak ürün barkodunu okutun veya manuel girin
						</p>
					</div>
					<div className="flex w-full max-w-md gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								ref={inputRef}
								placeholder="Barkod numarasını girin..."
								value={barcodeInput}
								onChange={(e) => setBarcodeInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSearch();
								}}
								className="pl-10 h-12 text-lg"
								autoFocus
							/>
						</div>
						<Button
							onClick={handleSearch}
							disabled={!barcodeInput.trim() || result.status === "loading"}
							className="h-12 px-6"
						>
							{result.status === "loading" ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<>
									<Search className="h-5 w-5 mr-2" />
									Ara
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Result: Product Found */}
			{result.status === "found" && (
				<Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
					<CardHeader>
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
							<CardTitle className="text-green-800 dark:text-green-300">
								Ürün Bulundu
							</CardTitle>
						</div>
						<CardDescription className="text-green-700 dark:text-green-400">
							Aşağıdaki ürün barkod ile eşleşti
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-6">
							{/* Product Image */}
							{result.product.images?.[0] && (
								<div className="w-32 h-32 rounded-lg overflow-hidden border bg-white flex-shrink-0">
									<Image
										src={result.product.images[0].url}
										alt={result.product.images[0].alt || result.product.name}
										width={128}
										height={128}
										className="w-full h-full object-cover"
									/>
								</div>
							)}

							{/* Product Info */}
							<div className="flex-1 space-y-3">
								<div>
									<h3 className="text-lg font-semibold">{result.product.name}</h3>
									<div className="flex flex-wrap gap-2 mt-1">
										{result.product.category && (
											<Badge variant="secondary">
												{result.product.category.name}
											</Badge>
										)}
										{result.product.brand && (
											<Badge variant="outline">
												{result.product.brand.name}
											</Badge>
										)}
									</div>
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
									<div>
										<span className="text-muted-foreground">Barkod:</span>
										<p className="font-mono font-medium">{result.product.barcode || "-"}</p>
									</div>
									<div>
										<span className="text-muted-foreground">SKU:</span>
										<p className="font-mono font-medium">{result.product.sku || "-"}</p>
									</div>
									<div>
										<span className="text-muted-foreground">Mevcut Stok:</span>
										<p className="font-medium">{result.product.stock}</p>
									</div>
									<div>
										<span className="text-muted-foreground">Mevcut Fiyat:</span>
										<p className="font-medium">
											{parseFloat(result.product.price).toLocaleString("tr-TR", {
												style: "currency",
												currency: "TRY",
											})}
										</p>
									</div>
								</div>

								{/* Editable Fields */}
								<div className="flex flex-wrap items-end gap-4 pt-3 border-t">
									<div className="space-y-1">
										<Label htmlFor="edit-stock">Stok</Label>
										<Input
											id="edit-stock"
											type="number"
											value={editStock}
											onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
											className="w-28"
										/>
									</div>
									<div className="space-y-1">
										<Label htmlFor="edit-price">Fiyat (TL)</Label>
										<Input
											id="edit-price"
											type="number"
											step="0.01"
											value={editPrice}
											onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
											className="w-32"
										/>
									</div>
									<Button onClick={handleUpdate} disabled={updating}>
										{updating ? (
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
										) : (
											<Save className="h-4 w-4 mr-2" />
										)}
										Güncelle
									</Button>
									<Link href={`/admin/urunler/${result.product.id}`}>
										<Button variant="outline" size="sm">
											<ExternalLink className="h-4 w-4 mr-2" />
											Ürün Detayına Git
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Result: Product Not Found */}
			{result.status === "not_found" && (
				<div className="space-y-4">
					<Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
						<CardContent className="flex items-center gap-3 py-4">
							<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
							<div>
								<p className="font-medium text-amber-800 dark:text-amber-300">
									Bu barkoda ait ürün bulunamadı
								</p>
								<p className="text-sm text-amber-700 dark:text-amber-400">
									Barkod: <span className="font-mono font-semibold">{result.barcode}</span> — Aşağıdaki formu doldurarak yeni ürün ekleyebilirsiniz.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* New Product Form */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Package className="h-5 w-5 text-primary" />
								<CardTitle>Yeni Ürün Ekle</CardTitle>
							</div>
							<CardDescription>
								Okutulan barkod ile yeni bir ürün kaydı oluşturun
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Barcode (readonly) */}
								<div className="space-y-1">
									<Label htmlFor="new-barcode">Barkod</Label>
									<Input
										id="new-barcode"
										value={result.barcode}
										readOnly
										className="bg-muted font-mono"
									/>
								</div>

								{/* Product Name */}
								<div className="space-y-1">
									<Label htmlFor="new-name">
										Ürün Adı <span className="text-destructive">*</span>
									</Label>
									<Input
										id="new-name"
										placeholder="Ürün adını girin"
										value={newProduct.name}
										onChange={(e) =>
											setNewProduct((p) => ({ ...p, name: e.target.value }))
										}
									/>
								</div>

								{/* Price */}
								<div className="space-y-1">
									<Label htmlFor="new-price">
										Fiyat (TL) <span className="text-destructive">*</span>
									</Label>
									<Input
										id="new-price"
										type="number"
										step="0.01"
										placeholder="0.00"
										value={newProduct.price}
										onChange={(e) =>
											setNewProduct((p) => ({ ...p, price: e.target.value }))
										}
									/>
								</div>

								{/* Stock */}
								<div className="space-y-1">
									<Label htmlFor="new-stock">
										Stok <span className="text-destructive">*</span>
									</Label>
									<Input
										id="new-stock"
										type="number"
										placeholder="0"
										value={newProduct.stock}
										onChange={(e) =>
											setNewProduct((p) => ({ ...p, stock: e.target.value }))
										}
									/>
								</div>

								{/* SKU */}
								<div className="space-y-1">
									<Label htmlFor="new-sku">SKU</Label>
									<Input
										id="new-sku"
										placeholder="Opsiyonel"
										value={newProduct.sku}
										onChange={(e) =>
											setNewProduct((p) => ({ ...p, sku: e.target.value }))
										}
									/>
								</div>

								{/* Category */}
								<div className="space-y-1">
									<Label>Kategori</Label>
									<Select
										value={newProduct.categoryId}
										onValueChange={(val) =>
											setNewProduct((p) => ({ ...p, categoryId: val }))
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Kategori seçin" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat: { id: number; name: string }) => (
												<SelectItem key={cat.id} value={String(cat.id)}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Brand */}
								<div className="space-y-1">
									<Label>Marka</Label>
									<Select
										value={newProduct.brandId}
										onValueChange={(val) =>
											setNewProduct((p) => ({ ...p, brandId: val }))
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Marka seçin" />
										</SelectTrigger>
										<SelectContent>
											{brands.map((brand: { id: number; name: string }) => (
												<SelectItem key={brand.id} value={String(brand.id)}>
													{brand.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="mt-6 flex justify-end">
								<Button
									onClick={handleCreateProduct}
									disabled={creating || !newProduct.name || !newProduct.price || !newProduct.stock}
									size="lg"
								>
									{creating ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<Package className="h-4 w-4 mr-2" />
									)}
									Ürünü Kaydet
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

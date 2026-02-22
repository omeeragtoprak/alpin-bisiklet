"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	Filter,
	Grid,
	List,
	LayoutGrid,
	SlidersHorizontal,
	X,
	ChevronDown,
	Search,
	Bike,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/use-cart-store";
import { Separator } from "@/components/ui/separator";
import { BicycleFinder } from "@/components/store/bicycle-finder/bicycle-finder";

interface FilterState {
	search: string;
	categoryId: string;
	brandId: string;
	minPrice: number;
	maxPrice: number;
	inStock: boolean;
	sort: string;
	page: number;
	riderHeight: number;
	riderInseam: number;
}

function FilterSidebar({
	filters,
	setFilters,
	categories,
	brands,
	categoriesLoading,
	brandsLoading,
}: {
	filters: FilterState;
	setFilters: (f: Partial<FilterState>) => void;
	categories: any[];
	brands: any[];
	categoriesLoading?: boolean;
	brandsLoading?: boolean;
}) {
	return (
		<div className="space-y-1">
			<Accordion
				type="multiple"
				defaultValue={["categories", "brands", "price"]}
				className="w-full"
			>
				{/* Kategori Filtresi */}
				<AccordionItem value="categories">
					<AccordionTrigger className="text-sm font-semibold">
						Kategoriler
					</AccordionTrigger>
					<AccordionContent>
						{categoriesLoading ? (
							<div className="space-y-2 py-1">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-7 bg-muted animate-pulse rounded" />
								))}
							</div>
						) : (
							<div className="space-y-2">
								<button
									type="button"
									onClick={() => setFilters({ categoryId: "" })}
									className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors ${!filters.categoryId
											? "text-primary font-medium"
											: "text-muted-foreground"
										}`}
								>
									Tümü
								</button>
								{categories.map((cat: any) => (
									<button
										key={cat.id}
										type="button"
										onClick={() =>
											setFilters({
												categoryId: cat.id.toString(),
											})
										}
										className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors flex justify-between ${filters.categoryId ===
												cat.id.toString()
												? "text-primary font-medium bg-primary/5"
												: "text-muted-foreground"
											}`}
									>
										<span>{cat.name}</span>
										<span className="text-xs opacity-60">
											{cat._count?.products || 0}
										</span>
									</button>
								))}
							</div>
						)}
					</AccordionContent>
				</AccordionItem>

				{/* Marka Filtresi */}
				<AccordionItem value="brands">
					<AccordionTrigger className="text-sm font-semibold">
						Markalar
					</AccordionTrigger>
					<AccordionContent>
						{brandsLoading ? (
							<div className="space-y-2 py-1">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-7 bg-muted animate-pulse rounded" />
								))}
							</div>
						) : (
							<div className="space-y-2">
								<button
									type="button"
									onClick={() => setFilters({ brandId: "" })}
									className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors ${!filters.brandId
											? "text-primary font-medium"
											: "text-muted-foreground"
										}`}
								>
									Tümü
								</button>
								{brands.map((brand: any) => (
									<button
										key={brand.id}
										type="button"
										onClick={() =>
											setFilters({
												brandId: brand.id.toString(),
											})
										}
										className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-muted transition-colors flex justify-between ${filters.brandId ===
												brand.id.toString()
												? "text-primary font-medium bg-primary/5"
												: "text-muted-foreground"
											}`}
									>
										<span>{brand.name}</span>
										<span className="text-xs opacity-60">
											{brand._count?.products || 0}
										</span>
									</button>
								))}
								{!brandsLoading && brands.length === 0 && (
									<p className="text-xs text-muted-foreground px-2">
										Bu kategoride marka bulunamadı.
									</p>
								)}
							</div>
						)}
					</AccordionContent>
				</AccordionItem>

				{/* Fiyat Filtresi */}
				<AccordionItem value="price">
					<AccordionTrigger className="text-sm font-semibold">
						Fiyat Aralığı
					</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4 px-1">
							<Slider
								min={0}
								max={50000}
								step={100}
								value={[filters.minPrice, filters.maxPrice]}
								onValueChange={([min, max]) =>
									setFilters({
										minPrice: min,
										maxPrice: max,
									})
								}
							/>
							<div className="flex items-center gap-2 text-sm">
								<Input
									type="number"
									value={filters.minPrice}
									onChange={(e) =>
										setFilters({
											minPrice: Number(e.target.value),
										})
									}
									className="h-8 text-xs"
									aria-label="Minimum fiyat"
								/>
								<span className="text-muted-foreground">-</span>
								<Input
									type="number"
									value={filters.maxPrice}
									onChange={(e) =>
										setFilters({
											maxPrice: Number(e.target.value),
										})
									}
									className="h-8 text-xs"
									aria-label="Maksimum fiyat"
								/>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* Stok Durumu */}
				<AccordionItem value="stock">
					<AccordionTrigger className="text-sm font-semibold">
						Stok Durumu
					</AccordionTrigger>
					<AccordionContent>
						<label className="flex items-center gap-2 cursor-pointer text-sm">
							<Checkbox
								checked={filters.inStock}
								onCheckedChange={(checked) =>
									setFilters({ inStock: !!checked })
								}
							/>
							Sadece stokta olanlar
						</label>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [view, setView] = useState<"grid" | "grid4" | "list">("grid");
	const [bicycleFinderOpen, setBicycleFinderOpen] = useState(false);
	const [filters, setFiltersState] = useState<FilterState>({
		search: searchParams.get("search") || "",
		categoryId: searchParams.get("categoryId") || "",
		brandId: searchParams.get("brandId") || "",
		minPrice: 0,
		maxPrice: 50000,
		inStock: false,
		sort: "newest",
		page: 1,
		riderHeight: 0,
		riderInseam: 0,
	});

	const setFilters = useCallback((partial: Partial<FilterState>) => {
		setFiltersState((prev) => ({ ...prev, ...partial, page: 1 }));
	}, []);

	// Fetch categories
	const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
		queryKey: ["store-categories"],
		queryFn: async () => {
			const res = await fetch("/api/categories");
			if (!res.ok) throw new Error("Kategoriler yüklenemedi");
			const json = await res.json();
			return json.data || [];
		},
	});

	// Navbar'dan gelen ?kategori=slug parametresini categoryId'ye çevir
	const kategoriSlug = searchParams.get("kategori");
	useEffect(() => {
		if (!categoriesData || !categoriesData.length) return;
		if (!kategoriSlug) return;
		const cat = categoriesData.find((c: any) => c.slug === kategoriSlug);
		if (cat && cat.id.toString() !== filters.categoryId) {
			setFiltersState((prev) => ({ ...prev, categoryId: cat.id.toString(), page: 1 }));
		}
	}, [kategoriSlug, categoriesData]);

	// Fetch brands — seçili kategorideki ürünlerin markaları göster
	const { data: brandsData, isLoading: brandsLoading } = useQuery({
		queryKey: ["store-brands", filters.categoryId],
		queryFn: async () => {
			const url = filters.categoryId
				? `/api/brands?categoryId=${filters.categoryId}`
				: "/api/brands";
			const res = await fetch(url);
			const json = await res.json();
			return json.data || [];
		},
		staleTime: 60 * 1000,
	});

	// kategori slug varken categoryId henüz çözülmediyse ürün sorgusu beklesin
	const pendingCategoryResolve = !!kategoriSlug && !filters.categoryId && !categoriesLoading;

	// Fetch products
	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["products", filters],
		enabled: !pendingCategoryResolve,
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", filters.page.toString());
			params.set("limit", "20");
			if (filters.search) params.set("search", filters.search);
			if (filters.categoryId)
				params.set("categoryId", filters.categoryId);
			if (filters.brandId) params.set("brandId", filters.brandId);
			if (filters.inStock) params.set("inStock", "true");
			if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString());
			if (filters.maxPrice < 50000) params.set("maxPrice", filters.maxPrice.toString());
			// sort: "price-asc" → "price_asc" (API formatı)
			if (filters.sort) params.set("orderBy", filters.sort.replace(/-/g, "_"));
			if (filters.riderHeight > 0) params.set("riderHeight", filters.riderHeight.toString());
			if (filters.riderInseam > 0) params.set("riderInseam", filters.riderInseam.toString());

			const res = await fetch(`/api/products?${params}`);
			return res.json();
		},
	});

	const activeFilterCount = [
		filters.categoryId,
		filters.brandId,
		filters.minPrice > 0,
		filters.maxPrice < 50000,
		filters.inStock,
		filters.riderHeight > 0,
	].filter(Boolean).length;

	const clearFilters = () => {
		setFiltersState({
			search: "",
			categoryId: "",
			brandId: "",
			minPrice: 0,
			maxPrice: 50000,
			inStock: false,
			sort: "newest",
			page: 1,
			riderHeight: 0,
			riderInseam: 0,
		});
	};

	const selectedCategoryType = categoriesData?.find(
		(c: any) => c.id.toString() === filters.categoryId
	)?.type ?? "GENERAL";

	// Bisiklet kategorisine girilince dialogu otomatik aç (yalnızca ilk ziyarette)
	const prevCategoryTypeRef = useRef<string>("GENERAL");
	useEffect(() => {
		if (
			selectedCategoryType === "BICYCLE" &&
			prevCategoryTypeRef.current !== "BICYCLE"
		) {
			const alreadySeen = localStorage.getItem("alpin_bike_finder_seen");
			if (!alreadySeen) {
				setBicycleFinderOpen(true);
			}
		}
		prevCategoryTypeRef.current = selectedCategoryType;
	}, [selectedCategoryType]);

	return (
		<>
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Tüm Ürünler</h1>
				<p className="text-muted-foreground">
					{data?.meta?.total || 0} ürün bulundu
				</p>
			</div>

			<div className="flex gap-8">
				{/* Desktop Sidebar */}
				<aside className="hidden lg:block w-64 shrink-0">
					<div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 pr-1">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold flex items-center gap-2">
								<SlidersHorizontal className="h-4 w-4" />
								Filtreler
							</h2>
							{activeFilterCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="text-xs h-7"
								>
									Temizle ({activeFilterCount})
								</Button>
							)}
						</div>
						<Separator />
						<FilterSidebar
							filters={filters}
							setFilters={setFilters}
							categories={categoriesData || []}
							brands={brandsData || []}
							categoriesLoading={categoriesLoading}
							brandsLoading={brandsLoading}
						/>
					</div>
				</aside>

				{/* Main Content */}
				<div className="flex-1 min-w-0">
					{/* Toolbar */}
					<div className="flex flex-col sm:flex-row gap-3 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Ürün ara..."
								value={filters.search}
								onChange={(e) =>
									setFilters({ search: e.target.value })
								}
								className="pl-9"
								aria-label="Ürün arama"
							/>
						</div>
						<div className="flex gap-2">
							{/* Bisiklet Bulucu Butonu */}
							{selectedCategoryType === "BICYCLE" && (
								<Button
									variant="outline"
									onClick={() => setBicycleFinderOpen(true)}
									className="border-primary/50 text-primary hover:bg-primary/10"
								>
									<Bike className="h-4 w-4 mr-2" />
									Bisiklet Bulucu
								</Button>
							)}
							{/* Mobile Filter Button */}
							<Sheet>
								<SheetTrigger asChild>
									<Button
										variant="outline"
										className="lg:hidden"
									>
										<Filter className="h-4 w-4 mr-2" />
										Filtreler
										{activeFilterCount > 0 && (
											<span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
												{activeFilterCount}
											</span>
										)}
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-80">
									<SheetHeader>
										<SheetTitle>Filtreler</SheetTitle>
									</SheetHeader>
									<div className="mt-4">
										<FilterSidebar
											filters={filters}
											setFilters={setFilters}
											categories={categoriesData || []}
											brands={brandsData || []}
											categoriesLoading={categoriesLoading}
										/>
									</div>
								</SheetContent>
							</Sheet>

							<Select
								value={filters.sort}
								onValueChange={(v) =>
									setFilters({ sort: v })
								}
							>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue placeholder="Sırala" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">
										En Yeni
									</SelectItem>
									<SelectItem value="price-asc">
										Fiyat: Düşük → Yüksek
									</SelectItem>
									<SelectItem value="price-desc">
										Fiyat: Yüksek → Düşük
									</SelectItem>
									<SelectItem value="name-asc">
										İsim: A → Z
									</SelectItem>
								</SelectContent>
							</Select>

							<div className="hidden sm:flex gap-1">
								<Button
									variant={view === "grid" ? "default" : "outline"}
									size="icon"
									onClick={() => setView("grid")}
									aria-label="3'lü grid görünümü"
									title="3'lü görünüm"
								>
									<Grid className="h-4 w-4" />
								</Button>
								<Button
									variant={view === "grid4" ? "default" : "outline"}
									size="icon"
									onClick={() => setView("grid4")}
									aria-label="4'lü grid görünümü"
									title="4'lü görünüm"
								>
									<LayoutGrid className="h-4 w-4" />
								</Button>
								<Button
									variant={view === "list" ? "default" : "outline"}
									size="icon"
									onClick={() => setView("list")}
									aria-label="Listeleme görünümü"
									title="Liste görünümü"
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Active Filters Tags */}
					{activeFilterCount > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{filters.categoryId && (
								<span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
									{categoriesData?.find(
										(c: any) =>
											c.id.toString() ===
											filters.categoryId,
									)?.name || "Kategori"}
									<button
										type="button"
										onClick={() =>
											setFilters({ categoryId: "" })
										}
										aria-label="Kategori filtresini kaldır"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
							{filters.brandId && (
								<span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
									{brandsData?.find(
										(b: any) =>
											b.id.toString() ===
											filters.brandId,
									)?.name || "Marka"}
									<button
										type="button"
										onClick={() =>
											setFilters({ brandId: "" })
										}
										aria-label="Marka filtresini kaldır"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
							{filters.riderHeight > 0 && (
								<span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-full">
									<Bike className="h-3 w-3" />
									Boy: {filters.riderHeight} cm / Bacak: {filters.riderInseam} cm
									<button
										type="button"
										onClick={() =>
											setFilters({ riderHeight: 0, riderInseam: 0 })
										}
										aria-label="Ölçü filtresini kaldır"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							)}
						</div>
					)}

					{/* Products */}
					{isLoading ? (
						<div
							className={
								view === "grid"
									? "grid grid-cols-2 md:grid-cols-3 gap-4"
									: view === "grid4"
									? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
									: "space-y-4"
							}
						>
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={`skeleton-${i}`}
									className="bg-muted animate-pulse rounded-xl aspect-[3/4]"
								/>
							))}
						</div>
					) : data?.data?.length === 0 ? (
						<div className="text-center py-20">
							<p className="text-lg font-semibold">
								Ürün bulunamadı
							</p>
							<p className="text-muted-foreground text-sm mt-2">
								Farklı filtreler deneyebilirsiniz.
							</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={clearFilters}
							>
								Filtreleri Temizle
							</Button>
						</div>
					) : (
						<>
							<div
								className={
									view === "grid"
										? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
										: view === "grid4"
										? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
										: "space-y-4"
								}
							>
								{data?.data?.map(
									(product: any, index: number) => (
										<motion.div
											key={product.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.3,
												delay: index * 0.03,
											}}
										>
											<Link
												href={`/urunler/${product.slug}`}
												className={
													view !== "list"
														? "block group"
														: "flex gap-4 p-4 bg-background border rounded-lg hover:shadow-md transition-shadow"
												}
											>
												<div
													className={
														view !== "list"
															? "aspect-square bg-muted rounded-xl overflow-hidden mb-3 relative"
															: "w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative"
													}
												>
													{product.images?.[0]
														?.url ? (
														<Image
															src={
																product
																	.images[0]
																	.url
															}
															alt={product.name}
															fill
															className="object-cover group-hover:scale-105 transition-transform duration-300"
															sizes="(max-width: 768px) 50vw, 33vw"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
															Görsel Yok
														</div>
													)}
													{product.isFeatured && (
														<div className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded">
															ÖNE ÇIKAN
														</div>
													)}
													{product.stock <= 0 && (
														<div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded">
															TÜKENDİ
														</div>
													)}
												</div>
												<div className="flex-1">
													{product.brand?.name && (
														<p className="text-xs text-muted-foreground mb-1">
															{
																product.brand
																	.name
															}
														</p>
													)}
													<h3 className="font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
														{product.name}
													</h3>
													{product.category
														?.name && (
															<p className="text-sm text-muted-foreground mb-2">
																{
																	product.category
																		.name
																}
															</p>
														)}
													<div className="flex items-center gap-2">
														<span className="font-bold text-primary">
															{Number(
																product.price,
															).toLocaleString(
																"tr-TR",
															)}{" "}
															TL
														</span>
														{product.comparePrice && (
															<span className="text-sm text-muted-foreground line-through">
																{Number(
																	product.comparePrice,
																).toLocaleString(
																	"tr-TR",
																)}{" "}
																TL
															</span>
														)}
													</div>
												</div>
											</Link>
										</motion.div>
									),
								)}
							</div>

							{/* Pagination */}
							{data?.meta &&
								data.meta.totalPages > 1 && (
									<div className="flex items-center justify-center gap-2 mt-8">
										<Button
											variant="outline"
											disabled={filters.page === 1}
											onClick={() =>
												setFiltersState((prev) => ({
													...prev,
													page: prev.page - 1,
												}))
											}
										>
											Önceki
										</Button>
										<span className="text-sm text-muted-foreground">
											Sayfa {filters.page} /{" "}
											{data.meta.totalPages}
										</span>
										<Button
											variant="outline"
											disabled={
												filters.page ===
												data.meta.totalPages
											}
											onClick={() =>
												setFiltersState((prev) => ({
													...prev,
													page: prev.page + 1,
												}))
											}
										>
											Sonraki
										</Button>
									</div>
								)}
						</>
					)}
				</div>
			</div>
		</div>

		<BicycleFinder
			open={bicycleFinderOpen}
			onOpenChange={setBicycleFinderOpen}
			onFilter={(h, i) => setFilters({ riderHeight: h, riderInseam: i })}
		/>
		</>
	);
}

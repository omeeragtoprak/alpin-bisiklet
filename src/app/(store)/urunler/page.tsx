"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
	Filter,
	Grid,
	List,
	LayoutGrid,
	SlidersHorizontal,
	X,
	Search,
	Bike,
	ChevronDown,
	ChevronUp,
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
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { BicycleFinder } from "@/components/store/bicycle-finder/bicycle-finder";

// ─── Filtre Sidebar ────────────────────────────────────────────────────────────
// Checkbox ile çoklu seçim. "Filtre Uygula"ya basılana kadar hiç API isteği gitmez.

interface FilterSidebarProps {
	urlKategoriler: string[];
	urlMarkalar: string[];
	urlMinFiyat: number;
	urlMaxFiyat: number;
	urlStok: boolean;
	pendingKategoriler: string[];
	pendingMarkalar: string[];
	pendingMinFiyat: number;
	pendingMaxFiyat: number;
	pendingStok: boolean;
	onToggleKategori: (slug: string) => void;
	onToggleMarka: (id: string) => void;
	onPendingMin: (v: number) => void;
	onPendingMax: (v: number) => void;
	onPendingStok: (v: boolean) => void;
	onApply: () => void;
	onReset: () => void;
	categories: any[];
	brands: any[];
	categoriesLoading?: boolean;
	brandsLoading?: boolean;
}

function AccordionSection({
	title,
	children,
	defaultOpen = true,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div>
			<button
				type="button"
				className="flex items-center justify-between w-full py-1 text-sm font-semibold hover:text-primary transition-colors"
				onClick={() => setOpen((v) => !v)}
			>
				{title}
				{open ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>
			{open && <div className="mt-2">{children}</div>}
		</div>
	);
}

function FilterSidebar({
	urlKategoriler,
	urlMarkalar,
	urlMinFiyat,
	urlMaxFiyat,
	urlStok,
	pendingKategoriler,
	pendingMarkalar,
	pendingMinFiyat,
	pendingMaxFiyat,
	pendingStok,
	onToggleKategori,
	onToggleMarka,
	onPendingMin,
	onPendingMax,
	onPendingStok,
	onApply,
	onReset,
	categories,
	brands,
	categoriesLoading,
	brandsLoading,
}: FilterSidebarProps) {
	const hasChanges =
		JSON.stringify([...pendingKategoriler].sort()) !==
			JSON.stringify([...urlKategoriler].sort()) ||
		JSON.stringify([...pendingMarkalar].sort()) !==
			JSON.stringify([...urlMarkalar].sort()) ||
		pendingMinFiyat !== urlMinFiyat ||
		pendingMaxFiyat !== urlMaxFiyat ||
		pendingStok !== urlStok;

	return (
		<div className="flex flex-col h-full">
			{/* Kaydırılabilir filtre alanı */}
			<div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
				{/* Kategoriler */}
				<AccordionSection title="Kategoriler">
					{categoriesLoading ? (
						<div className="space-y-2">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="h-6 bg-muted animate-pulse rounded" />
							))}
						</div>
					) : (
						<div className="space-y-1">
							{categories.map((cat: any) => (
								<label
									key={cat.id}
									className="flex items-center gap-2 cursor-pointer py-1 group"
								>
									<Checkbox
										checked={pendingKategoriler.includes(cat.slug)}
										onCheckedChange={() => onToggleKategori(cat.slug)}
									/>
									<span className="flex-1 text-sm group-hover:text-primary transition-colors">
										{cat.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{cat._count?.products ?? 0}
									</span>
								</label>
							))}
						</div>
					)}
				</AccordionSection>

				<Separator />

				{/* Markalar */}
				<AccordionSection title="Markalar">
					{brandsLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-6 bg-muted animate-pulse rounded" />
							))}
						</div>
					) : brands.length === 0 ? (
						<p className="text-xs text-muted-foreground">Marka bulunamadı.</p>
					) : (
						<div className="space-y-1">
							{brands.map((brand: any) => (
								<label
									key={brand.id}
									className="flex items-center gap-2 cursor-pointer py-1 group"
								>
									<Checkbox
										checked={pendingMarkalar.includes(brand.id.toString())}
										onCheckedChange={() =>
											onToggleMarka(brand.id.toString())
										}
									/>
									<span className="flex-1 text-sm group-hover:text-primary transition-colors">
										{brand.name}
									</span>
									<span className="text-xs text-muted-foreground">
										{brand._count?.products ?? 0}
									</span>
								</label>
							))}
						</div>
					)}
				</AccordionSection>

				<Separator />

				{/* Fiyat Aralığı */}
				<AccordionSection title="Fiyat Aralığı">
					<div className="space-y-3 pt-1">
						<Slider
							min={0}
							max={50000}
							step={500}
							value={[pendingMinFiyat, pendingMaxFiyat]}
							onValueChange={([min, max]) => {
								onPendingMin(min);
								onPendingMax(max);
							}}
						/>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								value={pendingMinFiyat}
								onChange={(e) => onPendingMin(Number(e.target.value))}
								className="h-8 text-xs"
								aria-label="Minimum fiyat"
							/>
							<span className="text-muted-foreground text-xs">-</span>
							<Input
								type="number"
								value={pendingMaxFiyat}
								onChange={(e) => onPendingMax(Number(e.target.value))}
								className="h-8 text-xs"
								aria-label="Maksimum fiyat"
							/>
						</div>
					</div>
				</AccordionSection>

				<Separator />

				{/* Stok */}
				<label className="flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={pendingStok}
						onCheckedChange={(checked) => onPendingStok(!!checked)}
					/>
					<span className="text-sm">Sadece stokta olanlar</span>
				</label>
			</div>

			{/* Sabit butonlar — her zaman altta görünür */}
			<div className="pt-3 border-t mt-2 space-y-2 shrink-0">
				<Button className="w-full" onClick={onApply} disabled={!hasChanges}>
					Filtre Uygula
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="w-full text-muted-foreground"
					onClick={onReset}
				>
					Filtreleri Sıfırla
				</Button>
			</div>
		</div>
	);
}

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [view, setView] = useState<"grid" | "grid4" | "list">("grid");
	const [bicycleFinderOpen, setBicycleFinderOpen] = useState(false);

	// URL → filtre değerleri (tek doğruluk kaynağı)
	const currentTip = searchParams.get("tip") || "";
	const urlKategoriler = (searchParams.get("kategoriler") || "")
		.split(",")
		.filter(Boolean);
	const urlMarkalar = (searchParams.get("markalar") || "")
		.split(",")
		.filter(Boolean);
	const urlMinFiyat = Number(searchParams.get("minFiyat")) || 0;
	const urlMaxFiyat = Number(searchParams.get("maxFiyat")) || 50000;
	const currentStok = searchParams.get("stok") === "true";
	const currentSirala = searchParams.get("sirala") || "newest";
	const currentSayfa = Number(searchParams.get("sayfa")) || 1;
	const currentAra = searchParams.get("ara") || "";
	const currentBoy = Number(searchParams.get("boy")) || 0;
	const currentBacak = Number(searchParams.get("bacak")) || 0;

	// ── Pending filtre state — "Filtre Uygula"ya kadar URL'e yazılmaz ─────────
	const [pendingKategoriler, setPendingKategoriler] = useState<string[]>(urlKategoriler);
	const [pendingMarkalar, setPendingMarkalar] = useState<string[]>(urlMarkalar);
	const [pendingMinFiyat, setPendingMinFiyat] = useState(urlMinFiyat);
	const [pendingMaxFiyat, setPendingMaxFiyat] = useState(urlMaxFiyat);
	const [pendingStok, setPendingStok] = useState(currentStok);

	// URL değişince (back/forward) pending state'i senkronize et
	useEffect(() => {
		setPendingKategoriler(urlKategoriler);
		setPendingMarkalar(urlMarkalar);
		setPendingMinFiyat(urlMinFiyat);
		setPendingMaxFiyat(urlMaxFiyat);
		setPendingStok(currentStok);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.toString()]);

	// Arama input'u — 400ms debounce (anlık arama, Filtre Uygula gerektirmez)
	const [searchInput, setSearchInput] = useState(currentAra);
	const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		setSearchInput(currentAra);
	}, [currentAra]);

	const handleSearchChange = (value: string) => {
		setSearchInput(value);
		clearTimeout(searchTimerRef.current);
		searchTimerRef.current = setTimeout(() => {
			applyToUrl({ ara: value || null, sayfa: null });
		}, 400);
	};

	// URL'e toplu yazma — sadece "Filtre Uygula" ve arama tarafından çağrılır
	function applyToUrl(updates: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value === null || value === "") params.delete(key);
			else params.set(key, value);
		}
		router.replace(`/urunler?${params.toString()}`, { scroll: false });
	}

	// Toggle helpers
	function toggleKategori(slug: string) {
		setPendingKategoriler((prev) =>
			prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
		);
	}
	function toggleMarka(id: string) {
		setPendingMarkalar((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
		);
	}

	// "Filtre Uygula" — tüm pending değerleri bir anda URL'e yaz → tek API isteği
	function applyFilters() {
		applyToUrl({
			kategoriler:
				pendingKategoriler.length > 0
					? pendingKategoriler.join(",")
					: null,
			tip: pendingKategoriler.length > 0 ? null : currentTip,
			markalar: pendingMarkalar.length > 0 ? pendingMarkalar.join(",") : null,
			minFiyat: pendingMinFiyat > 0 ? pendingMinFiyat.toString() : null,
			maxFiyat: pendingMaxFiyat < 50000 ? pendingMaxFiyat.toString() : null,
			stok: pendingStok ? "true" : null,
			sayfa: null,
		});
	}

	// Tüm filtreleri sıfırla
	function clearFilters() {
		router.replace("/urunler", { scroll: false });
		setPendingKategoriler([]);
		setPendingMarkalar([]);
		setPendingMinFiyat(0);
		setPendingMaxFiyat(50000);
		setPendingStok(false);
		setSearchInput("");
	}

	// ── Veriler ────────────────────────────────────────────────────────────────

	const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
		queryKey: ["store-categories"],
		queryFn: async () => {
			const res = await fetch("/api/categories");
			if (!res.ok) throw new Error("Kategoriler yüklenemedi");
			const json = await res.json();
			return json.data || [];
		},
		staleTime: 5 * 60 * 1000,
	});

	const { data: brandsData, isLoading: brandsLoading } = useQuery({
		queryKey: ["store-brands"],
		queryFn: async () => {
			const res = await fetch("/api/brands");
			const json = await res.json();
			return json.data || [];
		},
		staleTime: 5 * 60 * 1000,
	});

	// Ürünler — SADECE URL param'larından beslenir
	const { data, isLoading } = useQuery({
		queryKey: [
			"products",
			urlKategoriler.join(","),
			currentTip,
			urlMarkalar.join(","),
			urlMinFiyat,
			urlMaxFiyat,
			currentStok,
			currentSirala,
			currentSayfa,
			currentAra,
			currentBoy,
			currentBacak,
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.set("page", currentSayfa.toString());
			params.set("limit", "20");
			if (currentAra) params.set("search", currentAra);
			if (urlKategoriler.length > 0)
				params.set("kategoriler", urlKategoriler.join(","));
			else if (currentTip) params.set("categoryType", currentTip);
			if (urlMarkalar.length > 0)
				params.set("markalar", urlMarkalar.join(","));
			if (currentStok) params.set("inStock", "true");
			if (urlMinFiyat > 0) params.set("minPrice", urlMinFiyat.toString());
			if (urlMaxFiyat < 50000)
				params.set("maxPrice", urlMaxFiyat.toString());
			params.set("orderBy", currentSirala.replace(/-/g, "_"));
			if (currentBoy > 0) params.set("riderHeight", currentBoy.toString());
			if (currentBacak > 0)
				params.set("riderInseam", currentBacak.toString());
			const res = await fetch(`/api/products?${params}`);
			return res.json();
		},
	});

	// ── Türev değerler ─────────────────────────────────────────────────────────

	const selectedCategoryType =
		categoriesData?.find((c: any) => urlKategoriler.includes(c.slug))?.type ??
		(currentTip === "BICYCLE" ? "BICYCLE" : "GENERAL");

	const activeFilterCount = [
		urlKategoriler.length > 0 || currentTip,
		urlMarkalar.length > 0,
		urlMinFiyat > 0,
		urlMaxFiyat < 50000,
		currentStok,
		currentBoy > 0,
	].filter(Boolean).length;

	const pageTitle =
		urlKategoriler.length === 1
			? (categoriesData?.find((c: any) => c.slug === urlKategoriler[0])?.name ?? "Ürünler")
			: urlKategoriler.length > 1
				? "Seçili Kategoriler"
				: currentTip === "BICYCLE"
					? "Bisikletler"
					: "Tüm Ürünler";

	// Bisiklet bulucu — ilk kez bisiklet kategorisine girildiğinde aç
	const prevTypeRef = useRef("GENERAL");
	useEffect(() => {
		if (
			selectedCategoryType === "BICYCLE" &&
			prevTypeRef.current !== "BICYCLE"
		) {
			if (!localStorage.getItem("alpin_bike_finder_seen")) {
				setBicycleFinderOpen(true);
			}
		}
		prevTypeRef.current = selectedCategoryType;
	}, [selectedCategoryType]);

	// Seçili kategori/marka isimlerini bul (aktif filtre etiketleri için)
	const selectedCategoryNames = urlKategoriler
		.map((slug) => categoriesData?.find((c: any) => c.slug === slug)?.name)
		.filter(Boolean) as string[];
	const selectedBrandNames = urlMarkalar
		.map((id) => brandsData?.find((b: any) => b.id.toString() === id)?.name)
		.filter(Boolean) as string[];

	// ── Render ─────────────────────────────────────────────────────────────────

	const sharedSidebarProps = {
		urlKategoriler,
		urlMarkalar,
		urlMinFiyat,
		urlMaxFiyat,
		urlStok: currentStok,
		pendingKategoriler,
		pendingMarkalar,
		pendingMinFiyat,
		pendingMaxFiyat,
		pendingStok,
		onToggleKategori: toggleKategori,
		onToggleMarka: toggleMarka,
		onPendingMin: setPendingMinFiyat,
		onPendingMax: setPendingMaxFiyat,
		onPendingStok: setPendingStok,
		onApply: applyFilters,
		onReset: clearFilters,
		categories: categoriesData || [],
		brands: brandsData || [],
		categoriesLoading,
		brandsLoading,
	};

	return (
		<>
			<div className="container mx-auto px-4 py-8">
				{/* Başlık */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold mb-1">{pageTitle}</h1>
					<p className="text-muted-foreground text-sm">
						{data?.meta?.total ?? 0} ürün bulundu
					</p>
				</div>

				<div className="flex gap-8">
					{/* Desktop Sidebar */}
					<aside className="hidden lg:block w-60 shrink-0">
						<div
							className="sticky top-20 flex flex-col"
							style={{ height: "calc(100vh - 6rem)" }}
						>
							<div className="flex items-center gap-2 mb-3 shrink-0">
								<SlidersHorizontal className="h-4 w-4" />
								<h2 className="font-semibold text-sm">Filtreler</h2>
							</div>
							<Separator className="mb-3 shrink-0" />
							<div className="flex-1 min-h-0">
								<FilterSidebar {...sharedSidebarProps} />
							</div>
						</div>
					</aside>

					{/* Ana İçerik */}
					<div className="flex-1 min-w-0">
						{/* Araç Çubuğu */}
						<div className="flex flex-col sm:flex-row gap-3 mb-5">
							{/* Arama */}
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Ürün ara..."
									value={searchInput}
									onChange={(e) => handleSearchChange(e.target.value)}
									className="pl-9"
									aria-label="Ürün arama"
								/>
							</div>
							<div className="flex gap-2 flex-wrap">
								{/* Bisiklet Bulucu */}
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

								{/* Mobil Filtre Sheet */}
								<Sheet>
									<SheetTrigger asChild>
										<Button variant="outline" className="lg:hidden">
											<Filter className="h-4 w-4 mr-2" />
											Filtreler
											{activeFilterCount > 0 && (
												<span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
													{activeFilterCount}
												</span>
											)}
										</Button>
									</SheetTrigger>
									<SheetContent
										side="left"
										className="w-80 overflow-y-auto"
									>
										<SheetHeader>
											<SheetTitle>Filtreler</SheetTitle>
										</SheetHeader>
										<div className="mt-4 pb-8">
											<FilterSidebar {...sharedSidebarProps} />
										</div>
									</SheetContent>
								</Sheet>

								{/* Sıralama */}
								<Select
									value={currentSirala}
									onValueChange={(v) =>
										applyToUrl({ sirala: v, sayfa: null })
									}
								>
									<SelectTrigger className="w-full sm:w-52">
										<SelectValue placeholder="Sırala" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">En Yeni</SelectItem>
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

								{/* Görünüm */}
								<div className="hidden sm:flex gap-1">
									<Button
										variant={view === "grid" ? "default" : "outline"}
										size="icon"
										onClick={() => setView("grid")}
										title="3'lü görünüm"
									>
										<Grid className="h-4 w-4" />
									</Button>
									<Button
										variant={view === "grid4" ? "default" : "outline"}
										size="icon"
										onClick={() => setView("grid4")}
										title="4'lü görünüm"
									>
										<LayoutGrid className="h-4 w-4" />
									</Button>
									<Button
										variant={view === "list" ? "default" : "outline"}
										size="icon"
										onClick={() => setView("list")}
										title="Liste görünümü"
									>
										<List className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Aktif Filtre Etiketleri */}
						{activeFilterCount > 0 && (
							<div className="flex flex-wrap gap-2 mb-4">
								{/* Tip etiketi (bisikletler vs genel) */}
								{currentTip && urlKategoriler.length === 0 && (
									<span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
										{currentTip === "BICYCLE" ? "Bisikletler" : currentTip}
										<button
											type="button"
											onClick={() =>
												applyToUrl({ tip: null, sayfa: null })
											}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								)}
								{/* Seçili kategoriler */}
								{urlKategoriler.map((slug, i) => (
									<span
										key={slug}
										className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
									>
										{selectedCategoryNames[i] || slug}
										<button
											type="button"
											onClick={() => {
												const next = urlKategoriler.filter((s) => s !== slug);
												applyToUrl({
													kategoriler: next.length > 0 ? next.join(",") : null,
													sayfa: null,
												});
											}}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
								{/* Seçili markalar */}
								{urlMarkalar.map((id, i) => (
									<span
										key={id}
										className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
									>
										{selectedBrandNames[i] || `Marka #${id}`}
										<button
											type="button"
											onClick={() => {
												const next = urlMarkalar.filter((m) => m !== id);
												applyToUrl({
													markalar: next.length > 0 ? next.join(",") : null,
													sayfa: null,
												});
											}}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
								{(urlMinFiyat > 0 || urlMaxFiyat < 50000) && (
									<span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
										{urlMinFiyat.toLocaleString("tr-TR")} –{" "}
										{urlMaxFiyat.toLocaleString("tr-TR")} TL
										<button
											type="button"
											onClick={() => {
												applyToUrl({
													minFiyat: null,
													maxFiyat: null,
													sayfa: null,
												});
												setPendingMinFiyat(0);
												setPendingMaxFiyat(50000);
											}}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								)}
								{currentStok && (
									<span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
										Stokta var
										<button
											type="button"
											onClick={() =>
												applyToUrl({ stok: null, sayfa: null })
											}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								)}
								{currentBoy > 0 && (
									<span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-full">
										<Bike className="h-3 w-3" />
										Boy: {currentBoy} cm / Bacak: {currentBacak} cm
										<button
											type="button"
											onClick={() =>
												applyToUrl({
													boy: null,
													bacak: null,
													sayfa: null,
												})
											}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								)}
							</div>
						)}

						{/* Ürün Grid */}
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
										key={`sk-${i}`}
										className="bg-muted animate-pulse rounded-xl aspect-[3/4]"
									/>
								))}
							</div>
						) : data?.data?.length === 0 ? (
							<div className="text-center py-20">
								<p className="text-lg font-semibold">Ürün bulunamadı</p>
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
									{data?.data?.map((product: any, index: number) => (
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
													{product.images?.[0]?.url ? (
														<Image
															src={product.images[0].url}
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
															{product.brand.name}
														</p>
													)}
													<h3 className="font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
														{product.name}
													</h3>
													{product.category?.name && (
														<p className="text-sm text-muted-foreground mb-2">
															{product.category.name}
														</p>
													)}
													<div className="flex items-center gap-2 flex-wrap">
														<span className="font-bold text-primary">
															{Number(
																product.price,
															).toLocaleString("tr-TR")}{" "}
															TL
														</span>
														{product.comparePrice && (
															<span className="text-sm text-muted-foreground line-through">
																{Number(
																	product.comparePrice,
																).toLocaleString("tr-TR")}{" "}
																TL
															</span>
														)}
													</div>
												</div>
											</Link>
										</motion.div>
									))}
								</div>

								{/* Sayfalama */}
								{data?.meta && data.meta.totalPages > 1 && (
									<div className="flex items-center justify-center gap-2 mt-8">
										<Button
											variant="outline"
											disabled={currentSayfa === 1}
											onClick={() =>
												applyToUrl({
													sayfa: (currentSayfa - 1).toString(),
												})
											}
										>
											Önceki
										</Button>
										<span className="text-sm text-muted-foreground">
											Sayfa {currentSayfa} / {data.meta.totalPages}
										</span>
										<Button
											variant="outline"
											disabled={currentSayfa === data.meta.totalPages}
											onClick={() =>
												applyToUrl({
													sayfa: (currentSayfa + 1).toString(),
												})
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
				onFilter={(h, i) =>
					applyToUrl({
						boy: h > 0 ? h.toString() : null,
						bacak: i > 0 ? i.toString() : null,
						sayfa: null,
					})
				}
			/>
		</>
	);
}

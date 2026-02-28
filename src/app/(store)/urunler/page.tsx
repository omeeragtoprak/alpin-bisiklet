"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
	Filter,
	Grid,
	List,
	LayoutGrid,
	SlidersHorizontal,
	X,
	Bike,
	ChevronDown,
	ChevronUp,
	ShoppingCart,
	Heart,
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
import { SidebarBanner } from "@/components/store/banners/sidebar-banner";
import { CategoryBanner } from "@/components/store/banners/category-banner";
import { useCartStore } from "@/store/use-cart-store";
import { authClient } from "@/lib/auth-client";
import { useFavoriteIds, useToggleFavorite } from "@/hooks";
import { useToast } from "@/hooks/use-toast";

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
	hasChanges: boolean;
	/** true = Sheet içinde, butonlar sticky bottom-0 ile gösterilir */
	inSheet?: boolean;
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
	hasChanges,
	inSheet,
	categories,
	brands,
	categoriesLoading,
	brandsLoading,
}: FilterSidebarProps) {

	return (
		<div className="relative">
			{/* İçerik */}
			<div className={`space-y-4 pr-1 ${inSheet ? "pb-28" : "pb-4"}`}>
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
				<div>
					<p className="py-1 text-sm font-semibold">Fiyat Aralığı</p>
					<div className="space-y-3 mt-2">
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
				</div>

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

			{/* Butonlar — sadece Sheet içinde sticky gösterilir, desktop'ta ayrı fixed panel var */}
			{inSheet && (
				<div className="sticky bottom-0 pt-3 pb-3 space-y-2 border-t border-border/40 bg-background/80 backdrop-blur-md">
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
			)}
		</div>
	);
}

// ─── Ürün Kartı ────────────────────────────────────────────────────────────────

function ProductCard({
	product,
	view,
	onAddToCart,
}: {
	product: any;
	view: "grid" | "grid4" | "list";
	onAddToCart: (item: any) => void;
}) {
	const router = useRouter();
	const { toast } = useToast();
	const { data: session } = authClient.useSession();
	const favoriteIds = useFavoriteIds();
	const toggleFavorite = useToggleFavorite();
	const isFavorited = favoriteIds.has(product.id);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onAddToCart({
			id: product.id.toString(),
			name: product.name,
			price: product.price,
			image: product.images?.[0]?.url || "",
			slug: product.slug,
			category: product.category?.name || "",
		});
		toast({ title: "Sepete Eklendi", description: product.name });
	};

	const handleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!session?.user) { router.push("/giris"); return; }
		toggleFavorite.mutate(product.id, {
			onSuccess: (res: { removed: boolean }) => {
				toast({ title: res.removed ? "Favorilerden çıkarıldı" : "Favorilere eklendi", description: product.name });
			},
			onError: () => { toast({ title: "Bir hata oluştu", variant: "destructive" }); },
		});
	};
	if (view === "list") {
		return (
			<div className="group flex bg-background border border-border/60 rounded-xl hover:shadow-md hover:border-border transition-all overflow-hidden">
				{/* Görsel */}
				<Link
					href={`/urunler/${product.slug}`}
					className="relative w-36 sm:w-44 shrink-0 bg-muted overflow-hidden"
				>
					{product.images?.[0]?.url ? (
						<Image
							src={product.images[0].url}
							alt={product.name}
							fill
							className="object-cover"
							sizes="176px"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
							Görsel Yok
						</div>
					)}
					{product.comparePrice > product.price && (
						<div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
							%{Math.round((1 - product.price / product.comparePrice) * 100)} İNDİRİM
						</div>
					)}
					{product.isFeatured && (
						<div className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
							ÖNE ÇIKAN
						</div>
					)}
				</Link>

				{/* İçerik */}
				<div className="flex flex-1 min-w-0 p-4 gap-4 items-center">
					{/* Bilgi */}
					<div className="flex-1 min-w-0">
						{product.brand?.name && (
							<p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
								{product.brand.name}
							</p>
						)}
						<Link href={`/urunler/${product.slug}`}>
							<h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2 mb-1.5 hover:text-primary transition-colors">
								{product.name}
							</h3>
						</Link>
						{product.category?.name && (
							<p className="text-xs text-muted-foreground mb-2">
								{product.category.name}
							</p>
						)}
						<div className="flex items-center gap-1.5">
							{product.stock > 0 ? (
								<>
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
									<span className="text-xs text-emerald-600 dark:text-emerald-400">
										Stokta var
									</span>
								</>
							) : (
								<>
									<span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
									<span className="text-xs text-destructive">Tükendi</span>
								</>
							)}
						</div>
					</div>

					{/* Fiyat + Sepet */}
					<div className="shrink-0 flex flex-col items-end gap-3">
						<div className="text-right">
							<div className="text-lg sm:text-xl font-bold text-primary">
								{Number(product.price).toLocaleString("tr-TR")} TL
							</div>
							{product.comparePrice > product.price && (
								<div className="text-xs text-muted-foreground line-through">
									{Number(product.comparePrice).toLocaleString("tr-TR")} TL
								</div>
							)}
						</div>
						<Button
							size="sm"
							className="gap-1.5 text-xs"
							disabled={product.stock <= 0}
							onClick={() =>
								onAddToCart({
									id: product.id.toString(),
									name: product.name,
									price: product.price,
									image: product.images?.[0]?.url || "",
									slug: product.slug,
									category: product.category?.name || "",
								})
							}
						>
							<ShoppingCart className="h-3.5 w-3.5" />
							{product.stock <= 0 ? "Tükendi" : "Sepete Ekle"}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="group relative">
			{/* Görsel + hover aksiyonları */}
			<div className="relative aspect-square bg-muted rounded-xl overflow-hidden mb-3">
				<Link href={`/urunler/${product.slug}`} className="absolute inset-0">
					{product.images?.[0]?.url ? (
						<Image
							src={product.images[0].url}
							alt={product.name}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 50vw, 33vw"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
							Görsel Yok
						</div>
					)}
				</Link>

				{/* Badge'ler */}
				<div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
					{product.comparePrice > product.price && (
						<span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
							%{Math.round((1 - product.price / product.comparePrice) * 100)} İndirim
						</span>
					)}
					{product.isFeatured && (
						<span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
							Öne Çıkan
						</span>
					)}
					{product.stock <= 0 && (
						<span className="bg-foreground/80 text-background text-[10px] font-bold px-2 py-0.5 rounded-md">
							Tükendi
						</span>
					)}
				</div>

				{/* Kalp butonu — hover'da sağdan gelir */}
				<div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
					<button
						type="button"
						onClick={handleFavorite}
						disabled={toggleFavorite.isPending}
						className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-md hover:text-destructive transition-colors cursor-pointer"
						aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
					>
						<Heart
							className={`h-3.5 w-3.5 transition-colors ${isFavorited ? "fill-destructive text-destructive" : ""}`}
						/>
					</button>
				</div>

				{/* Sepete Ekle overlay — hover'da aşağıdan çıkar */}
				{product.stock > 0 && (
					<div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
						<div className="bg-gradient-to-t from-black/65 via-black/30 to-transparent pt-10 pb-2.5 px-2.5">
							<button
								type="button"
								onClick={handleAddToCart}
								className="w-full bg-white text-black rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
							>
								<ShoppingCart className="h-3.5 w-3.5" />
								Sepete Ekle
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Ürün bilgisi */}
			<Link href={`/urunler/${product.slug}`}>
				{product.brand?.name && (
					<p className="text-xs text-muted-foreground mb-0.5">{product.brand.name}</p>
				)}
				<h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
					{product.name}
				</h3>
				{product.category?.name && (
					<p className="text-xs text-muted-foreground mb-1.5">{product.category.name}</p>
				)}
				<div className="flex items-baseline gap-2 flex-wrap">
					<span className="font-bold text-primary">
						{Number(product.price).toLocaleString("tr-TR")} TL
					</span>
					{product.comparePrice > product.price && (
						<span className="text-xs text-muted-foreground line-through">
							{Number(product.comparePrice).toLocaleString("tr-TR")} TL
						</span>
					)}
				</div>
			</Link>
		</div>
	);
}

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [view, setView] = useState<"grid" | "grid4" | "list">("grid");
	const [bicycleFinderOpen, setBicycleFinderOpen] = useState(false);
	const { addItem } = useCartStore();

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

	// Aktif bağlam tipi: tip param varsa oradan, yoksa seçili kategorinin tipinden
	const activeContextType: string | null = useMemo(() => {
		if (currentTip) return currentTip;
		if (urlKategoriler.length > 0 && categoriesData) {
			const firstCat = categoriesData.find((c: any) => urlKategoriler.includes(c.slug));
			return firstCat?.type ?? null;
		}
		return null;
	}, [currentTip, urlKategoriler, categoriesData]);

	// Bağlama göre filtreli kategoriler — sidebar'da sadece ilgili kategoriler görünür
	const contextCategories: any[] = useMemo(() => {
		if (!categoriesData) return [];
		if (!activeContextType) return categoriesData;
		return categoriesData.filter((c: any) => c.type === activeContextType);
	}, [categoriesData, activeContextType]);

	// Eski değişken adı → geriye dönük uyumluluk
	const selectedCategoryType = activeContextType ?? "GENERAL";

	const activeFilterCount = [
		urlKategoriler.length > 0 || currentTip,
		urlMarkalar.length > 0,
		urlMinFiyat > 0,
		urlMaxFiyat < 50000,
		currentStok,
		currentBoy > 0,
	].filter(Boolean).length;

	const pageTitle = useMemo(() => {
		if (urlKategoriler.length === 1) {
			return categoriesData?.find((c: any) => c.slug === urlKategoriler[0])?.name ?? "Ürünler";
		}
		if (urlKategoriler.length > 1) return "Seçili Kategoriler";
		if (currentTip === "BICYCLE") return "Bisikletler";
		if (currentTip === "CLOTHING") return "Giyim";
		if (currentTip === "GENERAL") return "Aksesuarlar & Yedek Parça";
		return "Tüm Ürünler";
	}, [urlKategoriler, categoriesData, currentTip]);

	// Bağlam tipi değişince uyumsuz kategori seçimlerini URL'den temizle
	const prevContextRef = useRef<string | null>(null);
	useEffect(() => {
		if (
			prevContextRef.current !== null &&
			activeContextType !== null &&
			prevContextRef.current !== activeContextType &&
			categoriesData
		) {
			const compatible = urlKategoriler.filter((slug) => {
				const cat = categoriesData.find((c: any) => c.slug === slug);
				return cat?.type === activeContextType;
			});
			if (compatible.length !== urlKategoriler.length) {
				applyToUrl({
					kategoriler: compatible.length > 0 ? compatible.join(",") : null,
					sayfa: null,
				});
			}
		}
		prevContextRef.current = activeContextType;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeContextType]);

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

	// hasChanges — desktop fixed buton panelinde de kullanılır
	const hasChanges =
		JSON.stringify([...pendingKategoriler].sort()) !==
			JSON.stringify([...urlKategoriler].sort()) ||
		JSON.stringify([...pendingMarkalar].sort()) !==
			JSON.stringify([...urlMarkalar].sort()) ||
		pendingMinFiyat !== urlMinFiyat ||
		pendingMaxFiyat !== urlMaxFiyat ||
		pendingStok !== currentStok;

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
		hasChanges,
		categories: contextCategories,
		brands: brandsData || [],
		categoriesLoading,
		brandsLoading,
	};

	return (
		<>
			<div className="container mx-auto px-4 pb-8 pt-6">
				{/* Başlık */}
				<div className="flex gap-8">
					{/* Desktop Sidebar */}
					<aside className="hidden lg:block w-60 shrink-0">
						<div
							className="sticky top-28 flex flex-col"
							style={{ height: "calc(100vh - 9rem)" }}
						>
							<div className="mb-3 shrink-0">
								<h1 className="text-2xl font-bold mb-0.5">{pageTitle}</h1>
								<p className="text-muted-foreground text-xs">
									{data?.meta?.total ?? 0} ürün bulundu
								</p>
							</div>
							<div className="flex items-center gap-2 mb-3 shrink-0">
								<SlidersHorizontal className="h-4 w-4" />
								<h2 className="font-semibold text-sm">Filtreler</h2>
							</div>
							<Separator className="mb-3 shrink-0" />
							{/* Filtre içeriği scroll eder */}
							<div className="flex-1 overflow-y-auto min-h-0 pr-1">
								<FilterSidebar {...sharedSidebarProps} />
								{/* Sidebar banner */}
								<SidebarBanner />
							</div>
							{/* Butonlar her zaman görünür — sidebar products alanının dışına çıkınca sayfa scroll'u ile kaybolur */}
							<div className="shrink-0 pt-3 pb-3 space-y-2 border-t border-border/40 bg-background">
								<Button
									className="w-full"
									onClick={applyFilters}
									disabled={!hasChanges}
								>
									Filtre Uygula
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="w-full text-muted-foreground"
									onClick={clearFilters}
								>
									Filtreleri Sıfırla
								</Button>
							</div>
						</div>
					</aside>

					{/* Ana İçerik */}
					<div className="flex-1 min-w-0">
						{/* Araç Çubuğu */}
						<div className="flex items-center gap-2 mb-5">
							<div className="flex gap-2 flex-wrap flex-1">
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
										className="w-80 overflow-y-auto p-0"
									>
										<div className="px-6 pt-6 pb-2">
											<SheetHeader>
												<SheetTitle>Filtreler</SheetTitle>
											</SheetHeader>
										</div>
										<div className="px-6">
											<FilterSidebar {...sharedSidebarProps} inSheet />
										</div>
									</SheetContent>
								</Sheet>
							</div>
							<div className="flex items-center gap-2 ml-auto shrink-0">
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

						{/* Kategori banner — kategori seçiliyken gösterilir */}
						{urlKategoriler.length > 0 && <CategoryBanner />}

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
											<ProductCard product={product} view={view} onAddToCart={addItem} />
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

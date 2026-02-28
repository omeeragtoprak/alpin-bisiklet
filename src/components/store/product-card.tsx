"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductListItem } from "@/types";
import { useCartStore } from "@/store/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useFavoriteIds, useToggleFavorite, useActiveDiscounts } from "@/hooks";
import { getProductPricing } from "@/lib/pricing";
import type { ActiveDiscount } from "@/lib/pricing";

interface ProductCardProps {
	product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
	const router = useRouter();
	const { addItem } = useCartStore();
	const { toast } = useToast();
	const { data: session } = authClient.useSession();
	const favoriteIds = useFavoriteIds();
	const toggleFavorite = useToggleFavorite();

	const isFavorited = favoriteIds.has(product.id);
	const { data: discountsData } = useActiveDiscounts();
	const applicable = (discountsData?.data ?? []).filter((d: ActiveDiscount) =>
		d.type === "STORE_WIDE" ||
		(d.type === "CATEGORY" && d.categoryId === product.category?.id) ||
		(d.type === "ON_SALE" && product.comparePrice != null && product.comparePrice > product.price),
	);
	const pricing = getProductPricing(product, applicable);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		addItem({
			id: product.id.toString(),
			name: product.name,
			price: pricing.effectivePrice,
			image: product.images?.[0]?.url || "",
			slug: product.slug,
			category: product.category?.name || "Genel",
		});
		toast({
			title: "Sepete Eklendi",
			description: `${product.name} sepetinize eklendi.`,
		});
	};

	const handleFavorite = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!session?.user) {
			router.push("/giris");
			return;
		}

		toggleFavorite.mutate(product.id, {
			onSuccess: (res) => {
				toast({
					title: res.removed ? "Favorilerden çıkarıldı" : "Favorilere eklendi",
					description: product.name,
				});
			},
			onError: () => {
				toast({ title: "Bir hata oluştu", variant: "destructive" });
			},
		});
	};

	return (
		<div className="group relative bg-card rounded-2xl overflow-hidden border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 h-full flex flex-col">
			{/* Image */}
			<div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted p-3 md:p-6 w-full">
				{product.images?.[0] ? (
					<Image
						src={product.images[0].url}
						alt={product.images[0].alt || product.name}
						fill
						className="object-contain p-4"
						sizes="(max-width: 768px) 50vw, 300px"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
						<Mountain className="h-16 w-16" />
					</div>
				)}

				{/* Badges */}
				<div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 z-10 items-start max-w-[70%]">
					{product.isNew && (
						<span className="bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
							Yeni
						</span>
					)}
					{pricing.isOnSale && (
						<span className="bg-destructive text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
							%{pricing.discountPercent} İndirim
						</span>
					)}
					{pricing.extraDiscount && (
						<span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
							Ek %{Math.round(pricing.extraDiscount.value)} İndirim
						</span>
					)}
					{product.stock <= 0 && (
						<span className="bg-foreground/80 text-background text-[10px] font-bold px-2.5 py-1 rounded-md">
							Tükendi
						</span>
					)}
				</div>

				{/* Favorite button */}
				<div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-10">
					<Button
						size="icon"
						variant="secondary"
						className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:text-destructive"
						onClick={handleFavorite}
						disabled={toggleFavorite.isPending}
						aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
					>
						<Heart
							className={`h-4 w-4 transition-colors ${isFavorited ? "fill-destructive text-destructive" : ""
								}`}
						/>
					</Button>
				</div>
			</div>

			{/* Info */}
			<div className="p-3 md:p-5 flex flex-col flex-1 min-w-0">
				{product.category?.name && (
					<span className="text-[10px] md:text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 md:mb-1.5 truncate">
						{product.category.name}
					</span>
				)}
				<h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2 md:mb-3 group-hover:text-primary transition-colors leading-snug break-words">
					<Link href={`/urunler/${product.slug}`}>{product.name}</Link>
				</h3>

				<div className="mt-auto space-y-2 md:space-y-3">
					<div className="flex items-baseline flex-wrap gap-1 md:gap-2">
						<span className="text-base md:text-xl font-black text-primary truncate max-w-full">
							{pricing.effectivePrice.toLocaleString("tr-TR")} ₺
						</span>
						{pricing.originalPrice && (
							<span className="text-xs md:text-sm text-muted-foreground line-through truncate max-w-full">
								{pricing.originalPrice.toLocaleString("tr-TR")} ₺
							</span>
						)}
					</div>
					<Button
						className="w-full rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm font-semibold hover:brightness-75 transition-all text-center px-2"
						variant="default"
						disabled={product.stock <= 0}
						onClick={handleAddToCart}
					>
						<ShoppingCart className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
						<span className="truncate">Sepete Ekle</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

function Mountain(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
			<path d="m8 3 4 8 5-5 5 15H2L8 3z" />
		</svg>
	);
}

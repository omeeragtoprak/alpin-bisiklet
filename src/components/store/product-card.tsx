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
import { useFavoriteIds, useToggleFavorite } from "@/hooks";
import { getProductPricing } from "@/lib/pricing";

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
	const pricing = getProductPricing(product);

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
			<div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted p-6">
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
				<div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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
							className={`h-4 w-4 transition-colors ${
								isFavorited ? "fill-destructive text-destructive" : ""
							}`}
						/>
					</Button>
				</div>
			</div>

			{/* Info */}
			<div className="p-5 flex flex-col flex-1">
				{product.category?.name && (
					<span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
						{product.category.name}
					</span>
				)}
				<h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug">
					<Link href={`/urunler/${product.slug}`}>{product.name}</Link>
				</h3>

				<div className="mt-auto space-y-3">
					<div className="flex items-baseline gap-2">
						<span className="text-xl font-black text-primary">
							{pricing.effectivePrice.toLocaleString("tr-TR")} ₺
						</span>
						{pricing.originalPrice && (
							<span className="text-sm text-muted-foreground line-through">
								{pricing.originalPrice.toLocaleString("tr-TR")} ₺
							</span>
						)}
					</div>
					<Button
						className="w-full rounded-xl h-10 text-sm font-semibold hover:brightness-75 transition-all"
						variant="default"
						disabled={product.stock <= 0}
						onClick={handleAddToCart}
					>
						<ShoppingCart className="mr-2 h-4 w-4" />
						Sepete Ekle
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

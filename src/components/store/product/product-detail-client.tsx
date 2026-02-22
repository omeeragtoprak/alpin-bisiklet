"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
	ShoppingCart,
	Heart,
	Share2,
	Minus,
	Plus,
	Check,
	ChevronLeft,
	ChevronRight,
	Star,
	Truck,
	RotateCcw,
	Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { useCartStore } from "@/store/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { SimilarProducts } from "@/components/store/product/similar-products";
import { ComplementaryProducts } from "@/components/store/product/complementary-products";
import { useFavoriteIds, useToggleFavorite } from "@/hooks";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type ProductImage = { id: number; url: string; alt?: string | null };
type ProductVariant = { id: number; name: string; sizeLabel?: string | null };
type ProductAttribute = { id: number; key: string; value: string };
type ProductReview = {
	id: number;
	rating: number;
	comment?: string | null;
	user?: { name?: string | null } | null;
};

export type ProductDetailData = {
	id: number;
	slug: string;
	name: string;
	description?: string | null;
	price: number;
	comparePrice?: number | null;
	stock: number;
	sku?: string | null;
	barcode?: string | null;
	weight?: number | null;
	brand?: { name: string } | null;
	category?: { id: number; name: string; slug: string } | null;
	images: ProductImage[];
	variants: ProductVariant[];
	attributes: ProductAttribute[];
	reviews: ProductReview[];
	_count?: { reviews: number };
};

export function ProductDetailClient({ product }: { product: ProductDetailData }) {
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
	const [isZooming, setIsZooming] = useState(false);
	const { addItem } = useCartStore();
	const { toast } = useToast();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const favoriteIds = useFavoriteIds();
	const toggleFavorite = useToggleFavorite();

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			setZoomPos({
				x: ((e.clientX - rect.left) / rect.width) * 100,
				y: ((e.clientY - rect.top) / rect.height) * 100,
			});
		},
		[],
	);

	const prevImage = () => setSelectedImage((i) => Math.max(0, i - 1));
	const nextImage = (total: number) =>
		setSelectedImage((i) => Math.min(total - 1, i + 1));

	const handleAddToCart = () => {
		for (let i = 0; i < quantity; i++) {
			addItem({
				id: product.id.toString(),
				name: product.name,
				price: Number(product.price),
				image: product.images?.[0]?.url || "",
				slug: product.slug,
				category: product.category?.name || "Genel",
			});
		}
		toast({
			title: "Sepete Eklendi",
			description: `${quantity} adet ${product.name} sepete eklendi.`,
		});
	};

	const handleToggleFavorite = () => {
		if (!session?.user) {
			router.push("/giris");
			return;
		}
		toggleFavorite.mutate(product.id, {
			onSuccess: (data) => {
				toast({
					title: data?.removed ? "Favorilerden çıkarıldı" : "Favorilere eklendi",
				});
			},
		});
	};

	const isFavorited = favoriteIds.has(product.id);

	const discount =
		product.comparePrice && product.comparePrice > product.price
			? Math.round(
					((product.comparePrice - product.price) /
						product.comparePrice) *
						100,
				)
			: 0;

	return (
		<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
			{/* Gallery */}
			<div className="space-y-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className={`aspect-square bg-white rounded-2xl overflow-hidden relative border select-none ${
						isZooming ? "cursor-crosshair" : "cursor-zoom-in"
					}`}
					onMouseMove={handleMouseMove}
					onMouseEnter={() => setIsZooming(true)}
					onMouseLeave={() => setIsZooming(false)}
				>
					<div
						className="absolute inset-0"
						style={
							isZooming
								? {
										transform: "scale(2.5)",
										transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
									}
								: {
										transform: "scale(1)",
										transition: "transform 0.25s ease-out",
									}
						}
					>
						{product.images?.[selectedImage]?.url ? (
							<Image
								src={product.images[selectedImage].url}
								alt={
									product.images[selectedImage].alt ||
									product.name
								}
								fill
								className="object-contain p-4"
								sizes="(max-width: 768px) 100vw, 50vw"
								priority
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-muted-foreground">
								Görsel Yok
							</div>
						)}
					</div>

					{discount > 0 && (
						<div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full pointer-events-none">
							%{discount}
						</div>
					)}

					{product.images?.length > 1 && (
						<>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									prevImage();
								}}
								disabled={selectedImage === 0}
								className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-background/80 shadow-md border hover:bg-background transition-opacity disabled:opacity-30"
								aria-label="Önceki fotoğraf"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									nextImage(product.images.length);
								}}
								disabled={
									selectedImage === product.images.length - 1
								}
								className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-background/80 shadow-md border hover:bg-background transition-opacity disabled:opacity-30"
								aria-label="Sonraki fotoğraf"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
							<div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-background/70 text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
								{selectedImage + 1} / {product.images.length}
							</div>
						</>
					)}
				</motion.div>

				{product.images?.length > 1 && (
					<div className="grid grid-cols-5 gap-2">
						{product.images.map((img, idx) => (
							<button
								key={img.id}
								type="button"
								onClick={() => setSelectedImage(idx)}
								className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors relative ${
									selectedImage === idx
										? "border-primary ring-2 ring-primary/20"
										: "border-transparent hover:border-muted-foreground/30"
								}`}
							>
								<Image
									src={img.url}
									alt={`${product.name} ${idx + 1}`}
									fill
									className="object-cover"
									sizes="80px"
								/>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Product Info */}
			<div className="space-y-6">
				<div>
					{product.brand?.name && (
						<p className="text-sm text-primary font-medium mb-1">
							{product.brand.name}
						</p>
					)}
					<h1 className="text-2xl lg:text-3xl font-bold mb-2">
						{product.name}
					</h1>
					{product.category?.name && (
						<p className="text-sm text-muted-foreground">
							{product.category.name}
						</p>
					)}
				</div>

				{/* Price */}
				<div className="flex items-baseline gap-3">
					<span className="text-3xl lg:text-4xl font-bold text-primary">
						{Number(product.price).toLocaleString("tr-TR")} TL
					</span>
					{product.comparePrice && (
						<span className="text-lg text-muted-foreground line-through">
							{Number(product.comparePrice).toLocaleString(
								"tr-TR",
							)}{" "}
							TL
						</span>
					)}
					{discount > 0 && (
						<span className="bg-red-100 text-red-700 text-sm font-semibold px-2 py-0.5 rounded">
							%{discount} İndirim
						</span>
					)}
				</div>

				{product.description && (
					<p className="text-muted-foreground leading-relaxed line-clamp-3">
						{product.description}
					</p>
				)}

				<Separator />

				{/* Stock Status */}
				<div className="flex items-center gap-2">
					{product.stock > 0 ? (
						<>
							<div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
							<span className="text-sm font-medium text-green-600">
								Stokta ({product.stock} adet)
							</span>
						</>
					) : (
						<>
							<div className="h-2.5 w-2.5 rounded-full bg-red-500" />
							<span className="text-sm font-medium text-red-600">
								Stokta Yok
							</span>
						</>
					)}
				</div>

				{/* Variants */}
				{product.variants?.length > 0 && (
					<div>
						<h3 className="text-sm font-semibold mb-2">
							Varyantlar
						</h3>
						<div className="flex flex-wrap gap-2">
							{product.variants.map((v) => (
								<Button
									key={v.id}
									variant="outline"
									size="sm"
									className="text-xs"
								>
									{v.name}
									{v.sizeLabel ? ` (${v.sizeLabel})` : ""}
								</Button>
							))}
						</div>
					</div>
				)}

				{/* Quantity */}
				<div>
					<label className="text-sm font-medium mb-2 block">
						Miktar
					</label>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="icon"
							onClick={() =>
								setQuantity(Math.max(1, quantity - 1))
							}
							disabled={quantity <= 1}
						>
							<Minus className="h-4 w-4" />
						</Button>
						<span className="w-12 text-center font-semibold text-lg">
							{quantity}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={() =>
								setQuantity(
									Math.min(product.stock, quantity + 1),
								)
							}
							disabled={quantity >= product.stock}
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					<div className="flex gap-3">
						<Button
							size="lg"
							className="flex-1 h-12 text-base"
							onClick={handleAddToCart}
							disabled={product.stock === 0}
						>
							<ShoppingCart className="mr-2 h-5 w-5" />
							Sepete Ekle
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="h-12"
							onClick={handleToggleFavorite}
							aria-label={
								isFavorited
									? "Favorilerden çıkar"
									: "Favorilere ekle"
							}
						>
							<Heart
								className={`h-5 w-5 ${
									isFavorited
										? "fill-destructive text-destructive"
										: ""
								}`}
							/>
						</Button>
						<Button size="lg" variant="outline" className="h-12">
							<Share2 className="h-5 w-5" />
							<span className="sr-only">Paylaş</span>
						</Button>
					</div>

					{/* WhatsApp butonu */}
					<a
						href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905321234567"}?text=${encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında bilgi almak istiyorum.\n\n${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/urunler/${product.slug}`)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-3 w-full h-12 rounded-lg border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white px-5 font-semibold text-sm transition-all group"
					>
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-5 w-5 shrink-0"
							aria-hidden="true"
						>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
						</svg>
						<span>WhatsApp ile Bilgi Al</span>
						<span className="ml-auto text-xs font-normal opacity-60 group-hover:opacity-80">
							⚡ Hızlı yanıt
						</span>
					</a>
				</div>

				{/* Trust Badges */}
				<div className="grid grid-cols-2 gap-3">
					{[
						{ icon: Truck, title: "Ücretsiz Kargo", sub: "500 TL üzeri" },
						{ icon: RotateCcw, title: "14 Gün İade", sub: "Koşulsuz iade" },
						{ icon: Shield, title: "Güvenli Ödeme", sub: "256-bit SSL" },
						{ icon: Check, title: "Hızlı Teslimat", sub: "1-3 iş günü" },
					].map((badge) => (
						<div
							key={badge.title}
							className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
						>
							<badge.icon className="h-5 w-5 text-primary shrink-0" />
							<div>
								<p className="font-medium text-xs">
									{badge.title}
								</p>
								<p className="text-[10px] text-muted-foreground">
									{badge.sub}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Tabs — full width, col-span */}
			<div className="lg:col-span-2 mt-4">
				<Tabs defaultValue="description">
					<TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
						<TabsTrigger
							value="description"
							className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
						>
							Açıklama
						</TabsTrigger>
						<TabsTrigger
							value="specs"
							className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
						>
							Özellikler
						</TabsTrigger>
						{product.reviews?.length > 0 && (
							<TabsTrigger
								value="reviews"
								className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
							>
								Değerlendirmeler (
								{product._count?.reviews || 0})
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="description" className="mt-6">
						<div className="prose prose-neutral max-w-none">
							{product.description ? (
								<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
									{product.description}
								</p>
							) : (
								<p className="text-muted-foreground">
									Açıklama bulunmuyor.
								</p>
							)}
						</div>
					</TabsContent>

					<TabsContent value="specs" className="mt-6">
						<Card>
							<CardContent className="pt-6">
								<dl className="space-y-3 text-sm">
									{product.sku && (
										<div className="flex justify-between py-2 border-b">
											<dt className="text-muted-foreground">SKU</dt>
											<dd className="font-medium">{product.sku}</dd>
										</div>
									)}
									{product.barcode && (
										<div className="flex justify-between py-2 border-b">
											<dt className="text-muted-foreground">Barkod</dt>
											<dd className="font-medium">{product.barcode}</dd>
										</div>
									)}
									{product.weight && (
										<div className="flex justify-between py-2 border-b">
											<dt className="text-muted-foreground">Ağırlık</dt>
											<dd className="font-medium">{product.weight} kg</dd>
										</div>
									)}
									{product.brand?.name && (
										<div className="flex justify-between py-2 border-b">
											<dt className="text-muted-foreground">Marka</dt>
											<dd className="font-medium">{product.brand.name}</dd>
										</div>
									)}
									{product.category?.name && (
										<div className="flex justify-between py-2">
											<dt className="text-muted-foreground">Kategori</dt>
											<dd className="font-medium">{product.category.name}</dd>
										</div>
									)}
									{product.attributes?.length > 0 &&
										product.attributes.map((attr) => (
											<div
												key={attr.id}
												className="flex justify-between py-2 border-b"
											>
												<dt className="text-muted-foreground">{attr.key}</dt>
												<dd className="font-medium">{attr.value}</dd>
											</div>
										))}
								</dl>
							</CardContent>
						</Card>
					</TabsContent>

					{product.reviews?.length > 0 && (
						<TabsContent value="reviews" className="mt-6">
							<div className="space-y-4">
								{product.reviews.map((review) => (
									<Card key={review.id}>
										<CardContent className="pt-4">
											<div className="flex items-center gap-3 mb-2">
												<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
													{review.user?.name
														?.charAt(0)
														?.toUpperCase() || "?"}
												</div>
												<div>
													<p className="font-medium text-sm">
														{review.user?.name || "Anonim"}
													</p>
													<div className="flex items-center gap-1">
														{Array.from({ length: 5 }).map((_, i) => (
															<Star
																key={`star-${review.id}-${i}`}
																className={`h-3 w-3 ${
																	i < review.rating
																		? "text-yellow-500 fill-yellow-500"
																		: "text-muted-foreground"
																}`}
															/>
														))}
													</div>
												</div>
											</div>
											{review.comment && (
												<p className="text-sm text-muted-foreground">
													{review.comment}
												</p>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>
					)}
				</Tabs>

				{/* Benzer Ürünler */}
				<SimilarProducts
					productId={product.id}
					categoryName={product.category?.name}
				/>

				{/* İlginizi Çekebilir */}
				<ComplementaryProducts productId={product.id} />
			</div>
		</div>
	);
}

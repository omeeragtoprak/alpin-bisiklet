"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import {
	ShoppingCart,
	Heart,
	Share2,
	Minus,
	Plus,
	Check,
	ChevronRight,
	Star,
	Truck,
	RotateCcw,
	Shield,
} from "lucide-react";
import { useParams } from "next/navigation";
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

export default function ProductDetailPage() {
	const params = useParams();
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const { addItem, openCart } = useCartStore();
	const { toast } = useToast();

	const { data: product, isLoading } = useQuery({
		queryKey: ["product", params.slug],
		queryFn: async () => {
			const res = await fetch(`/api/products/slug/${params.slug}`);
			if (!res.ok) throw new Error("Not found");
			const json = await res.json();
			return json.data;
		},
	});

	const handleAddToCart = () => {
		if (!product) return;
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
		// If we added more than 1, fix quantity in cart (addItem increments by 1 each time)
		toast({
			title: "Sepete Eklendi",
			description: `${quantity} adet ${product.name} sepete eklendi.`,
		});
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="grid lg:grid-cols-2 gap-8">
					<div className="aspect-square bg-muted animate-pulse rounded-2xl" />
					<div className="space-y-4">
						<div className="h-6 bg-muted animate-pulse rounded w-3/4" />
						<div className="h-10 bg-muted animate-pulse rounded w-1/2" />
						<div className="h-20 bg-muted animate-pulse rounded" />
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-20">
					<p className="text-xl font-semibold">Ürün bulunamadı</p>
					<Button asChild className="mt-4">
						<Link href="/urunler">Ürünlere Dön</Link>
					</Button>
				</div>
			</div>
		);
	}

	const discount =
		product.comparePrice && product.comparePrice > product.price
			? Math.round(
				((product.comparePrice - product.price) /
					product.comparePrice) *
				100,
			)
			: 0;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
				<Link href="/" className="hover:text-primary transition-colors">
					Ana Sayfa
				</Link>
				<ChevronRight className="h-3 w-3" />
				<Link
					href="/urunler"
					className="hover:text-primary transition-colors"
				>
					Ürünler
				</Link>
				{product.category && (
					<>
						<ChevronRight className="h-3 w-3" />
						<Link
							href={`/urunler?categoryId=${product.category.id}`}
							className="hover:text-primary transition-colors"
						>
							{product.category.name}
						</Link>
					</>
				)}
				<ChevronRight className="h-3 w-3" />
				<span className="text-foreground font-medium truncate max-w-[200px]">
					{product.name}
				</span>
			</nav>

			<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
				{/* Gallery */}
				<div className="space-y-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="aspect-square bg-white rounded-2xl overflow-hidden relative border"
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
						{discount > 0 && (
							<div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
								%{discount}
							</div>
						)}
					</motion.div>

					{product.images?.length > 1 && (
						<div className="grid grid-cols-5 gap-2">
							{product.images.map(
								(img: any, idx: number) => (
									<button
										key={img.id}
										type="button"
										onClick={() => setSelectedImage(idx)}
										className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors relative ${selectedImage === idx
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
								),
							)}
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

					{/* Short description */}
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
								{product.variants.map((v: any) => (
									<Button
										key={v.id}
										variant="outline"
										size="sm"
										className="text-xs"
									>
										{v.name}
										{v.value ? ` - ${v.value}` : ""}
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
						<Button size="lg" variant="outline" className="h-12">
							<Heart className="h-5 w-5" />
							<span className="sr-only">Favorilere ekle</span>
						</Button>
						<Button size="lg" variant="outline" className="h-12">
							<Share2 className="h-5 w-5" />
							<span className="sr-only">Paylaş</span>
						</Button>
					</div>

					{/* Trust Badges */}
					<div className="grid grid-cols-2 gap-3">
						{[
							{
								icon: Truck,
								title: "Ücretsiz Kargo",
								sub: "500 TL üzeri",
							},
							{
								icon: RotateCcw,
								title: "14 Gün İade",
								sub: "Koşulsuz iade",
							},
							{
								icon: Shield,
								title: "Güvenli Ödeme",
								sub: "256-bit SSL",
							},
							{
								icon: Check,
								title: "Hızlı Teslimat",
								sub: "1-3 iş günü",
							},
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
			</div>

			{/* Tabs */}
			<Tabs defaultValue="description" className="mt-12">
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
										<dt className="text-muted-foreground">
											SKU
										</dt>
										<dd className="font-medium">
											{product.sku}
										</dd>
									</div>
								)}
								{product.barcode && (
									<div className="flex justify-between py-2 border-b">
										<dt className="text-muted-foreground">
											Barkod
										</dt>
										<dd className="font-medium">
											{product.barcode}
										</dd>
									</div>
								)}
								{product.weight && (
									<div className="flex justify-between py-2 border-b">
										<dt className="text-muted-foreground">
											Ağırlık
										</dt>
										<dd className="font-medium">
											{product.weight} kg
										</dd>
									</div>
								)}
								{product.brand?.name && (
									<div className="flex justify-between py-2 border-b">
										<dt className="text-muted-foreground">
											Marka
										</dt>
										<dd className="font-medium">
											{product.brand.name}
										</dd>
									</div>
								)}
								{product.category?.name && (
									<div className="flex justify-between py-2">
										<dt className="text-muted-foreground">
											Kategori
										</dt>
										<dd className="font-medium">
											{product.category.name}
										</dd>
									</div>
								)}
								{product.attributes?.length > 0 &&
									product.attributes.map((attr: any) => (
										<div
											key={attr.id}
											className="flex justify-between py-2 border-b"
										>
											<dt className="text-muted-foreground">
												{attr.name}
											</dt>
											<dd className="font-medium">
												{attr.value}
											</dd>
										</div>
									))}
							</dl>
						</CardContent>
					</Card>
				</TabsContent>

				{product.reviews?.length > 0 && (
					<TabsContent value="reviews" className="mt-6">
						<div className="space-y-4">
							{product.reviews.map((review: any) => (
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
													{review.user?.name ||
														"Anonim"}
												</p>
												<div className="flex items-center gap-1">
													{Array.from({
														length: 5,
													}).map((_, i) => (
														<Star
															key={`star-${review.id}-${i}`}
															className={`h-3 w-3 ${i <
																	review.rating
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
			{product && (
				<SimilarProducts
					productId={product.id}
					categoryName={product.category?.name}
				/>
			)}

			{/* İlginizi Çekebilir */}
			{product && <ComplementaryProducts productId={product.id} />}
		</div>
	);
}
